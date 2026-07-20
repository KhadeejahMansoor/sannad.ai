// src/lib/i18n.js
//
// Single source of truth for the two closed sets the UI has to translate:
// compilers and grades.
//
// These maps were previously duplicated across HadithByCompiler.js,
// ResultsScreen.js and FilterPopup.js, each with slightly different contents —
// which is how Malik ended up unreachable and Difficult unfilterable. One list now.
//
// ── THE RULE ──────────────────────────────────────────────────────────
// The ENGLISH key is the canonical value. It's what goes in URLs
// (?tags=["Sahih"]&scholars=["Ahmad"]), what components hold in state, and what
// gets translated to Arabic at the last moment before hitting the API.
//
// Arabic is a LABEL. Display it; never store it, never put it in a URL. If the
// chips started sending Arabic, every shared link would break.
//
// Books, chapters and sections are NOT here — they arrive from the API already
// translated as label_ar / label_en, out of the *_stripped_english columns.

// ── Canonical keys (also the display order) ───────────────────────────

export const GRADE_KEYS = ['Sahih', 'Hasan', 'Daif', 'Difficult', 'Fabricated'];

export const COMPILER_KEYS = [
  'Malik', 'Ahmad', 'Bukhari', 'Muslim', 'Ibn Majah',
  'Abu Dawud', 'Tirmidhi', 'Nasai', 'Azami', 'Other',
];

// ── English key → Arabic (serves as both the DB value and the Arabic label) ──

const GRADE_EN_TO_AR = {
  'Sahih':      'صحيح',
  'Hasan':      'حسن',
  'Daif':       'ضعيف',
  'Difficult':    'مشكل',      // 2,150 hadiths — was missing from every map
  'Fabricated': 'موضوع',
};

const COMPILER_EN_TO_AR = {
  'Bukhari':   'البخاري',
  'Muslim':    'مسلم',
  'Abu Dawud': 'أبو داود',
  'Tirmidhi':  'الترمذي',
  'Nasai':     'النسائي',
  'Ibn Majah': 'ابن ماجه',
  'Ahmad':     'أحمد',
  'Azami':     'الأعظمي',
  'Malik':     'مالك',
  'Other':     'أخرى',       // not a real compiler; matches nothing in the DB
};

// ── Arabic → English, built by inverting the above so the two can't drift ──

const GRADE_AR_TO_EN    = Object.fromEntries(Object.entries(GRADE_EN_TO_AR).map(([k, v]) => [v, k]));
const COMPILER_AR_TO_EN = Object.fromEntries(Object.entries(COMPILER_EN_TO_AR).map(([k, v]) => [v, k]));

// 'not hadith' is already stored in English in the source data (97 rows).
GRADE_AR_TO_EN['not hadith'] = 'Not a hadith';


// ═══ Arabic value (out of the DB) → display ═══════════════════════════

/** Arabic compiler name → English. Falls back to the original if unknown. */
export function translateCompiler(arabic) {
  if (!arabic) return '';
  return COMPILER_AR_TO_EN[String(arabic).trim()] || arabic;
}

/** Arabic grade → English. Falls back to the original if unknown. */
export function translateGrade(arabic) {
  if (!arabic) return '';
  return GRADE_AR_TO_EN[String(arabic).trim()] || arabic;
}

/** Arabic compiler → whichever language is active. */
export function compilerFor(arabic, language) {
  return language === 'ar' ? (arabic || '') : translateCompiler(arabic);
}

/** Arabic grade → whichever language is active. */
export function gradeFor(arabic, language) {
  return language === 'ar' ? (arabic || '') : translateGrade(arabic);
}


// ═══ English key (from a chip or a URL) → display, or → DB value ══════

/** English key → the label to SHOW. gradeLabel('Sahih', 'ar') === 'صحيح' */
export function gradeLabel(key, language) {
  if (!key) return '';
  return language === 'ar' ? (GRADE_EN_TO_AR[key] || key) : key;
}

/** English key → the label to SHOW. compilerLabel('Ahmad', 'ar') === 'أحمد' */
export function compilerLabel(key, language) {
  if (!key) return '';
  return language === 'ar' ? (COMPILER_EN_TO_AR[key] || key) : key;
}

/** English key → the Arabic value stored in the DB. For API calls only. */
export function gradeToDb(key) {
  return GRADE_EN_TO_AR[key] || key;
}

/** English key → the Arabic value stored in the DB. For API calls only. */
export function compilerToDb(key) {
  return COMPILER_EN_TO_AR[key] || key;
}