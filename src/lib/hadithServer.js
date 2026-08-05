// src/lib/hadithServer.js
//
// Server-side twin of the fetching that used to live in HadithDetailClient.
// Runs during the request on the server, so the hadith text ends up in the
// HTML that Google receives instead of arriving later via the browser.

import { headers } from 'next/headers';
import { parseHadithSlug, isCompositeId } from '@/lib/hadithUrl';
import { compilerToDb } from '@/lib/i18n';

// Absolute origin for server-side fetch. Vercel sets VERCEL_URL; the request
// headers cover local dev and any other host.
async function getOrigin() {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  const h = await headers();
  const host = h.get('x-forwarded-host') || h.get('host');
  const proto = h.get('x-forwarded-proto') || (host?.includes('localhost') ? 'http' : 'https');
  return `${proto}://${host}`;
}

async function getJson(url) {
  try {
    // Cached for an hour. Hadith text does not change between requests, and
    // this keeps the crawler from hammering the API on every one of thousands
    // of pages.
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

// Resolve a readable slug (Abu-Dawud2350) to the composite id the API expects.
// Composite ids are passed through untouched.
export async function resolveHadithId(slug, origin) {
  const parsed = parseHadithSlug(slug);
  if (!parsed) return isCompositeId(slug) ? slug : null;

  const json = await getJson(
    `${origin}/api/hadith/${encodeURIComponent(parsed.number)}` +
    `?compiler=${encodeURIComponent(compilerToDb(parsed.compiler))}`
  );
  return json?.data?.id ?? null;
}

// Returns { hadith, neighbors } or null when the slug does not resolve.
export async function fetchHadithBySlug(slug) {
  const origin = await getOrigin();
  const id = await resolveHadithId(slug, origin);
  if (!id) return null;

  const [hadithJson, neighborsJson] = await Promise.all([
    getJson(`${origin}/api/hadith-by-id/${encodeURIComponent(id)}`),
    getJson(`${origin}/api/hadith-by-id/${encodeURIComponent(id)}/neighbors`),
  ]);

  if (!hadithJson?.success || !hadithJson.data) return null;

  return {
    hadith: hadithJson.data,
    neighbors: neighborsJson?.success ? neighborsJson.data : { prev: null, next: null },
  };
}