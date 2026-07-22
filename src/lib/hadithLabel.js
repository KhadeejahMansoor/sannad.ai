// Builds the text for the "Hadith" row in the Details panel.
//
// Every compiler shows a single number. Malik is the exception: the Muwatta
// comes down through several recensions, each numbered differently, so the row
// lists all of them side by side —
//
//   Laithi 1, Qasim 5, Shaybani 3, Zuhri 7
//
// Laithi is the primary numbering and lives in `hadith_number`; the other three
// have their own columns. Any recension missing a number is dropped rather than
// printed with a blank.
//
// Shared by DetailView, ResultsScreen, HadithByCompiler and
// HadithDetailBottomSheet so mobile and desktop stay identical.

const BLANK_TOKENS = new Set(['', '-', '--', '---', '\u2014', '\u2013', 'n/a', 'na', 'none', 'nil', 'null', 'undefined']);

export const isBlank = (v) => {
  if (v === null || v === undefined) return true;
  const t = String(v).replace(/[\u200b-\u200f\u202a-\u202e\ufeff]/g, '').trim();
  return t === '' || BLANK_TOKENS.has(t.toLowerCase());
};

export const firstPresent = (...vals) => vals.find((v) => !isBlank(v));

// The compiler value as stored in the DB.
const MALIK_DB = '\u0645\u0627\u0644\u0643';

const RECENSIONS = [
  { column: 'hadith_number',   en: 'Laithi',   ar: '\u0627\u0644\u0644\u064a\u062b\u064a' },
  { column: 'qasim_number',    en: 'Qasim',    ar: '\u0627\u0644\u0642\u0627\u0633\u0645' },
  { column: 'shaybani_number', en: 'Shaybani', ar: '\u0627\u0644\u0634\u064a\u0628\u0627\u0646\u064a' },
  { column: 'zuhri_number',    en: 'Zuhri',    ar: '\u0627\u0644\u0632\u0647\u0631\u064a' },
];

export const isMalik = (compiler) =>
  String(compiler ?? '').trim() === MALIK_DB;

/**
 * @param {object} hadith    the row, straight from the API
 * @param {object} opts
 * @param {boolean} opts.isArabic  render recension names in Arabic
 * @param {string}  opts.fallback  label to use for every non-Malik compiler
 * @returns {string}
 */
export function buildHadithLabel(hadith, { isArabic = false, fallback = '' } = {}) {
  if (!isMalik(hadith?.compiler)) return fallback;

  const parts = RECENSIONS
    .map((r) => ({ name: isArabic ? r.ar : r.en, num: hadith?.[r.column] }))
    .filter((p) => !isBlank(p.num))
    .map((p) => `${p.name} ${String(p.num).trim()}`);

  // No recension numbers at all — better the ordinary label than an empty row.
  return parts.length ? parts.join(', ') : fallback;
}