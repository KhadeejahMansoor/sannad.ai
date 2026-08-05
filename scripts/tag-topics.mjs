// scripts/tag-topics.mjs
//
// Tags every hadith with the topics it is closest to, using the embeddings
// already in the database.
//
// WHY THIS EXISTS
// The hadith pages carry the text, the narrator and the chapter heading, but
// nothing that says what a hadith is *about* in the words a person would type.
// "Hadith about patience" matches nothing, because the word "patience" may
// never appear — the chapter might be titled "Endurance", or nothing at all.
// The embeddings already encode the meaning; this turns that into readable
// labels the site (and a search engine) can use.
//
// HOW IT WORKS
// Each topic in topics.json is embedded with voyage-3 — the same model the
// corpus was embedded with, which is the whole reason the comparison means
// anything. Then, for each topic, Postgres returns the hadiths whose vectors
// sit closest to it. Results go to a new table; nothing existing is touched.
//
// input_type is 'query' for the topics, matching how search/route.js embeds a
// user's search. The corpus was embedded as 'document'. Voyage's asymmetric
// models expect that pairing, and mixing them up quietly degrades the match.
//
// RUN
//   VOYAGE_API_KEY=... DATABASE_URL=... node scripts/tag-topics.mjs
//   VOYAGE_API_KEY=... DATABASE_URL=... node scripts/tag-topics.mjs --dry-run
//
// Safe to re-run: the table is rebuilt from scratch each time, so editing
// topics.json and running again is the normal way to adjust the tagging.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const VOYAGE_URL = 'https://api.voyageai.com/v1/embeddings';
const VOYAGE_KEY = process.env.VOYAGE_API_KEY;
const DATABASE_URL = process.env.DATABASE_URL;

// How many hadiths to keep per topic. 300 is enough to fill a topic page
// several times over while keeping the tail — where matches get loose — out.
const PER_TOPIC = Number(process.env.PER_TOPIC || 300);

// Cosine similarity floor. Below this the match is noise: the vector is
// nearest to this topic only because it had to be nearest to something.
// Worth tuning after looking at the sample output.
const MIN_SIMILARITY = Number(process.env.MIN_SIMILARITY || 0.35);

const DRY_RUN = process.argv.includes('--dry-run');

if (!VOYAGE_KEY) {
  console.error('VOYAGE_API_KEY is not set.');
  process.exit(1);
}
if (!DATABASE_URL) {
  console.error('DATABASE_URL is not set.');
  process.exit(1);
}

const { topics } = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'topics.json'), 'utf8')
);

const pool = new pg.Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// Voyage accepts a batch per call. 100 topics is one or two requests, so the
// whole embedding step costs a fraction of a cent.
async function embedTopics(list) {
  const out = [];
  const BATCH = 64;

  for (let i = 0; i < list.length; i += BATCH) {
    const chunk = list.slice(i, i + BATCH);
    const res = await fetch(VOYAGE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${VOYAGE_KEY}`,
      },
      body: JSON.stringify({
        input: chunk.map((t) => t.query),
        model: 'voyage-3',
        input_type: 'query',
      }),
    });

    if (!res.ok) {
      throw new Error(`Voyage ${res.status}: ${(await res.text()).slice(0, 300)}`);
    }

    const json = await res.json();
    // Voyage returns an index per item; trusting array order would be a quiet
    // way to attach the wrong label to 300 hadiths.
    for (const item of json.data) {
      out[i + item.index] = item.embedding;
    }
    console.log(`  embedded ${Math.min(i + BATCH, list.length)}/${list.length}`);
  }

  return out;
}

async function createTable(client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS hadith_topics (
      topic_slug   text    NOT NULL,
      topic_label  text    NOT NULL,
      hadith_id    integer NOT NULL,
      compiler     text,
      hadith_number text,
      similarity   real    NOT NULL,
      rank         integer NOT NULL,
      PRIMARY KEY (topic_slug, hadith_id)
    )
  `);

  // Both directions get queried: a topic page lists its hadiths, and a hadith
  // page lists its topics.
  await client.query(
    `CREATE INDEX IF NOT EXISTS hadith_topics_slug_rank
       ON hadith_topics (topic_slug, rank)`
  );
  await client.query(
    `CREATE INDEX IF NOT EXISTS hadith_topics_hadith
       ON hadith_topics (hadith_id, similarity DESC)`
  );
}

async function tagTopic(client, topic, vector) {
  const literal = `[${vector.join(',')}]`;

  // <=> is cosine distance in pgvector, so similarity is 1 minus that.
  const { rows } = await client.query(
    `
      SELECT
        h.id,
        h.compiler,
        h.hadith_number,
        1 - (h.embedding <=> $1::vector) AS similarity
      FROM hadiths h
      WHERE h.embedding IS NOT NULL
      ORDER BY h.embedding <=> $1::vector
      LIMIT $2
    `,
    [literal, PER_TOPIC]
  );

  const kept = rows.filter((r) => r.similarity >= MIN_SIMILARITY);

  if (!DRY_RUN && kept.length) {
    // One multi-row insert rather than a statement per hadith — 102 topics at
    // 300 rows each is 30,000 inserts otherwise.
    const values = [];
    const params = [];
    kept.forEach((row, i) => {
      const b = i * 7;
      values.push(`($${b + 1},$${b + 2},$${b + 3},$${b + 4},$${b + 5},$${b + 6},$${b + 7})`);
      params.push(
        topic.slug,
        topic.label,
        row.id,
        row.compiler,
        row.hadith_number,
        row.similarity,
        i + 1
      );
    });

    await client.query(
      `INSERT INTO hadith_topics
         (topic_slug, topic_label, hadith_id, compiler, hadith_number, similarity, rank)
       VALUES ${values.join(',')}
       ON CONFLICT (topic_slug, hadith_id) DO NOTHING`,
      params
    );
  }

  return kept;
}

async function main() {
  console.log(`Embedding ${topics.length} topics with voyage-3…`);
  const vectors = await embedTopics(topics);

  const client = await pool.connect();
  try {
    if (!DRY_RUN) {
      await createTable(client);
      // Rebuilt rather than merged: a topic removed from topics.json should
      // disappear, and a reworded query should replace its old matches rather
      // than sit alongside them.
      await client.query('TRUNCATE hadith_topics');
    }

    let total = 0;

    for (let i = 0; i < topics.length; i++) {
      const topic = topics[i];
      const kept = await tagTopic(client, topic, vectors[i]);
      total += kept.length;

      const best = kept[0];
      console.log(
        `[${String(i + 1).padStart(3)}/${topics.length}] ${topic.slug.padEnd(22)} ` +
        `${String(kept.length).padStart(4)} hadiths` +
        (best ? `  top ${best.similarity.toFixed(3)} — ${best.compiler} ${best.hadith_number}` : '  (none above threshold)')
      );
    }

    console.log(`\n${DRY_RUN ? 'Would tag' : 'Tagged'} ${total} rows across ${topics.length} topics.`);
    if (DRY_RUN) console.log('Dry run — nothing was written.');
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
