// src/lib/commentaries.js
//
// A hadith carries up to three attributed commentaries. Slot 1 names its
// scholar in commentary_person_1 — one of Ahmad Shakir, Darussalam, or Azami,
// never more than one. Slots 2 and 3 were pivoted into named columns when the
// spreadsheet was imported (ibn_hajar, hadi), so their author is implied by the
// column rather than stored in the row, and is filled in here.
//
// In the current data no hadith has all three: 56,095 have one, 48 have two,
// 24,518 have none. The shape is general anyway, so a future import that fills
// all three needs no code change.
//
// Every slot has an Arabic text and an English translation. The English ones
// were in the table from the start and were never selected by the API, which is
// why the panels could only ever render Arabic.

// Every commentator in the corpus, in both scripts.
//
// Slot 1 stores its author in the row, but only in Arabic — so an English
// reader saw 'أحمد شاكر'. Looked up here instead, keyed on the Arabic value the
// database holds. Slots 2 and 3 have no person column at all (the import
// pivoted them into ibn_hajar / hadi), so their author is fixed by position.
const COMMENTATOR_NAMES = {
  'أحمد شاكر':            { ar: 'أحمد شاكر',            en: 'Ahmad Shakir' },
  'دار السلام':           { ar: 'دار السلام',           en: 'Darussalam' },
  'ضياء الرحمن الأعظمي':  { ar: 'ضياء الرحمن الأعظمي',  en: 'Zia-ur-Rahman Azami' },
  'ابن حجر':              { ar: 'ابن حجر',              en: 'Ibn Hajar' },
  'مقبل بن هادي الوادعي': { ar: 'مقبل بن هادي الوادعي', en: 'Muqbil bin Hadi Wadii' },
};

const COMMENTATORS = {
  2: COMMENTATOR_NAMES['ابن حجر'],
  3: COMMENTATOR_NAMES['مقبل بن هادي الوادعي'],
};

// Falls back to whatever the row holds when a name isn't in the table above —
// a new commentator should show up untranslated rather than vanish.
function commentatorName(raw, wantArabic) {
  const key = String(raw || '').trim();
  if (!key) return '';
  const found = COMMENTATOR_NAMES[key];
  if (!found) return key;
  return wantArabic ? found.ar : found.en;
}

const clean = (v) => (v === null || v === undefined ? '' : String(v).trim());

/**
 * Build the list of commentaries to render, in slot order.
 *
 * Returns [{ author, text, isArabic }], already filtered to the entries that
 * actually have something to show. `isArabic` reports which language was
 * CHOSEN, not what was asked for — an entry with no translation falls back to
 * the other language, and the caller needs to know so it can set dir correctly.
 */
export function buildCommentaries(hadith, wantArabic) {
  if (!hadith) return [];

  const slots = [
    {
      author: commentatorName(hadith.commentary_person_1, wantArabic),
      ar: clean(hadith.commentary_1) || clean(hadith.commentary),
      en: clean(hadith.commentary_1_english),
    },
    {
      // Two shapes reach this function. The API routes alias the columns to
      // commentary_2 / commentary_3; the results page queries the table
      // directly with select('*') and gets the RAW names, ibn_hajar and hadi.
      // Reading both is why the same panel works on every screen.
      author: wantArabic ? COMMENTATORS[2].ar : COMMENTATORS[2].en,
      ar: clean(hadith.commentary_2) || clean(hadith.ibn_hajar),
      en: clean(hadith.commentary_2_english),
    },
    {
      author: wantArabic ? COMMENTATORS[3].ar : COMMENTATORS[3].en,
      ar: clean(hadith.commentary_3) || clean(hadith.hadi),
      en: clean(hadith.commentary_3_english),
    },
  ];

  return slots
    .map((s) => {
      // Prefer the requested language; fall back rather than render blank.
      const text = wantArabic ? (s.ar || s.en) : (s.en || s.ar);
      return { author: s.author, text, isArabic: text !== '' && text === s.ar };
    })
    .filter((s) => s.text !== '');
}

export function noCommentaryText(isArabic) {
  return isArabic ? 'لا يوجد شرح لهذا الحديث.' : 'No commentaries are available.';
}