// src/lib/hadithUrl.js
//
// The URL for a single hadith.
//
// Pages used to be addressed by the database's composite id —
// /hadith/sevenbooks-59726 — which tells a reader nothing and can't be typed
// from memory. The readable form is the compiler followed immediately by the
// number, with spaces in the name closed up:
//
//   /Tirmidhi1
//   /AbuDawud2350
//   /IbnMajah2523
//   /Bukhari7350-7351     (ranges keep their internal hyphen)
//
// Name and number run together with no separator, which is unambiguous because
// no compiler name contains a digit: the number starts at the first digit, and
// everything before it is the name. That's what lets 7350-7351 stay intact —
// a hyphen after the first digit is part of the number, not a separator.
//
// OLD LINKS STILL WORK. Anything already shared or bookmarked in the composite
// form is passed straight through; the hyphenated /Abu-Dawud2350 form this used
// to emit, and the older /hadith/ibn-majah-2523 shape MenuModal produced, both
// still parse.

import { COMPILER_KEYS, translateCompiler } from './i18n';

// Composite ids out of the API: "sevenbooks-59726", "azami-1542".
const COMPOSITE_ID = /^(sevenbooks|azami)-\d+$/i;

// Case- and spacing-insensitive lookup of a canonical compiler key, so
// "abu dawud", "Abu-Dawud" and "ABU DAWUD" all resolve to "Abu Dawud".
const KEY_BY_NORMALIZED = new Map(
  COMPILER_KEYS.map((k) => [k.toLowerCase().replace(/[\s-]+/g, ' '), k])
);

// Second lookup with every separator removed, so the closed-up URL form
// ("abudawud", "ibnmajah") resolves too. No two compiler names collide once
// squashed, so this can't map to the wrong one.
const KEY_BY_SQUASHED = new Map(
  COMPILER_KEYS.map((k) => [k.toLowerCase().replace(/[\s-]+/g, ''), k])
);

function canonicalCompiler(raw) {
  const cleaned = String(raw || '').toLowerCase().trim();
  const normalized = cleaned.replace(/[\s-]+/g, ' ').trim();
  return (
    KEY_BY_NORMALIZED.get(normalized) ||
    KEY_BY_SQUASHED.get(cleaned.replace(/[\s-]+/g, '')) ||
    null
  );
}

export function isCompositeId(slug) {
  return COMPOSITE_ID.test(String(slug || '').trim());
}

/**
 * Build the URL segment. Accepts an English key or the Arabic DB value.
 * Returns null if the compiler isn't one we know, so callers can fall back to
 * the composite id rather than emit a URL that won't resolve.
 */
export function hadithSlug(compiler, number) {
  if (number === null || number === undefined || String(number).trim() === '') return null;

  // translateCompiler is a no-op on English input and maps Arabic to English,
  // so either form can be passed in.
  const key = canonicalCompiler(translateCompiler(compiler)) || canonicalCompiler(compiler);
  if (!key) return null;

  // Spaces are closed up rather than hyphenated: /AbuDawud2350, not
  // /Abu-Dawud2350. The parser accepts both, so old links keep working.
  return `${key.replace(/[\s-]+/g, '')}${String(number).trim()}`;
}

/**
 * Parse a URL segment back to { compiler, number }, or null when the segment
 * isn't the readable form — including composite ids, which the caller should
 * use as-is.
 */
export function parseHadithSlug(slug) {
  const s = String(slug || '').trim();
  if (!s || isCompositeId(s)) return null;

  // Split at the first digit: name before, number (and anything after) behind.
  const m = s.match(/^([^0-9]+?)-?([0-9].*)$/);
  if (!m) return null;

  const key = canonicalCompiler(m[1]);
  if (!key) return null;

  return { compiler: key, number: m[2] };
}

/**
 * Build a slug from a display label like "Tirmidhi 1" — the string the cards
 * already hold — so call sites don't have to thread compiler and number
 * through separately. Returns null when the label isn't that shape.
 */
export function slugFromLabel(label) {
  const s = String(label || '').trim();
  const m = s.match(/^(.+?)\s+([0-9].*)$/);
  if (!m) return null;
  return hadithSlug(m[1], m[2]);
}