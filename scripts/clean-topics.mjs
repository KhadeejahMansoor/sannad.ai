// scripts/clean-topics.mjs
//
// Second pass over topics.json. Run after discover-topics.mjs, before
// tag-topics.mjs.
//
// Clustering 81,000 hadiths into 2,000 groups produces two kinds of output
// that should not become pages:
//
//   1. ARTEFACTS. Some clusters are not about a subject at all — they group
//      hadiths by their transmission apparatus. "Duplicate references",
//      "Chain variants", "Fragmentary narrations". Real patterns in the data,
//      and useless as pages: nobody searches for them, and a hundred pages of
//      near-identical isnad fragments is exactly the thin content a search
//      engine reads as a signal about the whole site.
//
//   2. DUPLICATES. At K=2000 the corpus does not contain 2,000 distinct
//      subjects, so the same idea arrives several times under different
//      words — "Wiping over socks", "Ablution with leather socks", "Wiping
//      over leather socks". Three pages competing for one search means none of
//      them ranks. The largest absorbs the rest.
//
// The merge in discover-topics.mjs was skipped on the first run: Voyage
// returned 429 and the step gave up rather than failing the whole job. This
// retries with backoff, so it survives the rate limit.
//
// RUN
//   $env:VOYAGE_API_KEY="..."
//   node scripts/clean-topics.mjs
//   node scripts/clean-topics.mjs --dry-run
//
// Writes topics.json in place, keeping a copy at topics.raw.json so a bad
// threshold can be undone without re-clustering.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FILE = path.join(__dirname, 'topics.json');
const BACKUP = path.join(__dirname, 'topics.raw.json');

// Label vectors are cached because Voyage rate-limits hard on 1,200 short
// strings, and the threshold is something you want to try two or three values
// of. Without this, every retry re-earns the same 429s to arrive at the same
// numbers. Keyed by label, so adding topics only embeds the new ones.
const CACHE = path.join(__dirname, '.topic-vectors.json');

const VOYAGE_KEY = process.env.VOYAGE_API_KEY;
const DRY_RUN = process.argv.includes('--dry-run');

// Two topic names are the same idea above this cosine similarity. 0.86 folds
// "Wiping over socks" into "Ablution with leather socks" while leaving
// "Prayer" and "Night prayer" apart. Raise it if the merge log shows things
// collapsing that should stay separate.
const MERGE_THRESHOLD = Number(process.env.MERGE_THRESHOLD || 0.86);

// Words that mark a cluster as being about transmission rather than subject.
// Matched against the label, case-insensitively.
const ARTEFACT_PATTERNS = [
  /\bduplicate/i,
  /\bchain (repetition|variant|reference|variation)/i,
  /\bincomplete narration/i,
  /\bfragmentary/i,
  /\bmiscellaneous/i,
  /\bvariant narration/i,
  /\btransmission variant/i,
  /\bempty cluster/i,
  /\bnarrator notes/i,
  /^various /i,
];

// A query of "hadith about " with nothing after it means the model had
// nothing to say about the cluster.
function isArtefact(topic) {
  if (!topic.label || !topic.query) return true;
  if (/^hadith about\s*$/i.test(topic.query.trim())) return true;
  return ARTEFACT_PATTERNS.some((re) => re.test(topic.label));
}

function loadCache() {
  try {
    return JSON.parse(fs.readFileSync(CACHE, 'utf8'));
  } catch {
    return {};
  }
}

function normalise(arr) {
  const v = Float32Array.from(arr);
  let sum = 0;
  for (let d = 0; d < v.length; d++) sum += v[d] * v[d];
  const norm = Math.sqrt(sum) || 1;
  for (let d = 0; d < v.length; d++) v[d] /= norm;
  return v;
}

