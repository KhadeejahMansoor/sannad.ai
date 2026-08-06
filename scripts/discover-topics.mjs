// scripts/discover-topics.mjs
//
// Finds the topics that are actually in the corpus, instead of guessing them.
//
// WHY THIS REPLACES A HAND-WRITTEN LIST
// The first version of this tagging used ~100 topics written by hand. That
// works, but it can only ever find what was on the list — "slaughter" had 200
// hadiths behind it and no page, because nobody thought to write the word
// down. This reads the corpus instead: the embeddings already know which
// hadiths belong together, so the clusters come from the data and only their
// names come from a model.
//
// HOW IT WORKS
//   1. Pull every hadith vector out of Postgres.
//   2. Spherical k-means to group them. Vectors are L2-normalised, so cosine
//      similarity is a dot product and the centroid of a cluster is just the
//      normalised mean — which is what makes k-means valid here at all.
//   3. Drop clusters below MIN_SIZE. A cluster of nine hadiths does not
//      deserve a page; a thousand pages of near-nothing is thin content, and
//      search engines treat it as a signal about the whole site.
//   4. Send each surviving cluster's most central hadiths to Claude and ask
//      for a name and a search phrase.
//   5. Merge duplicates. At K=2000 the corpus will not yield 2000 distinct
//      subjects, so several clusters land on the same idea — "patience",
//      "being patient", "enduring hardship". Left alone those become three
//      pages competing for one search, and a search engine picks none of
//      them. Near-identical names collapse into the largest.
//   6. Write topics.json in the shape scripts/tag-topics.mjs already reads.
//
// BATCH MODE
// Naming thousands of clusters through the normal API costs real money. The
// Batch API is half price for identical work, at the cost of being
// asynchronous — requests are submitted, then polled until done, usually
// within an hour. That trade is obviously right for a script nobody is
// waiting on. Set BATCH=0 to use the synchronous path instead, which is
// worth it below a few hundred clusters where polling overhead dominates.
//
// The output is a draft, not a verdict. Read it, fix the names that are wrong,
// delete the clusters that are incoherent, then run tag-topics.mjs.
//
// RUN
//   $env:DATABASE_URL="..."; $env:ANTHROPIC_API_KEY="..."
//   node scripts/discover-topics.mjs
//
// Options via env: K (clusters to seek), MIN_SIZE (floor for a page),
// ITERATIONS (k-means passes), SEED, BATCH (1 or 0), MERGE_THRESHOLD.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const DATABASE_URL = process.env.DATABASE_URL;
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;

// Ask for more clusters than you want pages. Over-clustering then filtering
// beats under-clustering: a cluster that is too broad ("worship") can't be
// split afterwards, but a cluster that is too small just gets dropped.
const K = Number(process.env.K || 2000);

// A topic page needs enough hadiths to be worth landing on. 25 is a judgement
// call — low enough to keep genuine narrow subjects, high enough to exclude
// clusters that are really just one long hadith and its variants.
const MIN_SIZE = Number(process.env.MIN_SIZE || 25);

const ITERATIONS = Number(process.env.ITERATIONS || 25);
const SEED = Number(process.env.SEED || 42);

// How many hadiths to show the model per cluster. Twenty is enough to see the
// theme; more mostly costs tokens.
const SAMPLE = 20;

// Batch API: half price, asynchronous. Off for small runs where waiting on a
// queue costs more time than the money it saves.
const USE_BATCH = process.env.BATCH !== '0';
const POLL_SECONDS = Number(process.env.POLL_SECONDS || 30);

// Two topic names count as the same idea above this cosine similarity. 0.86
// catches "patience" / "being patient" while leaving "prayer" and "night
// prayer" as separate pages, which they should be.
const MERGE_THRESHOLD = Number(process.env.MERGE_THRESHOLD || 0.86);

// Merging embeds the topic names, which needs the same key the tagging script
// uses. Without it the merge step is skipped rather than failing the run.
const VOYAGE_KEY = process.env.VOYAGE_API_KEY;

const OUT = path.join(__dirname, 'topics.json');

if (!DATABASE_URL) { console.error('DATABASE_URL is not set.'); process.exit(1); }
if (!ANTHROPIC_KEY) { console.error('ANTHROPIC_API_KEY is not set.'); process.exit(1); }

