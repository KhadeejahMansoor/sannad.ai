"use client";

// src/component/InlineTabPanels.js
//
// The tabbed detail panel shown under an expanded hadith card on mobile:
// Contents / Reference / Commentary / Ayat.
//
// This used to live inside HadithByCompiler while ResultsScreen carried its own
// stacked version, so the same card looked different depending on which screen
// you opened it from. Extracted here so every mobile screen shares one panel.

import { useState } from 'react';
import HadithText from './HadithText';
import AyatChips from './AyatChips';
import MatchedReferenceChips from './MatchedReferenceChips';
import { useLanguage } from '../lib/LanguageContext';
import { useOpenReference } from '../hooks/useOpenReference';
import { buildHadithLabel } from '../lib/hadithLabel';

const BLANK_TOKENS = new Set(['', '-', '--', '---', '\u2014', '\u2013', 'n/a', 'na', 'none', 'nil', 'null', 'undefined']);
const isBlank = (v) => {
  if (v === null || v === undefined) return true;
  const t = String(v).replace(/[\u200b-\u200f\u202a-\u202e\ufeff]/g, '').trim();
  return t === '' || BLANK_TOKENS.has(t.toLowerCase());
};
const firstPresent = (...vals) => vals.find((v) => !isBlank(v));

// Tabbed layout matching ResultsScreen's mobile expand: Contents / Reference / Commentary / Ayat.
export default function InlineTabPanels({ hadith }) {
  const [activeTab, setActiveTab] = useState('Contents');
  const { isArabic } = useLanguage();
  // Without onSelect the chips render as plain spans, so tapping a reference
  // did nothing on mobile. Same handler the desktop panels use.
  const openRef = useOpenReference();

  // Was reading hadith.book straight — the RAW column, prefix and all
  // ("كتاب الإيمان"). /api/hadiths-by-filters also returns the stripped forms
  // and their English translations, which is what the sidebar shows.
  //
  // English is the default language, so the default here is the English name.
  // Falls back to the stripped Arabic, then the raw value — better a book name
  // in the wrong language than an empty row.
  const pick = (stripped, english, raw) =>
    (isArabic ? firstPresent(stripped, raw) : firstPresent(english, stripped, raw)) || '';

  const book    = pick(hadith?.book_stripped,    hadith?.book_stripped_english,    hadith?.book);
  const chapter = pick(hadith?.chapter_stripped, hadith?.chapter_stripped_english, hadith?.chapter);
  const section = pick(hadith?.section_stripped, hadith?.section_stripped_english, hadith?.section);
  const reference = hadith?.matched_hadith || '';
  const ayat      = hadith?.ayat || '';
  const commentary= hadith?.commentary || 'None';
  const hadithNumber = hadith?.hadith_number || '';

  return (
    <div className="mt-4 mb-6">
      <div className="flex justify-start gap-[22px] mb-4 px-3 py-2 bg-[#F6F4F1] rounded-[10px]">
        {['Contents', 'Reference', 'Commentary', 'Ayat'].map(tab => (
          <div key={tab} onClick={() => setActiveTab(tab)} className="cursor-pointer">
            <div className="inline-flex flex-col items-start">
              <div className={`text-[13px] font-medium ${activeTab === tab ? 'text-[#523230]' : 'text-[#9A8A85]'}`}>
                {tab}
              </div>
              {activeTab === tab && <div className="h-[2px] bg-[#523230] mt-[7px] w-full rounded-[2px]" />}
            </div>
          </div>
        ))}
      </div>

      {activeTab === 'Contents' && (
        <div className="bg-white border border-[#DDD8D0] rounded-[5px] p-4">
          {/* Book > Chapter > Section. That's the actual hierarchy — it's the
              parameter order /api/sections-by-chapter takes. Section was listed
              above Chapter, which reads as though sections contain chapters. */}
          {[
            { type: 'Book', value: book },
            { type: 'Chapter', value: chapter },
            { type: 'Section', value: section },
            { type: 'Hadith', label: isArabic ? 'الترقيم' : 'Numbering', value: buildHadithLabel(hadith, {
              isArabic,
              fallback: `al-Jami al-Kamil ${hadithNumber}`,
            }) },
          ].filter((item) => (item.type !== 'Section' && item.type !== 'Chapter') || !isBlank(item.value)).map((item, i) => (
            <div key={i} className="flex items-start py-1.5 gap-3">
              <span className="w-4 h-5 flex items-center justify-center flex-shrink-0 text-gray-400">
                <RowIcon type={item.type} />
              </span>
              <span className="w-[76px] flex-shrink-0 text-xs text-gray-400 leading-5">{item.label || item.type}</span>
              <div className="flex-1 text-xs text-black leading-5 break-words">{item.value ? <HadithText text={item.value} /> : '—'}</div>
            </div>
          ))}
        </div>
      )}
      {activeTab === 'Reference' && (
        <div className="bg-white border border-[#DDD8D0] rounded-[5px] p-4">
          {/* Was a hand-rolled chip list, so the grouped redesign never reached
              this page. Uses the shared component now, like every other panel. */}
          <MatchedReferenceChips
            value={hadith?.matched_hadith}
            onSelect={openRef}
            isArabic={isArabic}
            emptyText={isArabic ? 'لا توجد مراجع لهذا الحديث.' : 'No reference available'}
          />
        </div>
      )}
      {activeTab === 'Commentary' && (
        <div className="bg-white border border-[#DDD8D0] rounded-[5px] p-4">
          <div className="text-sm text-black leading-[20px] whitespace-pre-line">
            {commentary || 'None'}
          </div>
        </div>
      )}
      {activeTab === 'Ayat' && (
        <div className="bg-white border border-[#DDD8D0] rounded-[5px] p-4">
          {ayat
            ? <AyatChips ayat={ayat} />
            : <div className="text-sm text-gray-400 italic">No ayat annotations available</div>}
        </div>
      )}
    </div>
  );
}

