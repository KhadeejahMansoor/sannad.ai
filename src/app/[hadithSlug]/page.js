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
import Link from 'next/link';
import { parseHadithSlug, isCompositeId } from '@/lib/hadithUrl';
import { fetchHadithBySlug } from '@/lib/hadithServer';
import { isCompilerSlug, resolveCompiler, getBooks } from '@/lib/collections';
import HadithDetailClient from '../hadith/[hadithId]/HadithDetailClient';

const SITE = 'https://sannad.ai';

// Trim to a clean length without cutting a word in half.
function truncate(text, max) {
  const t = String(text || '').replace(/\s+/g, ' ').trim();
  if (t.length <= max) return t;
  return t.slice(0, t.lastIndexOf(' ', max) || max).trim() + '…';
}

// Some slugs carry a qualifier that distinguishes one work from another but
// isn't how the reference is written or searched. "Nasai Sughra 1" is filed,
// cited and typed as "Nasai 1".
//
// Keyed on the split form, so add entries as "Two Words", not "TwoWords".
const DISPLAY_NAME = {
  'Nasai Sughra': 'Nasai',
};

export async function generateMetadata({ params }) {
  const { hadithSlug } = await params;
  const slug = decodeURIComponent(hadithSlug || '');

  // /AbuDawud — a collection index rather than a single hadith. Told apart by
  // the absence of a trailing number.
  if (isCompilerSlug(slug)) {
    const collection = await resolveCompiler(slug);
    if (!collection) return { title: 'Not found' };

    const name = DISPLAY_NAME[collection.display] || collection.display;
    return {
      title: collection.collectionEnglish,
      description:
        `Browse all ${collection.total.toLocaleString('en-US')} hadith of ` +
        `${collection.collectionEnglish}, book by book, in Arabic and English.`,
      alternates: { canonical: `${SITE}/${encodeURIComponent(slug)}` },
      openGraph: {
        title: collection.collectionEnglish,
        url: `${SITE}/${encodeURIComponent(slug)}`,
        siteName: 'Sannad',
        type: 'website',
      },
    };
  }

  const result = await fetchHadithBySlug(slug);
  if (!result) {
    return { title: 'Hadith not found' };
  }

  const { hadith } = result;

  // The compiler name is read off the slug the reader is already looking at,
  // so /Azami1 is titled "Azami 1" and /AbuDawud1 is "Abu Dawud 1".
  //
  // Taken from the raw slug text rather than parseHadithSlug: the parser
  // returns nothing for some shapes, and every fallback below is wrong in at
  // least one case. collection_english holds the book's title, not the
  // compiler's — Azami's is "Jami al-Kamil", which titled /Azami1 as
  // "Kamil 1". The database `compiler` column is Arabic (أبو داود).
  //
  // Composite ids (sevenbooks-59726) carry no compiler, so they fall through.
  const fromSlug = isCompositeId(slug)
    ? ''
    : slug
        .replace(/\d+$/, '')            // drop the trailing hadith number
        .replace(/[-_]+/g, ' ')          // Abu-Dawud → Abu Dawud
        .replace(/([a-z])([A-Z])/g, '$1 $2') // AbuDawud → Abu Dawud
        .trim();

  // Only reached by those composite-id links.
  const fromCollection = String(hadith.collection_english || '')
    .replace(/^(Sunan|Sahih|Jami['`’]?|Muwatta|Musnad)\s+/i, '')
    // "al-Bukhari" / "at-Tirmidhi" / "an-Nasai" — the article is part of the
    // formal name but nobody searches for it, so it goes.
    .replace(/^(al|at|an|as|ash)-/i, '')
    .trim();

  const rawCompiler = fromSlug || fromCollection || hadith.compiler || 'Hadith';
  const compiler = DISPLAY_NAME[rawCompiler] || rawCompiler;
  const number = hadith.hadith_number ?? '';
  const label = `${compiler} ${number}`.trim();

  // The reference alone. The brand was tried as a prefix and pushed the part
  // that identifies the page off the end of a narrow tab; Google shows the
  // domain beside the title anyway, so repeating it here buys nothing.
  const title = label;

  // The description is the hadith itself where possible — it is what a reader
  // searching a phrase is actually looking for, and it is what Google shows
  // under the link.
  const body = hadith.hadith_text || hadith.hadith_text_arabic || '';
  const description = body
    ? truncate(body, 155)
    : `Read ${label} in Arabic and English on Sannad, with chain of narration and grading.`;

  const canonical = `${SITE}/${encodeURIComponent(slug)}`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: 'Sannad',
      type: 'article',
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
  };
}

export default async function Page({ params }) {
  const { hadithSlug } = await params;
  const slug = decodeURIComponent(hadithSlug || '');

  // /AbuDawud — the collection index. A plain list of books, each linking to
  // its own page. Nothing interactive: the reader at /desktopcompiler is where
  // people browse; this is the path a crawler follows to reach every hadith.
  if (isCompilerSlug(slug)) {
    const collection = await resolveCompiler(slug);
    if (!collection) notFound();

    const books = await getBooks(collection.dbValue);

    return (
      <div className="min-h-screen w-full bg-[#F6F4F1]">
        <div className="max-w-[900px] mx-auto px-4 md:px-8 py-10">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            {collection.collectionEnglish}
          </h1>
          <p className="text-sm text-gray-600 mb-8">
            {collection.total.toLocaleString('en-US')} hadith across {books.length} books
          </p>

          <ul className="flex flex-col gap-2">
            {books.map((book) => (
              <li key={book.slug}>
                <Link
                  href={`/${encodeURIComponent(slug)}/${book.slug}`}
                  className="flex items-baseline justify-between gap-4 bg-white rounded-[5px] px-4 py-3 hover:bg-[#EFE7E4] transition-colors"
                >
                  <span className="text-sm text-[#523230] font-medium">{book.name}</span>
                  <span className="text-xs text-gray-500 whitespace-nowrap">
                    {book.total.toLocaleString('en-US')}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

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