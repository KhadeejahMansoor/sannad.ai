// src/app/sitemaps/[chunk]/route.js
//
// One chunk of the sitemap, e.g. /sitemaps/0.xml. The index at /sitemap.xml
// lists however many of these the row count calls for.

import { pool } from '@/lib/db';
import { hadithSlug } from '@/lib/hadithUrl';

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

export async function GET(_request, { params }) {
  const { chunk } = await params;

  // The route matches "0.xml", "1.xml" — strip the extension before parsing.
  const index = parseInt(String(chunk).replace(/\.xml$/, ''), 10);
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