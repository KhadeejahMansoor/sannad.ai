// src/lib/arabic.js
//
// Strips Arabic diacritics (harakat/tashkeel) — fatha, damma, kasra, sukun,
// shadda, tanwin, etc. — from a string. Used for display labels like
// "العَرَبِيَّة" -> "العربية" where the base letters are the DB value but the
// diacritics only add visual noise at small sizes.

const ARABIC_DIACRITICS = /[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED\u08D4-\u08E1\u08E3-\u08FF]/g;

export function stripArabicDiacritics(text) {
  if (!text) return text;
  return String(text).replace(ARABIC_DIACRITICS, '');
}