async function embedLabels(labels) {
  const cache = loadCache();
  const vectors = new Array(labels.length);

  // Anything already embedded on a previous run comes straight back.
  const missing = [];
  labels.forEach((label, i) => {
    if (cache[label]) vectors[i] = normalise(cache[label]);
    else missing.push({ label, i });
  });

  const cached = labels.length - missing.length;
  if (cached) console.log(`  ${cached} from cache, ${missing.length} to fetch`);
  if (missing.length === 0) return vectors;

  const BATCH = 96;
  let dirty = false;

  for (let i = 0; i < missing.length; i += BATCH) {
    const group = missing.slice(i, i + BATCH);
    const slice = group.map((m) => m.label);

    // Voyage rate-limits on sustained use. The first run hit 429 and skipped
    // the merge entirely; backing off and retrying is the difference between
    // a clean list and 1,233 half-duplicates.
    let attempt = 0;
    for (;;) {
      const res = await fetch('https://api.voyageai.com/v1/embeddings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${VOYAGE_KEY}`,
        },
        body: JSON.stringify({
          input: slice,
          model: 'voyage-3',
          input_type: 'query',
        }),
      });

      if (res.ok) {
        const json = await res.json();
        for (const item of json.data) {
          const target = group[item.index];
          cache[target.label] = item.embedding;
          vectors[target.i] = normalise(item.embedding);
        }
        dirty = true;
        // Written after every batch, not at the end. A run killed halfway
        // through keeps what it paid for.
        fs.writeFileSync(CACHE, JSON.stringify(cache), 'utf8');
        break;
      }

      if (res.status !== 429 || attempt >= 6) {
        throw new Error(`Voyage ${res.status}: ${(await res.text()).slice(0, 200)}`);
      }

      const wait = 2 ** attempt * 2;
      console.log(`  rate limited — waiting ${wait}s`);
      await new Promise((r) => setTimeout(r, wait * 1000));
      attempt++;
    }

    console.log(`  embedded ${Math.min(i + BATCH, missing.length)}/${missing.length}`);
    // A small gap between batches keeps the limiter happy.
    await new Promise((r) => setTimeout(r, 400));
  }

  if (dirty) console.log(`  cached to ${path.basename(CACHE)}`);
  return vectors;
}

async function main() {
  if (!VOYAGE_KEY) {
    console.error('VOYAGE_API_KEY is not set.');
    process.exit(1);
  }

  const raw = JSON.parse(fs.readFileSync(FILE, 'utf8'));
  const all = raw.topics || [];
  console.log(`Read ${all.length} topics.\n`);

  // ── 1. artefacts ──
  const artefacts = all.filter(isArtefact);
  const subjects = all.filter((t) => !isArtefact(t));

  console.log(`Dropping ${artefacts.length} artefact clusters:`);
  artefacts.slice(0, 20).forEach((t) => console.log(`  ${t.label}`));
  if (artefacts.length > 20) console.log(`  …and ${artefacts.length - 20} more`);

  // ── 2. duplicates ──
  console.log(`\nEmbedding ${subjects.length} labels to find duplicates…`);
  const vectors = await embedLabels(subjects.map((t) => t.label));

  // Largest first, so a merge always folds the smaller into the bigger.
  const order = subjects
    .map((t, i) => ({ i, size: t._clusterSize || 0 }))
    .sort((a, b) => b.size - a.size);

  const absorbedBy = new Array(subjects.length).fill(-1);

  for (let a = 0; a < order.length; a++) {
    const ia = order[a].i;
    if (absorbedBy[ia] !== -1) continue;

    for (let b = a + 1; b < order.length; b++) {
      const ib = order[b].i;
      if (absorbedBy[ib] !== -1) continue;

      const va = vectors[ia];
      const vb = vectors[ib];
      if (!va || !vb) continue;

      let dot = 0;
      for (let d = 0; d < va.length; d++) dot += va[d] * vb[d];
      if (dot >= MERGE_THRESHOLD) absorbedBy[ib] = ia;
    }
  }

  const kept = [];
  const merged = [];

  subjects.forEach((topic, i) => {
    if (absorbedBy[i] === -1) kept.push(topic);
    else merged.push(`${topic.label} → ${subjects[absorbedBy[i]].label}`);
  });

  console.log(`\n${merged.length} merged into others:`);
  merged.slice(0, 30).forEach((m) => console.log(`  ${m}`));
  if (merged.length > 30) console.log(`  …and ${merged.length - 30} more`);

  // Strip the working notes; tag-topics.mjs ignores them, but they clutter the
  // file you have to read.
  const final = kept
    .sort((a, b) => (b._clusterSize || 0) - (a._clusterSize || 0))
    .map(({ slug, label, query, _clusterSize }) => ({ slug, label, query, _clusterSize }));

  console.log(
    `\n${all.length} → ${final.length} topics ` +
    `(${artefacts.length} artefacts, ${merged.length} duplicates removed).`
  );

  if (DRY_RUN) {
    console.log('Dry run — nothing written.');
    return;
  }

  if (!fs.existsSync(BACKUP)) {
    fs.copyFileSync(FILE, BACKUP);
    console.log(`Original kept at ${BACKUP}`);
  }

  fs.writeFileSync(
    FILE,
    JSON.stringify(
      {
        _comment:
          'Cleaned by scripts/clean-topics.mjs. Artefact clusters and duplicate ' +
          'labels removed. Read it before running tag-topics.mjs — delete any ' +
          'topic you would not want as a page.',
        topics: final,
      },
      null,
      2
    ),
    'utf8'
  );

  console.log(`\nWrote ${final.length} topics to ${FILE}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
