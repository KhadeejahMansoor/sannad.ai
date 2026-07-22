"use client";
import { motion } from "framer-motion";
import { useState } from "react";
import { compilerFor } from "../lib/i18n";
import { useLanguage } from "../lib/LanguageContext";
import MatchedReferenceChips from "./MatchedReferenceChips";
import AyatChips from "./AyatChips";
import HadithText from "./HadithText";
import { useOpenReference } from "../hooks/useOpenReference";

import { buildHadithLabel } from '../lib/hadithLabel';


// Same blank test as DetailView / ResultsScreen / HadithByCompiler.
const BLANK_TOKENS = new Set(['', '-', '--', '---', '\u2014', '\u2013', 'n/a', 'na', 'none', 'nil', 'null', 'undefined']);
const isBlank = (v) => {
  if (v === null || v === undefined) return true;
  const t = String(v).replace(/[\u200b-\u200f\u202a-\u202e\ufeff]/g, '').trim();
  return t === '' || BLANK_TOKENS.has(t.toLowerCase());
};
const firstPresent = (...vals) => vals.find((v) => !isBlank(v));


export default function HadithDetailStatic({ isOpen, onClose, hadith, className = '' }) {
  // The toggle switches THIS PANEL to Arabic, independently of the site
  // language. It used to flip `toggleState` and nothing read it — the switch
  // moved and nothing happened.
  const [toggleState, setToggleState] = useState(false);
  const { language, isArabic: siteIsArabic } = useLanguage();
  const openRef = useOpenReference();

  // Arabic if the site is in Arabic, OR if the toggle asks for it.
  const isArabic = siteIsArabic || toggleState;
  const lang = isArabic ? 'ar' : 'en';

  if (!isOpen) return null;

  const handleToggle = () => {
    setToggleState(!toggleState);
  };

  const t = {
    details:      isArabic ? 'التفاصيل'  : 'Details',
    reference:    isArabic ? 'المرجع'    : 'Reference',
    commentary:   isArabic ? 'الشرح'     : 'Commentary',
    ayat:         isArabic ? 'الآيات'    : 'Ayat annotation',
    book:         isArabic ? 'الكتاب'    : 'Book',
    chapter:      isArabic ? 'الباب'     : 'Chapter',
    section:      isArabic ? 'الفصل'     : 'Section',
    hadith:       isArabic ? 'الحديث'    : 'Hadith',
    noReference:  isArabic ? 'لا توجد مراجع خارجية لهذا الحديث.' : 'No external references available for this hadith.',
    noAyat:       isArabic ? 'لا توجد آيات مرتبطة بهذا الحديث.'  : 'No ayat annotations available for this hadith.',
    noCommentary: isArabic ? 'لا يوجد شرح لهذا الحديث.'          : 'No commentary available for this hadith.',
  };

  // Was reading hadith.book straight — the RAW column, prefix and all
  // ("كتاب بدء الوحي"). /api/hadiths-by-filters now also returns the stripped
  // forms and their English translations, which is what the sidebar shows.
  // Use those, so the two agree and the panel follows the language.
  //
  // Falls back to the raw value if a stripped one is missing, rather than
  // showing an em-dash for a book that plainly exists.
  const pick = (stripped, english, raw) =>
    (isArabic ? firstPresent(stripped, raw) : firstPresent(english, stripped, raw)) || '—';

  const book    = pick(hadith?.book_stripped,    hadith?.book_stripped_english,    hadith?.book);
  const chapter = pick(hadith?.chapter_stripped, hadith?.chapter_stripped_english, hadith?.chapter);
  const section = pick(hadith?.section_stripped, hadith?.section_stripped_english, hadith?.section);

  const hadithNum   = hadith?.hadith_number || '';
  const compiler    = compilerFor(hadith?.compiler, lang);
  // Was `|| 'None'` — a literal English word rendered into the panel, which
  // would sit there in English even in Arabic mode. Empty means empty; the
  // render below picks the right sentence.
  const commentary  = hadith?.commentary  || '';
  const ayat        = hadith?.ayat        || '';
  const source      = hadith?.source      || '';

  const hadithLabel = buildHadithLabel(hadith, {
    isArabic,
    fallback: source === 'azami'
      ? `al-Jami al-Kamil ${hadithNum}`
      : `${compiler} ${hadithNum}`,
  });



  return (
    // NO dir here. The root is the two-column flex — putting dir on it would
    // reverse the COLUMNS (Details would jump to the right). The columns stay
    // where they are; only the content inside each card flips.
    //
    // So dir goes on the cards and headings below, one level down.
    <div className={`flex justify-center gap-8 w-full max-w-[1650px] transition-all duration-300 mx-auto`}>

      {/* Left Section: Details + Ayat */}
      <div className="w-[50%]">
        <div dir={isArabic ? 'rtl' : 'ltr'} lang={lang} className="text-black text-xs font-medium font-['Inter'] mt-10 ms-2 mb-2 text-start">{t.details}</div>

        <div dir={isArabic ? 'rtl' : 'ltr'} lang={lang} className="bg-white p-3 rounded-[5px] mb-4">
          {/* Book > Chapter > Section — the real hierarchy, and the parameter
              order /api/sections-by-chapter takes. Section sat above Chapter,
              which reads as though a section contains chapters. */}
          {/* `type` stays English — the icon switch below keys off it. `label` is
              what the user sees. */}
          {[
            { type: 'Book',    label: t.book,    title: book },
            { type: 'Chapter', label: t.chapter, title: chapter },
            { type: 'Section', label: t.section, title: section },
            { type: 'Hadith',  label: t.hadith,  title: hadithLabel },
          ]
          // Drop Chapter/Section when the hadith has no value for them.
          .filter((item) => (item.type !== 'Section' && item.type !== 'Chapter') || !isBlank(item.title))
          // Spacing keyed off the filtered length, not a hardcoded 3, so the
          // last surviving row still loses its bottom margin.
          .map((item, index, arr) => (
            <div key={index} className={`flex items-start py-0.5 ${index < arr.length - 1 ? 'mb-1' : ''}`}>
              <div className="w-4 h-4 flex items-start justify-center me-2 flex-shrink-0 text-gray-400 mt-0.5">
                {item.type === 'Book' && (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M4 14.6663H14V13.333H4.008C3.7 13.325 3.33333 13.203 3.33333 12.6663C3.33333 12.1297 3.7 12.0077 4.008 11.9997H14V2.66634C14 1.93101 13.402 1.33301 12.6667 1.33301H4C3.196 1.33301 2 1.86567 2 3.33301V12.6663C2 14.1337 3.196 14.6663 4 14.6663ZM3.33333 5.33301V3.33301C3.33333 2.79634 3.7 2.67434 4 2.66634H12.6667V10.6663H3.33333V5.33301Z" fill="#939393" />
                    <path d="M5.33301 4H11.333V5.33333H5.33301V4Z" fill="#939393" />
                  </svg>
                )}
                {item.type === 'Section' && (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M13.9997 1.33301H1.99967C1.82286 1.33301 1.65329 1.40325 1.52827 1.52827C1.40325 1.65329 1.33301 1.82286 1.33301 1.99967V13.9997C1.33301 14.1765 1.40325 14.3461 1.52827 14.4711C1.65329 14.5961 1.82286 14.6663 1.99967 14.6663H13.9997C14.1765 14.6663 14.3461 14.5961 14.4711 14.4711C14.5961 14.3461 14.6663 14.1765 14.6663 13.9997V1.99967C14.6663 1.82286 14.5961 1.65329 14.4711 1.52827C14.3461 1.40325 14.1765 1.33301 13.9997 1.33301ZM9.33301 13.333H2.66634V2.66634H9.33301V13.333ZM13.333 13.333H10.6663V2.66634H13.333V13.333Z" fill="#939393" />
                  </svg>
                )}
                {item.type === 'Chapter' && (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <g clipPath="url(#clip0)">
                      <path d="M3.33366 9.33366V3.33366H12.667V13.3337H7.33366M12.667 10.667H15.3337V0.666992H6.00033V3.33366M3.33366 10.667V16.0003M6.00033 13.3337H0.666992" stroke="#939393" strokeWidth="1.33333" />
                    </g>
                    <defs>
                      <clipPath id="clip0">
                        <rect width="16" height="16" fill="white" />
                      </clipPath>
                    </defs>
                  </svg>
                )}
                {item.type === 'Hadith' && (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M7.99967 13.0968C7.09901 12.4628 6.05634 12.0588 4.96301 11.9228C4.18757 11.7653 3.39755 11.6909 2.60634 11.7008C2.5051 11.7017 2.40469 11.6825 2.3109 11.6444C2.21712 11.6063 2.13181 11.5499 2.05991 11.4787C1.98801 11.4074 1.93094 11.3226 1.892 11.2291C1.85305 11.1357 1.833 11.0354 1.83301 10.9342L1.84701 3.67217C1.84658 3.47732 1.92036 3.28962 2.05336 3.14721C2.18635 3.00481 2.36858 2.91838 2.56301 2.90551C3.36844 2.8895 4.17321 2.96148 4.96301 3.12017C6.05516 3.26108 7.09701 3.66409 7.99967 4.29484M7.99967 13.0968V4.29484M7.99967 13.0968C8.90034 12.4628 9.94301 12.0588 11.0363 11.9228C11.8118 11.7653 12.6018 11.6909 13.393 11.7008C13.4942 11.7017 13.5947 11.6825 13.6884 11.6444C13.7822 11.6063 13.8675 11.5499 13.9394 11.4787C14.0113 11.4074 14.0684 11.3226 14.1074 11.2291C14.1463 11.1357 14.1663 11.0354 14.1663 10.9342L14.1517 3.67217C14.1521 3.47743 14.0784 3.28982 13.9456 3.14743C13.8127 3.00504 13.6306 2.91855 13.4363 2.90551C12.6309 2.8895 11.8261 2.96148 11.0363 3.12017C9.94419 3.26108 8.90234 3.66409 7.99967 4.29484" stroke="#939393" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>

              <span className="text-xs text-gray-400 me-4 w-[60px] mt-0.5">
                {item.label}
              </span>

              <span
                className="flex-1 text-black text-xs font-normal font-['Inter'] break-words"
                dir={isArabic ? 'rtl' : 'ltr'}
                lang={isArabic ? 'ar' : 'en'}
              >
                <HadithText text={item.title} />
              </span>
            </div>
          ))}
        </div>

        <div dir={isArabic ? 'rtl' : 'ltr'} lang={lang} className="text-black text-xs font-medium font-['Inter'] ms-2 mb-2 text-start">{t.ayat}</div>
        <div dir={isArabic ? 'rtl' : 'ltr'} lang={lang} className="bg-white px-4 py-3 overflow-visible rounded-[5px]">
          <div className="text-black text-xs font-normal font-['Inter'] leading-[16px] text-start whitespace-pre-line">
            {ayat ? <AyatChips ayat={ayat} isArabic={isArabic} /> : t.noAyat}
          </div>
        </div>
      </div>

      {/* Right Section: Reference + Commentary */}
      <div className="w-[50%] relative">

        <div className="absolute end-4 top-2">
          <button
            onClick={handleToggle}
            className={`relative inline-flex h-4 w-7 items-center rounded-full transition-colors focus:outline-none ${toggleState ? 'bg-black' : 'bg-gray-300'}`}
          >
            <span
              className={`inline-block h-2.5 w-2.5 transform rounded-full bg-white transition-transform ${toggleState ? 'translate-x-3.5' : 'translate-x-0.5'}`}
            />
          </button>
        </div>

        {/* dir belongs on the ROW, not on the heading inside it.
            
            The heading is a flex ITEM — it shrinks to fit its text, so there's no
            spare width for `dir` to move anything within. dir on the item only
            sets the direction of its own characters; the item itself was still
            being laid out at the start of an LTR row, which is the left.
            
            Putting dir on the flex container makes "start" mean right, and the
            heading moves with it. Same reason the other headings work: they're
            full-width blocks, not flex items. */}
        <div
          dir={isArabic ? 'rtl' : 'ltr'}
          lang={lang}
          className="flex items-center mt-10 ms-2 mb-2"
        >
          <div className="text-black text-xs font-medium font-['Inter']">{t.reference}</div>
        </div>

        <div dir={isArabic ? 'rtl' : 'ltr'} lang={lang} className="bg-white rounded-[5px] p-3 mb-11">
          <MatchedReferenceChips
            value={hadith?.matched_hadith}
            onSelect={openRef}
            isArabic={isArabic}
            emptyText={t.noReference}
          />
        </div>

        <div dir={isArabic ? 'rtl' : 'ltr'} lang={lang} className="text-black text-xs font-medium font-['Inter'] ms-2 mb-2 text-start">
          {t.commentary}
        </div>
        <div dir={isArabic ? 'rtl' : 'ltr'} lang={lang} className="bg-white rounded-[5px] p-3 min-h-[100px]">
          <p
            className={`text-sm leading-[22px] whitespace-pre-line ${
              commentary ? 'text-black' : 'text-[#6B5B55] text-xs'
            }`}
            dir={commentary ? 'rtl' : (isArabic ? 'rtl' : 'ltr')}
            lang={commentary ? 'ar' : lang}
          >
            {commentary || t.noCommentary}
          </p>
        </div>
      </div>

    </div>
  );
}