// ── deterministic RNG, so a rerun with the same seed gives the same clusters ──
function makeRng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function normalise(vec) {
  let sum = 0;
  for (let i = 0; i < vec.length; i++) sum += vec[i] * vec[i];
  const norm = Math.sqrt(sum) || 1;
  for (let i = 0; i < vec.length; i++) vec[i] /= norm;
  return vec;
}

// ── load ──────────────────────────────────────────────────────────────
// Fetched in pages rather than one statement. 81,000 rows of 1024 floats
// serialised as text is a large result set, and Supabase cancels a statement
// that runs past its timeout — which the single-query version reliably hit.
// Keyset pagination on id keeps each query small and the whole read resumable.
const PAGE = Number(process.env.PAGE || 2000);

async function loadVectors(pool) {
  console.log('Loading embeddings…');
  const client = await pool.connect();
  const items = [];

  try {
    let afterId = 0;

    for (;;) {
      const { rows } = await client.query(
        `
          SELECT
            h.id,
            h.compiler,
            h.hadith_number,
            NULLIF(TRIM(h.post_clause_english), '')      AS text_english,
            NULLIF(TRIM(h.chapter_stripped_english), '') AS chapter,
            h.embedding::text                            AS vec
          FROM hadiths h
          WHERE h.embedding IS NOT NULL
            AND h.id > $1
          ORDER BY h.id
          LIMIT $2
        `,
        [afterId, PAGE]
      );

      if (rows.length === 0) break;

      for (const row of rows) {
        // pgvector serialises as "[0.1,0.2,…]". Parsing text is wasteful but it
        // avoids registering a driver-level vector type for a script that runs
        // once in a while.
        items.push({
          id: row.id,
          compiler: row.compiler,
          number: row.hadith_number,
          text: row.text_english,
          chapter: row.chapter,
          vec: normalise(Float32Array.from(row.vec.slice(1, -1).split(',').map(Number))),
        });
      }

      afterId = rows[rows.length - 1].id;
      process.stdout.write(`\r  ${items.length} hadiths`);

      if (rows.length < PAGE) break;
    }

    console.log(`\r  ${items.length} hadiths`);
    return items;
  } finally {
    client.release();
  }
}

// ── spherical k-means ─────────────────────────────────────────────────
function kmeans(items, k, iterations, rng) {
  const dim = items[0].vec.length;
  const n = items.length;

  // k-means++ seeding. Random seeding on 81,000 points regularly produces a
  // handful of enormous clusters and a long tail of near-empty ones.
  console.log(`Seeding ${k} centroids…`);
  const centroids = [];
  centroids.push(Float32Array.from(items[Math.floor(rng() * n)].vec));

  const closest = new Float64Array(n).fill(Infinity);

  for (let c = 1; c < k; c++) {
    let total = 0;
    for (let i = 0; i < n; i++) {
      let dot = 0;
      const v = items[i].vec;
      const last = centroids[centroids.length - 1];
      for (let d = 0; d < dim; d++) dot += v[d] * last[d];
      const dist = 1 - dot;
      if (dist < closest[i]) closest[i] = dist;
      total += closest[i];
    }

    // Pick proportional to squared distance — the far-from-everything points
    // are the ones that most need their own centroid.
    let target = rng() * total;
    let pick = 0;
    for (let i = 0; i < n; i++) {
      target -= closest[i];
      if (target <= 0) { pick = i; break; }
    }
    centroids.push(Float32Array.from(items[pick].vec));

    if ((c + 1) % 50 === 0) console.log(`  ${c + 1}/${k}`);
  }

  const assignment = new Int32Array(n).fill(-1);

  for (let iter = 0; iter < iterations; iter++) {
    let moved = 0;

    for (let i = 0; i < n; i++) {
      const v = items[i].vec;
      let best = -Infinity;
      let bestIdx = 0;
      for (let c = 0; c < k; c++) {
        const centroid = centroids[c];
        let dot = 0;
        for (let d = 0; d < dim; d++) dot += v[d] * centroid[d];
        if (dot > best) { best = dot; bestIdx = c; }
      }
      if (assignment[i] !== bestIdx) { assignment[i] = bestIdx; moved++; }
    }

    // Recompute centroids as the normalised mean — the spherical part.
    const sums = Array.from({ length: k }, () => new Float64Array(dim));
    const counts = new Int32Array(k);
    for (let i = 0; i < n; i++) {
      const c = assignment[i];
      counts[c]++;
      const v = items[i].vec;
      const s = sums[c];
      for (let d = 0; d < dim; d++) s[d] += v[d];
    }
    for (let c = 0; c < k; c++) {
      if (counts[c] === 0) continue;
      const s = sums[c];
      let norm = 0;
      for (let d = 0; d < dim; d++) norm += s[d] * s[d];
      norm = Math.sqrt(norm) || 1;
      for (let d = 0; d < dim; d++) centroids[c][d] = s[d] / norm;
    }

    console.log(`  iteration ${iter + 1}/${iterations} — ${moved} reassigned`);
    if (moved === 0) break;
  }

  return { centroids, assignment };
}

