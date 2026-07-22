// Builds the text for the "Hadith" row in the Details panel.
//
// Most compilers show a single number. Some collections come down through
// several recensions or editions, each numbered differently, so their row
// lists all of them side by side —
//
//   Malik  -> Laisi 686, Qasim 344, Shaybani 367, Zuhri 851
//   Ahmad  -> Darussalam 12, Shakir 34
//
// The first entry in each list is the primary numbering and lives in
// `hadith_number`; the rest have their own columns. Any entry with no number is
// dropped rather than printed blank, so a hadith numbered only in the primary
// edition just shows that one.
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

// Compiler values as stored in the DB.
const MALIK_DB = '\u0645\u0627\u0644\u0643';
const AHMAD_DB = '\u0623\u062d\u0645\u062f';

// `columns` is a list of candidates, tried in order — column naming has not
// been consistent across imports, and a name that does not exist simply reads
// as undefined rather than throwing.
const RECENSIONS = {
  [MALIK_DB]: [
    { columns: ['hadith_number'],                      en: 'Laisi',     ar: '\u0627\u0644\u0644\u064a\u062b\u064a' },
    { columns: ['qasim_number'],                       en: 'Qasim',      ar: '\u0627\u0644\u0642\u0627\u0633\u0645' },
    { columns: ['shaybani_number'],                    en: 'Shaybani',   ar: '\u0627\u0644\u0634\u064a\u0628\u0627\u0646\u064a' },
    { columns: ['zuhri_number'],                       en: 'Zuhri',      ar: '\u0627\u0644\u0632\u0647\u0631\u064a' },
  ],
  [AHMAD_DB]: [
    { columns: ['hadith_number'],                      en: 'Darussalam', ar: '\u062f\u0627\u0631 \u0627\u0644\u0633\u0644\u0627\u0645' },
    { columns: ['shakir_number', 'shakir_hadith_number', 'shakir'],
                                                       en: 'Shakir',     ar: '\u0634\u0627\u0643\u0631' },
  ],
};

const compilerKey = (compiler) => String(compiler ?? '').trim();

export const hasRecensions = (compiler) =>
  Object.prototype.hasOwnProperty.call(RECENSIONS, compilerKey(compiler));

/**
 * @param {object} hadith    the row, straight from the API
 * @param {object} opts
 * @param {boolean} opts.isArabic  render edition names in Arabic
 * @param {string}  opts.fallback  label to use when the compiler has no
 *                                 recension list, or has no numbers at all
 * @returns {string}
 */
export function buildHadithLabel(hadith, { isArabic = false, fallback = '' } = {}) {
  const list = RECENSIONS[compilerKey(hadith?.compiler)];
  if (!list) return fallback;

  const parts = list
    .map((r) => ({
      name: isArabic ? r.ar : r.en,
      num: firstPresent(...r.columns.map((c) => hadith?.[c])),
    }))
    .filter((p) => !isBlank(p.num))
    .map((p) => `${p.name} ${String(p.num).trim()}`);

  return parts.length ? parts.join(', ') : fallback;
}