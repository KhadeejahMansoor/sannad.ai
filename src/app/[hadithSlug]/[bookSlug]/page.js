// src/app/[hadithSlug]/[bookSlug]/page.js
//
// One book of a collection: /AbuDawud/purification.
//
// Sits under the same dynamic segment as the hadith pages, so the first
// segment here is a compiler slug (AbuDawud), not a hadith one (AbuDawud1) —
// the trailing number is what tells them apart, and a slug with a second
// segment after it can only be a collection.
//
// Every hadith in the book is listed, with its opening text and a link. This
// is the page a crawler walks to reach the individual hadiths; a person
// browsing normally goes through /desktopcompiler instead.

import { notFound } from 'next/navigation';
import Link from 'next/link';
import { isCompilerSlug, resolveCompiler, findBook, getHadithsInBook } from '@/lib/collections';
import { hadithSlug as buildHadithSlug } from '@/lib/hadithUrl';

const SITE = 'https://sannad.ai';

function truncate(text, max) {
  const t = String(text || '').replace(/\s+/g, ' ').trim();
  if (t.length <= max) return t;
  return t.slice(0, t.lastIndexOf(' ', max) || max).trim() + '…';
}

async function load(hadithSlug, bookSlug) {
  const slug = decodeURIComponent(hadithSlug || '');
  if (!isCompilerSlug(slug)) return null;

  const collection = await resolveCompiler(slug);
  if (!collection) return null;

  const book = await findBook(collection.dbValue, decodeURIComponent(bookSlug || ''));
  if (!book) return null;

  return { slug, collection, book };
}

export async function generateMetadata({ params }) {
  const { hadithSlug, bookSlug } = await params;
  const loaded = await load(hadithSlug, bookSlug);
  if (!loaded) return { title: 'Not found' };

  const { slug, collection, book } = loaded;
  const title = `${book.name} — ${collection.collectionEnglish}`;

  return {
    title,
    description:
      `All ${book.total.toLocaleString('en-US')} hadith in the Book of ${book.name} ` +
      `from ${collection.collectionEnglish}, in Arabic and English.`,
    alternates: {
      canonical: `${SITE}/${encodeURIComponent(slug)}/${book.slug}`,
    },
    openGraph: {
      title,
      url: `${SITE}/${encodeURIComponent(slug)}/${book.slug}`,
      siteName: 'Sannad',
      type: 'website',
    },
  };
}

export default async function BookPage({ params }) {
  const { hadithSlug, bookSlug } = await params;
  const loaded = await load(hadithSlug, bookSlug);
  if (!loaded) notFound();

  const { slug, collection, book } = loaded;
  const hadiths = await getHadithsInBook(collection.dbValue, book.name);

  // Chapter headings are printed as the list runs rather than nesting the
  // markup, so the page stays one flat list of links while still showing
  // where each chapter begins.
  let lastChapter = null;

  return (
    <div className="min-h-screen w-full bg-[#F6F4F1]">
      <div className="max-w-[900px] mx-auto px-4 md:px-8 py-10">
        <Link
          href={`/${encodeURIComponent(slug)}`}
          className="text-sm text-[#523230] hover:opacity-75 transition-opacity"
        >
          ← {collection.collectionEnglish}
        </Link>

        <h1 className="text-2xl font-bold text-gray-900 mt-4 mb-1">{book.name}</h1>
        <p className="text-sm text-gray-600 mb-8">
          {book.total.toLocaleString('en-US')} hadith
        </p>

        <ul className="flex flex-col gap-2">
          {hadiths.map((row) => {
            const target =
              buildHadithSlug(collection.dbValue, row.hadith_number) || row.composite_id;

            const chapter = row.chapter;
            const showChapter = chapter && chapter !== lastChapter;
            if (chapter) lastChapter = chapter;

            return (
              <li key={row.composite_id}>
                {showChapter && (
                  <h2 className="text-xs font-medium text-gray-500 mt-6 mb-2 px-1">
                    {chapter}
                  </h2>
                )}
                <Link
                  href={`/${encodeURIComponent(target)}`}
                  className="flex gap-3 bg-white rounded-[5px] px-4 py-3 hover:bg-[#EFE7E4] transition-colors"
                >
                  <span className="text-xs text-gray-500 whitespace-nowrap pt-[2px]">
                    {row.hadith_number}
                  </span>
                  <span className="text-sm text-black leading-[22px]">
                    {truncate(row.text_english, 160) || 'View hadith'}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}