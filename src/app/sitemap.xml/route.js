// src/app/sitemap.xml/route.js
//
// The sitemap index. ~81,000 hadiths is past the 50,000-URL ceiling Google
// puts on a single sitemap, so this file lists the chunks and each chunk is
// served by /sitemaps/<n>.xml.
//
// Written as an explicit route handler rather than Next's app/sitemap.js
// convention: the convention runs generateSitemaps during the build, which
// means a build that cannot reach the database fails outright. This renders
// on request instead.

import { pool } from '@/lib/db';

const SITE = 'https://sannad.ai';

// Comfortably under the 50,000 limit, leaving room to grow without changing
// the chunk count mid-flight.
const CHUNK = 40000;

// Cached for a day. The corpus is fixed; this just avoids counting 81,000
// rows on every crawler request.
export const revalidate = 86400;

export async function GET() {
  let chunks = 1;

  try {
    const { rows } = await pool.query('SELECT COUNT(*)::int AS n FROM hadiths');
    chunks = Math.max(1, Math.ceil((rows[0]?.n ?? 0) / CHUNK));
  } catch (error) {
    // A failed count shouldn't serve a 500 to Googlebot. One chunk is a
    // truthful floor — the rest surface on the next fetch.
    console.error('sitemap index count failed:', error);
  }

  const lastmod = new Date().toISOString();

  const entries = [
    // Hadith pages, split by the 50,000-URL ceiling.
    ...Array.from({ length: chunks }, (_, i) => `${SITE}/sitemaps/${i}.xml`),
    // Topic and collection pages. Far fewer, and listed separately so their
    // crawl isn't queued behind 81,000 hadiths — these are the pages with a
    // real chance of ranking for a subject search, and the ones a crawler
    // should see first.
    `${SITE}/sitemaps/topics.xml`,
  ];

  const body =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    entries.map((loc) =>
      `  <sitemap>\n` +
      `    <loc>${loc}</loc>\n` +
      `    <lastmod>${lastmod}</lastmod>\n` +
      `  </sitemap>\n`
    ).join('') +
    `</sitemapindex>\n`;

  return new Response(body, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=0, s-maxage=86400',
    },
  });
}