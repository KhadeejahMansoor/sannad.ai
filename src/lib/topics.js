// src/lib/topics.js
//
// Reads the hadith_topics table written by scripts/tag-topics.mjs.
//
// The topic pages exist to answer searches the hadith pages can't. A page for
// a single hadith matches someone who already knows the reference; nothing on
// the site was *about* patience, so "hadith about patience" had nothing to
// land on. These give it somewhere.

import { pool } from '@/lib/db';

const AZAMI = 'الأعظمي';

// How many hadiths a topic page shows. The table holds up to 300 per topic,
// but the tail is where the matches get loose — and a page of 300 entries is
// no longer a page anyone reads.
const PER_PAGE = 60;

// Every topic, for the index at /topic. Ordered by name rather than count so
// the list reads as a reference rather than a leaderboard.
export async function getTopics() {
  const { rows } = await pool.query(`
    SELECT topic_slug AS slug, topic_label AS label, COUNT(*)::int AS total
    FROM hadith_topics
    GROUP BY topic_slug, topic_label
    ORDER BY topic_label
  `);
  return rows;
}

// One topic, with the hadiths that matched it most closely.
// Returns null for an unknown slug so the caller can 404.
export async function getTopic(slug) {
  const { rows: meta } = await pool.query(
    `
      SELECT topic_label AS label, COUNT(*)::int AS total
      FROM hadith_topics
      WHERE topic_slug = $1
      GROUP BY topic_label
    `,
    [slug]
  );

  if (meta.length === 0) return null;

  // Joined back to hadiths for the text: the topics table stores only the
  // match, deliberately, so re-running the tagging script never risks
  // overwriting the corpus.
  const { rows: hadiths } = await pool.query(
    `
      SELECT
        h.hadith_number,
        h.compiler,
        NULLIF(TRIM(h.post_clause_english), '') AS text_english,
        h.final_grade                            AS grade,
        m.english                                AS english_narrator,
        CASE WHEN h.compiler = $3 THEN 'azami-' ELSE 'sevenbooks-' END
          || h.id::text                          AS composite_id
      FROM hadith_topics t
      JOIN hadiths h ON h.id = t.hadith_id
      LEFT JOIN machine_clauses m ON h.machine_clause = m.machine_clause
      WHERE t.topic_slug = $1
      ORDER BY t.rank
      LIMIT $2
    `,
    [slug, PER_PAGE, AZAMI]
  );

  return {
    slug,
    label: meta[0].label,
    total: meta[0].total,
    hadiths,
  };
}

// The topics a single hadith carries, strongest first. Used to link a hadith
// page back into the topic pages — without those links the topic pages are
// islands that only a sitemap knows about.
export async function getTopicsForHadith(hadithId, limit = 4) {
  const { rows } = await pool.query(
    `
      SELECT topic_slug AS slug, topic_label AS label
      FROM hadith_topics
      WHERE hadith_id = $1
      ORDER BY similarity DESC
      LIMIT $2
    `,
    [hadithId, limit]
  );
  return rows;
}