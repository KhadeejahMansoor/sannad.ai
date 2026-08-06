// src/app/sitemaps/[chunk]/route.js
//
// One chunk of the sitemap, e.g. /sitemaps/0.xml. The index at /sitemap.xml
// lists however many of these the row count calls for.

import { pool } from '@/lib/db';
import { hadithSlug } from '@/lib/hadithUrl';
import { getTopics } from '@/lib/topics';
import { COMPILER_SLUGS } from '@/lib/compilerSlug';

const SITE = 'https://sannad.ai';
const AZAMI = 'الأعظمي';
const CHUNK = 40000;

export const revalidate = 86400;

// & < > " ' are all illegal raw in XML. Slugs are alphanumeric in practice,
// but a sitemap that silently emits malformed XML is worse than one that is
// slightly over-careful.
function xmlEscape(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function xmlUrl(loc, changefreq, priority) {
  return `  <url>\n` +
         `    <loc>${xmlEscape(loc)}</loc>\n` +
         `    <changefreq>${changefreq}</changefreq>\n` +
         `    <priority>${priority}</priority>\n` +
         `  </url>\n`;
}

async function topicsSitemap() {
  let topics = [];
  try {
    topics = await getTopics();
  } catch (error) {
    console.error('topic sitemap query failed:', error);
    return new Response('Temporarily unavailable', { status: 503 });
  }

  const urls = [
    // Higher priority than an individual hadith: these are the entry points a
    // reader arrives on, and the pages the rest link out from.
    xmlUrl(`${SITE}/topic`, 'weekly', '0.9'),
    ...topics.map((t) => xmlUrl(`${SITE}/topic/${t.slug}`, 'monthly', '0.8')),
    ...COMPILER_SLUGS.map((c) => xmlUrl(`${SITE}/${c.slug}`, 'weekly', '0.9')),
  ];

  const body =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    urls.join('') +
    `</urlset>\n`;

  return new Response(body, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=0, s-maxage=86400',
    },
  });
}

export async function GET(_request, { params }) {
  const { chunk } = await params;
  const name = String(chunk).replace(/\.xml$/, '');

  // /sitemaps/topics.xml — the topic and collection pages, listed apart from
  // the hadiths. There are ~1,150 of them against 81,000 hadith pages, and
  // they are the ones that can rank for a subject search rather than an exact
  // reference; burying them in chunk three means they are crawled last.
  if (name === 'topics') return topicsSitemap();

  // The rest match "0.xml", "1.xml".
  const index = parseInt(name, 10);
  if (Number.isNaN(index) || index < 0) {
    return new Response('Not found', { status: 404 });
  }

  let rows = [];
  try {
    // Ordered by id so chunk boundaries stay stable between rebuilds — a URL
    // shouldn't drift from /sitemaps/1.xml to /sitemaps/2.xml overnight.
    const result = await pool.query(
      `
        SELECT
          h.compiler,
          h.hadith_number,
          CASE WHEN h.compiler = $3 THEN 'azami-' ELSE 'sevenbooks-' END
            || h.id::text AS composite_id
        FROM hadiths h
        ORDER BY h.id
        LIMIT $1 OFFSET $2
      `,
      [CHUNK, index * CHUNK, AZAMI]
    );
    rows = result.rows;
  } catch (error) {
    console.error('sitemap chunk query failed:', error);
    return new Response('Temporarily unavailable', { status: 503 });
  }

  if (rows.length === 0 && index > 0) {
    return new Response('Not found', { status: 404 });
  }

  const urls = rows.map((row) => {
    // Prefer the readable slug (AbuDawud1). Rows whose compiler or number
    // don't yield one still get indexed under the composite id rather than
    // dropping out of the sitemap entirely.
    const slug = hadithSlug(row.compiler, row.hadith_number) || row.composite_id;
    return `  <url>\n` +
           `    <loc>${xmlEscape(`${SITE}/${encodeURIComponent(slug)}`)}</loc>\n` +
           `    <changefreq>yearly</changefreq>\n` +
           `    <priority>0.7</priority>\n` +
           `  </url>\n`;
  });

  // The homepage rides along in the first chunk.
  if (index === 0) {
    urls.unshift(
      `  <url>\n` +
      `    <loc>${SITE}</loc>\n` +
      `    <changefreq>weekly</changefreq>\n` +
      `    <priority>1.0</priority>\n` +
      `  </url>\n`
    );
  }

  const body =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    urls.join('') +
    `</urlset>\n`;

  return new Response(body, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=0, s-maxage=86400',
    },
  });
}