// ── naming ────────────────────────────────────────────────────────────

// The prompt is identical whichever path sends it, so both stay in step.
function buildPrompt(batch) {
  const described = batch.map((cluster, j) => {
    const lines = cluster.samples
      .map((s) => `  - ${(s.text || s.chapter || '').slice(0, 200)}`)
      .join('\n');
    return `Cluster ${j + 1} (${cluster.size} hadiths):\n${lines}`;
  }).join('\n\n');

  return `Below are ${batch.length} clusters of hadith, each shown with a sample of its most representative texts.

For each cluster, give:
- "label": a short human-readable topic name, 1-3 words, sentence case (e.g. "Slaughter", "Seeking knowledge", "Rights of neighbours")
- "slug": lowercase, hyphenated, URL-safe
- "query": a search phrase someone would type to find these, of the form "hadith about ..."
- "coherent": true if the cluster has a single clear theme, false if it is a grab-bag

Name what the cluster is ACTUALLY about, specifically. Prefer "Slaughter" over "Animals" if that is what the texts show. If a cluster has no single theme, still name it but set coherent to false.

Respond with ONLY a JSON array of ${batch.length} objects, in order, no markdown fences and no preamble.

${described}`;
}

function parseNaming(text, batch, out) {
  const cleaned = String(text || '').replace(/```json|```/g, '').trim();
  let parsed;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    return false;
  }
  if (!Array.isArray(parsed)) return false;

  parsed.forEach((entry, j) => {
    if (!batch[j]) return;
    out.push({ ...entry, size: batch[j].size, index: batch[j].index });
  });
  return true;
}

function chunk(list, size) {
  const out = [];
  for (let i = 0; i < list.length; i += size) out.push(list.slice(i, i + size));
  return out;
}

const ANTHROPIC_HEADERS = {
  'Content-Type': 'application/json',
  'x-api-key': ANTHROPIC_KEY,
  'anthropic-version': '2023-06-01',
};

const MODEL = 'claude-sonnet-4-5';
const BATCH_SIZE = 10;

async function nameClustersSync(clusters) {
  console.log(`\nNaming ${clusters.length} clusters (synchronous)…`);
  const named = [];
  const batches = chunk(clusters, BATCH_SIZE);

  for (let i = 0; i < batches.length; i++) {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: ANTHROPIC_HEADERS,
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 2000,
        messages: [{ role: 'user', content: buildPrompt(batches[i]) }],
      }),
    });

    if (!res.ok) {
      throw new Error(`Anthropic ${res.status}: ${(await res.text()).slice(0, 300)}`);
    }

    const json = await res.json();
    const text = json.content.map((b) => b.text || '').join('');
    if (!parseNaming(text, batches[i], named)) {
      console.warn(`  batch ${i + 1} returned unparseable JSON — skipped`);
    }

    console.log(`  ${Math.min((i + 1) * BATCH_SIZE, clusters.length)}/${clusters.length}`);
  }

  return named;
}

