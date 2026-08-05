// src/app/[hadithSlug]/page.js (Server Component)
//
// Hadiths at the root: sannad.ai/Tirmidhi1, sannad.ai/Abu-Dawud2350.
//
// This is a catch-all for the top level, but it does NOT shadow the real pages.
// Next matches static segments before dynamic ones, so /results,
// /desktopcompiler, /hadith/... and /api/... are all resolved by their own
// routes and never reach this file.
//
// Anything that does reach it and isn't a hadith reference — a typo, a stale
// link, a probe — fails parsing and gets a 404 rather than a broken detail page
// that spins and then says "not found".
//
// /hadith/<slug> still works. Old links (including composite ids like
// sevenbooks-59726) resolve exactly as before; this is an addition, not a
// replacement.
//
// The hadith is now fetched HERE, on the server, rather than in the browser.
// Previously the served HTML said only "Loading hadith...", which is all a
// search engine ever saw. Now the text, the narrator and a real <title> are in
// the initial response.

import { notFound } from 'next/navigation';
import { parseHadithSlug, isCompositeId } from '@/lib/hadithUrl';
import { fetchHadithBySlug } from '@/lib/hadithServer';
import HadithDetailClient from '../hadith/[hadithId]/HadithDetailClient';

const SITE = 'https://sannad.ai';

// Trim to a clean length without cutting a word in half.
function truncate(text, max) {
  const t = String(text || '').replace(/\s+/g, ' ').trim();
  if (t.length <= max) return t;
  return t.slice(0, t.lastIndexOf(' ', max) || max).trim() + '…';
}

export async function generateMetadata({ params }) {
  const { hadithSlug } = await params;
  const slug = decodeURIComponent(hadithSlug || '');

  const result = await fetchHadithBySlug(slug);
  if (!result) {
    return { title: 'Hadith not found — Sannad' };
  }

  const { hadith } = result;
  // `compiler` holds the Arabic name (أبو داود). The title has to be the name
  // people actually type into a search box, so the English collection wins
  // where it exists — "Sunan Abu Dawud" trimmed down to "Abu Dawud", which is
  // how the reference is written and searched.
  const englishName = String(hadith.collection_english || '')
    .replace(/^(Sunan|Sahih|Jami['`’]?|Muwatta|Musnad)\s+/i, '')
    // "al-Bukhari" / "at-Tirmidhi" / "an-Nasai" — the article is part of the
    // formal name but nobody searches for it, so it goes.
    .replace(/^(al|at|an|as|ash)-/i, '')
    .trim();
  const compiler = englishName || hadith.compiler || 'Hadith';
  const number = hadith.hadith_number ?? '';
  const label = `${compiler} ${number}`.trim();

  // The description is the hadith itself where possible — it is what a reader
  // searching a phrase is actually looking for, and it is what Google shows
  // under the link.
  const body = hadith.hadith_text || hadith.hadith_text_arabic || '';
  const description = body
    ? truncate(body, 155)
    : `Read ${label} in Arabic and English on Sannad, with chain of narration and grading.`;

  const canonical = `${SITE}/${encodeURIComponent(slug)}`;

  return {
    title: `${label} — Sannad`,
    description,
    alternates: { canonical },
    openGraph: {
      title: `${label} — Sannad`,
      description,
      url: canonical,
      siteName: 'Sannad',
      type: 'article',
    },
    twitter: {
      card: 'summary',
      title: `${label} — Sannad`,
      description,
    },
  };
}

export default async function Page({ params }) {
  const { hadithSlug } = await params;
  const slug = decodeURIComponent(hadithSlug || '');

  // Composite ids are allowed through so a root-level old-style link resolves
  // too; the client component handles both shapes.
  if (!parseHadithSlug(slug) && !isCompositeId(slug)) notFound();

  const result = await fetchHadithBySlug(slug);

  // A slug that parses but has no row behind it is a 404, not a spinner that
  // resolves into an error card. Google treats the old version as a live page
  // with no content.
  if (!result) notFound();

  return (
    <HadithDetailClient
      hadithId={slug}
      initialHadith={result.hadith}
      initialNeighbors={result.neighbors}
    />
  );
}