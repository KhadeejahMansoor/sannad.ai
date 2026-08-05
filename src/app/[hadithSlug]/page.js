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
import { isCompilerSlug, COMPILER_SLUGS } from '@/lib/compilerSlug';
import { translateGrade } from '@/lib/i18n';
import { formatGrader } from '@/lib/graders';
import HadithDetailClient from '../hadith/[hadithId]/HadithDetailClient';
import HadithByCompiler from '@/component/HadithByCompiler';

const SITE = 'https://sannad.ai';

// Trim to a clean length without cutting a word in half.
function truncate(text, max) {
  const t = String(text || '').replace(/\s+/g, ' ').trim();
  if (t.length <= max) return t;
  return t.slice(0, t.lastIndexOf(' ', max) || max).trim() + '…';
}

// The reference a page is titled and cited by — "Abu Dawud 1".
// Shared by the metadata and the structured data so the two can't drift.
function labelFor(slug, hadith) {
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
  return label;
}

// Structured data for a single hadith.
//
// A block of JSON in the head, invisible on the page, telling Google what this
// page *is* rather than leaving it to infer from the prose: a specific saying,
// from a named collection, in a named book and chapter, on the authority of a
// named narrator, with a grading.
//
// Modelled as CreativeWork. There is no schema.org type for hadith, and
// inventing one gains nothing — the value is in the fields, which Google reads
// whether or not it recognises the genre.
function hadithJsonLd(hadith, slug, label) {
  const url = `${SITE}/${encodeURIComponent(slug)}`;
  const body = hadith.hadith_text || hadith.hadith_text_english || '';

  // alternateName carries the Arabic alongside the English throughout. Both
  // are the real name of the thing; which one is "the" name depends on who is
  // reading.
  // formatGrader owns the naming: it maps the Arabic column to English, pairs
  // each grader with the description that row actually carries, and returns
  // null for the placeholder values that mean "no grading applies".
  const graderEn = formatGrader(hadith, false);
  const graderAr = formatGrader(hadith, true);

  const partOf = [
    hadith.collection_english && {
      '@type': 'Book',
      name: hadith.collection_english,
      alternateName: hadith.collection || undefined,
    },
    hadith.book_stripped_english && {
      '@type': 'CreativeWork',
      name: hadith.book_stripped_english,
      alternateName: hadith.book_stripped || undefined,
    },
  ].filter(Boolean);

  return {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    '@id': url,
    url,
    name: label,
    // The chapter is the subject line the hadith was filed under — the closest
    // thing the data has to a topic, and the wording a reader would search.
    about: [hadith.chapter_stripped_english, hadith.chapter_stripped].filter(Boolean),
    headline: hadith.chapter_stripped_english || label,
    text: body || undefined,
    inLanguage: ['en', 'ar'],
    // The narrator is the source of the report, not its author, but `author`
    // is the field consumers actually read.
    author: hadith.english_narrator
      ? {
          '@type': 'Person',
          name: hadith.english_narrator,
          alternateName: hadith.machine_clause || undefined,
        }
      : undefined,
    isPartOf: partOf.length ? partOf : undefined,
    // Grading is the one piece of scholarly apparatus a reader checks first,
    // so it is published rather than left buried in the page.
    //
    // Both scripts are given. The column stores Arabic, which is what a reader
    // of the Arabic card expects and what an Arabic-language search would
    // match; the transliteration is what an English-language crawler can read.
    // Publishing one and discarding the other loses half the audience.
    ...(hadith.grade || graderEn?.name
      ? {
          additionalProperty: [
            hadith.grade && {
              '@type': 'PropertyValue',
              name: 'Grade',
              value: translateGrade(hadith.grade),
            },
            hadith.grade && {
              '@type': 'PropertyValue',
              name: 'Grade (Arabic)',
              value: hadith.grade,
            },
            graderEn?.name && {
              '@type': 'PropertyValue',
              name: 'Graded by',
              value: graderEn.descriptor
                ? `${graderEn.name} (${graderEn.descriptor})`
                : graderEn.name,
            },
            graderAr?.name && {
              '@type': 'PropertyValue',
              name: 'Graded by (Arabic)',
              value: graderAr.descriptor
                ? `${graderAr.name} (${graderAr.descriptor})`
                : graderAr.name,
            },
          ].filter(Boolean),
        }
      : {}),
    isAccessibleForFree: true,
    publisher: { '@type': 'Organization', name: 'Sannad', url: SITE },
  };
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

  // /AbuDawud — a collection rather than a single hadith. Told apart by the
  // absence of a trailing number.
  //
  // No database call here. This used to count the collection's rows to build
  // the description, which meant a GROUP BY across all 81,000 hadiths on every
  // page load — slow enough that Ahmad timed out and returned a server error,
  // and slow enough that the metadata never resolved, leaving the tab showing
  // the bare URL. The compiler list is a fixed set in lib/i18n; the slug is
  // either in it or it isn't.
  if (isCompilerSlug(slug)) {
    const match = COMPILER_SLUGS.find(
      (entry) => entry.slug.toLowerCase() === slug.toLowerCase()
    );
    if (!match) return { title: 'Not found' };

    const name = DISPLAY_NAME[match.key] || match.key;

    return {
      title: name,
      description: `Read the hadith of ${name} in Arabic and English on Sannad.`,
      alternates: { canonical: `${SITE}/${match.slug}` },
      openGraph: {
        title: name,
        url: `${SITE}/${match.slug}`,
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

  const label = labelFor(slug, hadith);

  // The reference alone. The brand was tried as a prefix and pushed the part
  // that identifies the page off the end of a narrow tab; Google shows the
  // domain beside the title anyway, so repeating it here buys nothing.
  const title = label;

  // The description is the hadith itself where possible — it is what a reader
  // searching a phrase is actually looking for, and it is what Google shows
  // under the link.
  // The description is what Google prints under the link — and, unlike the
  // title, it appears nowhere in the browser. So the chapter goes here: it is
  // the only wording on the page that names the hadith's subject, and without
  // it a search for "hadith about seeking privacy" has nothing to match.
  //
  // Chapter first, then the hadith itself, because the chapter is the part a
  // reader scanning results is deciding on. Around 155 characters is what
  // Google shows before cutting.
  const body = hadith.hadith_text || hadith.hadith_text_arabic || '';
  const topic = String(hadith.chapter_stripped_english || '').trim();

  let description;
  if (topic && body) {
    // Reserve room for the chapter and the separator so the hadith is what
    // gets trimmed, never the topic.
    description = `${topic} — ${truncate(body, Math.max(40, 155 - topic.length - 3))}`;
  } else if (body) {
    description = truncate(body, 155);
  } else if (topic) {
    description = `${topic} — ${label} on Sannad, in Arabic and English.`;
  } else {
    description = `Read ${label} in Arabic and English on Sannad, with chain of narration and grading.`;
  }

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

  // /AbuDawud — the collection reader. Renders exactly what
  // /desktopcompiler?compiler=Abu+Dawud renders; the compiler arrives as a
  // prop instead of a query param, and nothing about the UI changes.
  if (isCompilerSlug(slug)) {
    const match = COMPILER_SLUGS.find(
      (entry) => entry.slug.toLowerCase() === slug.toLowerCase()
    );
    if (!match) notFound();

    return (
      <div className="min-h-screen w-full bg-[#F6F4F1] ">
        <HadithByCompiler compiler={match.key} />
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

  const jsonLd = hadithJsonLd(result.hadith, slug, labelFor(slug, result.hadith));

  return (
    <>
      {/* Invisible to a reader; read by search engines. Rendered on the server
          alongside the page so it is in the initial HTML rather than injected
          later. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HadithDetailClient
        hadithId={slug}
        initialHadith={result.hadith}
        initialNeighbors={result.neighbors}
      />
    </>
  );
}