async function nameClustersBatch(clusters) {
  const batches = chunk(clusters, BATCH_SIZE);
  console.log(`\nNaming ${clusters.length} clusters via the Batch API (${batches.length} requests, half price)…`);

  const requests = batches.map((batch, i) => ({
    custom_id: `batch-${i}`,
    params: {
      model: MODEL,
      max_tokens: 2000,
      messages: [{ role: 'user', content: buildPrompt(batch) }],
    },
  }));

  const created = await fetch('https://api.anthropic.com/v1/messages/batches', {
    method: 'POST',
    headers: ANTHROPIC_HEADERS,
    body: JSON.stringify({ requests }),
  });

  if (!created.ok) {
    throw new Error(`Batch create ${created.status}: ${(await created.text()).slice(0, 300)}`);
  }

  const { id } = await created.json();
  console.log(`  submitted as ${id}`);
  console.log('  polling — this usually finishes within the hour, and may take up to 24.');

  // The id is printed above so a run interrupted here can be recovered by
  // fetching the batch's results directly rather than paying to redo the work.
  let results_url = null;
  const started = Date.now();

  while (!results_url) {
    await new Promise((r) => setTimeout(r, POLL_SECONDS * 1000));

    const res = await fetch(`https://api.anthropic.com/v1/messages/batches/${id}`, {
      headers: ANTHROPIC_HEADERS,
    });
    if (!res.ok) {
      throw new Error(`Batch poll ${res.status}: ${(await res.text()).slice(0, 300)}`);
    }

    const status = await res.json();
    const counts = status.request_counts || {};
    const mins = Math.round((Date.now() - started) / 60000);

    console.log(
      `  [${mins}m] ${status.processing_status} — ` +
      `${counts.succeeded || 0} done, ${counts.processing || 0} processing, ` +
      `${counts.errored || 0} errored`
    );

    if (status.processing_status === 'ended') results_url = status.results_url;
  }

  const res = await fetch(results_url, { headers: ANTHROPIC_HEADERS });
  if (!res.ok) {
    throw new Error(`Batch results ${res.status}: ${(await res.text()).slice(0, 300)}`);
  }

  // Results come back as JSONL, one line per request, NOT in submission order —
  // custom_id is what ties a result back to its clusters.
  const body = await res.text();
  const named = [];
  let failed = 0;

  for (const line of body.split('\n')) {
    if (!line.trim()) continue;

    let row;
    try { row = JSON.parse(line); } catch { failed++; continue; }

    if (row.result?.type !== 'succeeded') { failed++; continue; }

    const index = Number(String(row.custom_id).replace('batch-', ''));
    const batch = batches[index];
    if (!batch) { failed++; continue; }

    const text = (row.result.message?.content || []).map((b) => b.text || '').join('');
    if (!parseNaming(text, batch, named)) failed++;
  }

  if (failed) console.warn(`  ${failed} request(s) failed or returned unparseable JSON`);
  return named;
}

function nameClusters(clusters) {
  return USE_BATCH ? nameClustersBatch(clusters) : nameClustersSync(clusters);
}

// ── merging ───────────────────────────────────────────────────────────
//
// At K=2000 the corpus does not contain 2000 distinct subjects, so clusters
// land on the same idea under different words. Three pages about patience
// split the signal between them and none of the three ranks; one page about
// patience, holding all of it, does.
async function mergeDuplicates(topics) {
  if (!VOYAGE_KEY) {
    console.log('\nVOYAGE_API_KEY not set — skipping the merge step.');
    return topics;
  }
  if (topics.length < 2) return topics;

  console.log(`\nMerging near-identical topics among ${topics.length}…`);

  const vectors = [];
  const BATCH = 128;

  for (let i = 0; i < topics.length; i += BATCH) {
    const slice = topics.slice(i, i + BATCH);
    const res = await fetch('https://api.voyageai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${VOYAGE_KEY}`,
      },
      body: JSON.stringify({
        input: slice.map((t) => t.label),
        model: 'voyage-3',
        input_type: 'query',
      }),
    });

    if (!res.ok) {
      console.warn(`  Voyage ${res.status} — skipping the merge step.`);
      return topics;
    }

    const json = await res.json();
    for (const item of json.data) {
      vectors[i + item.index] = normalise(Float32Array.from(item.embedding));
    }
  }

  // Largest first, so a merge always folds the smaller topic into the bigger.
  const order = topics
    .map((t, i) => ({ i, size: t._clusterSize || 0 }))
    .sort((a, b) => b.size - a.size);

  const absorbedBy = new Array(topics.length).fill(-1);

  for (let a = 0; a < order.length; a++) {
    const ia = order[a].i;
    if (absorbedBy[ia] !== -1) continue;

    for (let b = a + 1; b < order.length; b++) {
      const ib = order[b].i;
      if (absorbedBy[ib] !== -1) continue;

      let dot = 0;
      const va = vectors[ia];
      const vb = vectors[ib];
      if (!va || !vb) continue;
      for (let d = 0; d < va.length; d++) dot += va[d] * vb[d];

      if (dot >= MERGE_THRESHOLD) absorbedBy[ib] = ia;
    }
  }

  const kept = [];
  const merged = [];

  topics.forEach((topic, i) => {
    if (absorbedBy[i] === -1) kept.push(topic);
    else merged.push(`${topic.label} → ${topics[absorbedBy[i]].label}`);
  });

  console.log(`  ${merged.length} merged, ${kept.length} kept.`);
  merged.slice(0, 15).forEach((m) => console.log(`    ${m}`));
  if (merged.length > 15) console.log(`    …and ${merged.length - 15} more`);

  return kept;
}

