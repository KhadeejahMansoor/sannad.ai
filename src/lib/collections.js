// src/lib/collections.js
//
// Data and naming for the crawlable index pages — /AbuDawud and
// /AbuDawud/purification.
//
// These pages exist because the reader at /desktopcompiler loads 50 hadiths at
// a time as you scroll. That is right for a person and useless to a crawler,
// which reads the HTML once and never scrolls: Google would see the first 50
// hadiths of a collection and nothing else. These pages are plain lists of
// links, server-rendered, giving every hadith page a path in.

import { pool } from '@/lib/db';
import { compilerToDb } from '@/lib/i18n';
// Slug naming lives in its own module because the menus import it from the
// browser, and anything in this file drags `pg` along with it.
import { compilerNameFromSlug } from '@/lib/compilerSlug';
export { compilerSlug, COMPILER_SLUGS, compilerNameFromSlug, isCompilerSlug } from '@/lib/compilerSlug';

const AZAMI = 'الأعظمي';

// Resolve a URL slug to the Arabic value stored in the compiler column, and
// confirm the collection actually exists. Returns null for a slug that names
// no collection, so the caller can 404 rather than render an empty shell.
export async function resolveCompiler(slug) {
  const display = compilerNameFromSlug(slug);
  if (!display) return null;

  const dbValue = compilerToDb(display);
  if (!dbValue) return null;

  const { rows } = await pool.query(
    `
      SELECT h.collection_english, COUNT(*)::int AS total
      FROM hadiths h
      WHERE h.compiler = $1
      GROUP BY h.collection_english
      ORDER BY total DESC
      LIMIT 1
    `,
    [dbValue]
  );

  if (rows.length === 0) return null;

  return {
    display,
    dbValue,
    collectionEnglish: rows[0].collection_english || display,
    total: rows[0].total,
    isAzami: dbValue === AZAMI,
  };
}

// Books in the order they appear in the collection, not alphabetically — a
// reader scanning the list expects Purification before Prayer because that is
// how the book is arranged.
export async function getBooks(dbValue) {
  const { rows } = await pool.query(
    `
      SELECT
        COALESCE(NULLIF(TRIM(h.book_stripped_english), ''), TRIM(h.book_stripped)) AS name,
        NULLIF(TRIM(h.book_stripped), '')  AS name_arabic,
        COUNT(*)::int                       AS total,
        MIN(h.id)                           AS first_id
      FROM hadiths h
      WHERE h.compiler = $1
        AND COALESCE(NULLIF(TRIM(h.book_stripped_english), ''), TRIM(h.book_stripped)) IS NOT NULL
      GROUP BY 1, 2
      ORDER BY first_id
    `,
    [dbValue]
  );

  return rows.map((row) => ({
    name: row.name,
    nameArabic: row.name_arabic,
    total: row.total,
    slug: slugifyBook(row.name),
  }));
}

// Books have no id of their own, so a book slug is matched by slugifying every
// book name for the collection and comparing. The list is short — dozens, not
// thousands — so this costs one query and no schema change.
export async function findBook(dbValue, bookSlug) {
  const books = await getBooks(dbValue);
  return books.find((book) => book.slug === bookSlug) || null;
}

// Every hadith in one book, with enough text to make the link meaningful.
export async function getHadithsInBook(dbValue, bookName) {
  const { rows } = await pool.query(
    `
      SELECT
        h.hadith_number,
        NULLIF(TRIM(h.post_clause_english), '')            AS text_english,
        NULLIF(TRIM(h.chapter_stripped_english), '')       AS chapter,
        CASE WHEN h.compiler = $3 THEN 'azami-' ELSE 'sevenbooks-' END
          || h.id::text                                    AS composite_id
      FROM hadiths h
      WHERE h.compiler = $1
        AND COALESCE(NULLIF(TRIM(h.book_stripped_english), ''), TRIM(h.book_stripped)) = $2
      ORDER BY h.id
    `,
    [dbValue, bookName, AZAMI]
  );

  return rows;
}