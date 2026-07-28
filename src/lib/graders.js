// src/lib/graders.js
//
// The grader shown under a hadith's grade chip.
//
// final_grader and final_grader_description are both stored in ARABIC. The old
// formatGrader tested for the string 'azami' and hardcoded one descriptor, so
// it never matched a real row — every hadith rendered its grader's Arabic name
// even in English mode, and the descriptor only ever appeared for a value the
// database doesn't contain.
//
// The description has to be read per row rather than derived from the name:
// Darussalam carries two different ones (بقيادة صالح بن عبد العزيز on 24,113
// hadiths, بقيادة زبير علي زئي on 19,362), so the same grader does not imply the
// same description.

// Every value in the final_grader column, keyed on what the database stores.
const GRADER_NAMES = {
  'دار السلام':            { ar: 'دار السلام',            en: 'Darussalam' },
  'ضياء الرحمن الأعظمي':   { ar: 'ضياء الرحمن الأعظمي',   en: 'Zia-ur-Rahman Azami' },
  'مسلم':                  { ar: 'مسلم',                  en: 'Muslim' },
  'البخاري':               { ar: 'البخاري',               en: 'Bukhari' },
  'أحمد شاكر':             { ar: 'أحمد شاكر',             en: 'Ahmad Shakir' },
  'محمد صبحي حلاق':        { ar: 'محمد صبحي حلاق',        en: 'Muhammad Subhi Hallaq' },
  'الدارقطني':             { ar: 'الدارقطني',             en: 'al-Daraqutni' },
  'شعيب الأرناؤوط':        { ar: 'شعيب الأرناؤوط',        en: "Shu'ayb al-Arna'ut" },
  'زبير علي زئي':          { ar: 'زبير علي زئي',          en: 'Zubair Ali Zai' },
  'معاذ بن زبير علي زئي':  { ar: 'معاذ بن زبير علي زئي',  en: 'Muadh bin Zubair Ali Zai' },
};

// All three values the final_grader_description column holds.
const GRADER_DESCRIPTIONS = {
  'بقيادة صالح بن عبد العزيز': {
    ar: 'بقيادة صالح بن عبد العزيز',
    en: 'Led by Salih bin Abdul Aziz',
  },
  'بقيادة زبير علي زئي': {
    ar: 'بقيادة زبير علي زئي',
    en: 'Led by Zubair Ali Zai',
  },
  'عميد قسم الحديث بالجامعة الإسلامية بالمدينة المنورة': {
    ar: 'عميد قسم الحديث بالجامعة الإسلامية بالمدينة المنورة',
    en: 'Dean of the Department of Hadith at the Islamic University of Madinah',
  },
};

const clean = (v) => (v === null || v === undefined ? '' : String(v).trim());

// Unmapped values pass through as stored rather than vanishing — a grader added
// to a later spreadsheet shows up untranslated instead of disappearing.
function lookup(table, raw, wantArabic) {
  const key = clean(raw);
  if (!key) return '';
  const found = table[key];
  if (!found) return key;
  return wantArabic ? found.ar : found.en;
}

/**
 * @returns {{ name: string, descriptor: string } | null}
 *   null when the row names no grader, so the caller can skip the line
 *   entirely rather than render "Graded by" followed by nothing.
 */
export function formatGrader(hadith, wantArabic) {
  if (!hadith) return null;

  const raw = clean(hadith.final_grader);
  // Placeholders the column uses for "no grading applies".
  if (!raw || raw.toLowerCase() === 'unknown' || raw.toLowerCase() === 'not hadith') {
    return null;
  }

  return {
    name: lookup(GRADER_NAMES, raw, wantArabic),
    descriptor: lookup(GRADER_DESCRIPTIONS, hadith.final_grader_description, wantArabic),
  };
}

export function gradedByLabel(isArabic) {
  return isArabic ? 'حكم عليه ' : 'Graded by ';
}