// ── main ──────────────────────────────────────────────────────────────
async function main() {
  const pool = new pg.Pool({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  let items;
  try {
    items = await loadVectors(pool);
  } finally {
    await pool.end();
  }

  if (items.length === 0) {
    console.error('No embeddings found.');
    process.exit(1);
  }

  const rng = makeRng(SEED);
  const { centroids, assignment } = kmeans(items, K, ITERATIONS, rng);

  // Group, then take the members closest to each centroid as the sample —
  // those are the ones that best show what the cluster is.
  const groups = Array.from({ length: K }, () => []);
  items.forEach((item, i) => groups[assignment[i]].push(item));

  const clusters = [];
  groups.forEach((members, index) => {
    if (members.length < MIN_SIZE) return;

    const centroid = centroids[index];
    const scored = members.map((m) => {
      let dot = 0;
      for (let d = 0; d < m.vec.length; d++) dot += m.vec[d] * centroid[d];
      return { item: m, score: dot };
    }).sort((a, b) => b.score - a.score);

    clusters.push({
      index,
      size: members.length,
      samples: scored.slice(0, SAMPLE).map((s) => s.item),
    });
  });

  const dropped = K - clusters.length;
  console.log(
    `\n${clusters.length} clusters of ${MIN_SIZE}+ hadiths. ` +
    `${dropped} below the floor, dropped.`
  );

  const named = await nameClusters(clusters);

  // Two clusters can land on the same name — the corpus really does contain
  // several distinct groups about prayer. Keep the larger, since the smaller
  // one's hadiths will mostly match the survivor anyway.
  const bySlug = new Map();
  for (const entry of named) {
    if (!entry?.slug || !entry?.label || !entry?.query) continue;
    const existing = bySlug.get(entry.slug);
    if (!existing || entry.size > existing.size) bySlug.set(entry.slug, entry);
  }

  const deduped = [...bySlug.values()]
    .sort((a, b) => b.size - a.size)
    .map((t) => ({
      slug: t.slug,
      label: t.label,
      query: t.query,
      _clusterSize: t.size,
      ...(t.coherent === false ? { _review: 'cluster had no single clear theme' } : {}),
    }));

  // Identical slugs are already gone; this catches the ones that mean the same
  // thing in different words.
  const topics = await mergeDuplicates(deduped);

  const flagged = topics.filter((t) => t._review).length;

  fs.writeFileSync(
    OUT,
    JSON.stringify(
      {
        _comment:
          'Generated by scripts/discover-topics.mjs from the corpus itself. ' +
          'Review before use: fix awkward labels, delete anything incoherent, ' +
          'then run scripts/tag-topics.mjs. _clusterSize and _review are notes ' +
          'for you and are ignored by the tagging script.',
        topics,
      },
      null,
      2
    ),
    'utf8'
  );

  console.log(`\nWrote ${topics.length} topics to ${OUT}`);
  if (flagged) console.log(`${flagged} flagged with _review — read those first.`);
  console.log('\nTop 30:');
  topics.slice(0, 30).forEach((t) => {
    console.log(`  ${String(t._clusterSize).padStart(5)}  ${t.label}`);
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