function RowIcon({ type }) {
  const common = { width: 16, height: 16, viewBox: '0 0 16 16', fill: 'none', 'aria-hidden': 'true' };
  if (type === 'Book') return (
    <svg {...common}>
      <path d="M4 14.6663H14V13.333H4.008C3.7 13.325 3.33333 13.203 3.33333 12.6663C3.33333 12.1297 3.7 12.0077 4.008 11.9997H14V2.66634C14 1.93101 13.402 1.33301 12.6667 1.33301H4C3.196 1.33301 2 1.86567 2 3.33301V12.6663C2 14.1337 3.196 14.6663 4 14.6663ZM3.33333 5.33301V3.33301C3.33333 2.79634 3.7 2.67434 4 2.66634H12.6667V10.6663H3.33333V5.33301Z" fill="#939393" />
      <path d="M5.33301 4H11.333V5.33333H5.33301V4Z" fill="#939393" />
    </svg>
  );
  if (type === 'Section') return (
    <svg {...common}>
      <path d="M13.9997 1.33301H1.99967C1.82286 1.33301 1.65329 1.40325 1.52827 1.52827C1.40325 1.65329 1.33301 1.82286 1.33301 1.99967V13.9997C1.33301 14.1765 1.40325 14.3461 1.52827 14.4711C1.65329 14.5961 1.82286 14.6663 1.99967 14.6663H13.9997C14.1765 14.6663 14.3461 14.5961 14.4711 14.4711C14.5961 14.3461 14.6663 14.1765 14.6663 13.9997V1.99967C14.6663 1.82286 14.5961 1.65329 14.4711 1.52827C14.3461 1.40325 14.1765 1.33301 13.9997 1.33301ZM9.33301 13.333H2.66634V2.66634H9.33301V13.333ZM13.333 13.333H10.6663V2.66634H13.333V13.333Z" fill="#939393" />
    </svg>
  );
  if (type === 'Chapter') return (
    <svg {...common}>
      <path d="M3.33366 9.33366V3.33366H12.667V13.3337H7.33366M12.667 10.667H15.3337V0.666992H6.00033V3.33366M3.33366 10.667V16.0003M6.00033 13.3337H0.666992" stroke="#939393" strokeWidth="1.33333" />
    </svg>
  );
  if (type === 'Hadith') return (
    <svg {...common}>
      <path d="M7.99967 13.0968C7.09901 12.4628 6.05634 12.0588 4.96301 11.9228C4.18757 11.7653 3.39755 11.6909 2.60634 11.7008C2.5051 11.7017 2.40469 11.6825 2.3109 11.6444C2.21712 11.6063 2.13181 11.5499 2.05991 11.4787C1.98801 11.4074 1.93094 11.3226 1.892 11.2291C1.85305 11.1357 1.833 11.0354 1.83301 10.9342L1.84701 3.67217C1.84658 3.47732 1.92036 3.28962 2.05336 3.14721C2.18635 3.00481 2.36858 2.91838 2.56301 2.90551C3.36844 2.8895 4.17321 2.96148 4.96301 3.12017C6.05516 3.26108 7.09701 3.66409 7.99967 4.29484M7.99967 13.0968V4.29484M7.99967 13.0968C8.90034 12.4628 9.94301 12.0588 11.0363 11.9228C11.8118 11.7653 12.6018 11.6909 13.393 11.7008C13.4942 11.7017 13.5947 11.6825 13.6884 11.6444C13.7822 11.6063 13.8675 11.5499 13.9394 11.4787C14.0113 11.4074 14.0684 11.3226 14.1074 11.2291C14.1463 11.1357 14.1663 11.0354 14.1663 10.9342L14.1517 3.67217C14.1521 3.47743 14.0784 3.28982 13.9456 3.14743C13.8127 3.00504 13.6306 2.91855 13.4363 2.90551C12.6309 2.8895 11.8261 2.96148 11.0363 3.12017C9.94419 3.26108 8.90234 3.66409 7.99967 4.29484" stroke="#939393" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
  return null;
}