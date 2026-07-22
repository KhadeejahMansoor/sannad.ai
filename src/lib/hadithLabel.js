// src/lib/hadithLabel.js
//
// Builds the text for the "Hadith" row in the Details panel.
//
// Every collection is numbered by at least one edition, and some by several.
// The row lists each numbering the compiler has —
//
//   Malik      -> Laithi 686, Qasim 344, Shaybani 367, Zuhri 851
//   Ahmad      -> Darussalam 10630, Shakir 10578
//   Muslim     -> Darussalam 12, Sunnah.com 34, Daraqutni 56
//   Nasai etc. -> Darussalam 1
//
// The first entry in each list is the primary numbering and lives in
// `hadith_number`; the rest have their own columns. Any entry with no number is
// dropped rather than printed blank, so a hadith numbered only in the primary
// edition just shows that one.
//
// Compilers absent from RECENSIONS (Bukhari, Azami) keep whatever label the
// calling component already built.
//
// Shared by DetailView, ResultsScreen, HadithByCompiler and
// HadithDetailBottomSheet so mobile and desktop stay identical.

const BLANK_TOKENS = new Set(['', '-', '--', '---', '—', '–', 'n/a', 'na', 'none', 'nil', 'null', 'undefined']);

export const isBlank = (v) => {
  if (v === null || v === undefined) return true;
  const t = String(v).replace(/[\u200b-\u200f\u202a-\u202e\ufeff]/g, '').trim();
  return t === '' || BLANK_TOKENS.has(t.toLowerCase());
};

export const firstPresent = (...vals) => vals.find((v) => !isBlank(v));

// Compiler values exactly as stored in the DB.
const MALIK_DB      = 'مالك';
const AHMAD_DB      = 'أحمد';
const MUSLIM_DB     = 'مسلم';
const NASAI_DB      = 'النسائي';
const TIRMIDHI_DB   = 'الترمذي';
const IBN_MAJAH_DB  = 'ابن ماجه';
const ABU_DAWUD_DB  = 'أبو داود';

// Reused by the four single-numbering collections.
const DARUSSALAM_ONLY = [
  { columns: ['hadith_number'], en: 'Darussalam', ar: 'دار السلام' },
];

// `columns` is a list of candidates, tried in order — column naming has not
// been consistent across imports, and a name that does not exist simply reads
// as undefined rather than throwing.
const RECENSIONS = {
  [MALIK_DB]: [
    { columns: ['hadith_number'],   en: 'Laithi',   ar: 'الليثي' },
    { columns: ['qasim_number'],    en: 'Qasim',    ar: 'القاسم' },
    { columns: ['shaybani_number'], en: 'Shaybani', ar: 'الشيباني' },
    { columns: ['zuhri_number'],    en: 'Zuhri',    ar: 'الزهري' },
  ],

  [AHMAD_DB]: [
    { columns: ['hadith_number'], en: 'Darussalam', ar: 'دار السلام' },
    { columns: ['shakir_hadith_number', 'shakir_number', 'shakir'],
                                  en: 'Shakir',     ar: 'شاكر' },
  ],

  [MUSLIM_DB]: [
    { columns: ['hadith_number'], en: 'Darussalam', ar: 'دار السلام' },
    { columns: ['sunnah_com_number', 'sunnah_number', 'sunnahcom_number'],
                                  en: 'Sunnah.com', ar: 'Sunnah.com' },
    { columns: ['daraqutni_hadith_number', 'daraqutni_number', 'daraqutni'],
                                  en: 'Daraqutni',  ar: 'الدارقطني' },
  ],

  [NASAI_DB]:     DARUSSALAM_ONLY,
  [TIRMIDHI_DB]:  DARUSSALAM_ONLY,
  [IBN_MAJAH_DB]: DARUSSALAM_ONLY,
  [ABU_DAWUD_DB]: DARUSSALAM_ONLY,
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