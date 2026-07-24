// src/component/AyatChips.js
//
// Parses an `ayat` string like "[96:1-5], [74:1-4], [96:1]" into one clickable
// chip per reference. Each chip links to that verse on Quran.com.
//
// Usage in any display component:
//   import AyatChips from '@/component/AyatChips';
//   <AyatChips ayat={hadith?.ayat} />
//
// Optionally pass `isArabic` to force the language instead of reading the global
// LanguageContext. This matters for DetailView, which has its OWN local Arabic
// toggle that is independent of the global context — without the prop, the chips
// would keep reading the global context and never switch when that local toggle
// flips.
//
// Renders nothing when there are no references, so the parent can decide whether
// to show its "No ayat annotations available" empty state (or pass showEmpty).

'use client';

import React from 'react';
import { useLanguage } from '../lib/LanguageContext';
import { surahName } from '../lib/surahs';

// Latin digits -> Arabic-Indic (٠١٢٣٤٥٦٧٨٩). Only the digits change; the colon,
// dash and brackets stay as-is. Used for DISPLAY only — the Quran.com href keeps
// Latin digits, since the URL needs them.
function toArabicDigits(str) {
  return String(str).replace(/[0-9]/g, (d) => '٠١٢٣٤٥٦٧٨٩'[d]);
}

// Pulls every  surah:ayah  or  surah:ayah-range  out of the string,
// ignoring the brackets and any spacing/commas around them.
function parseAyat(raw) {
  if (!raw || typeof raw !== 'string') return [];
  const out = [];
  const re = /(\d+)\s*:\s*(\d+)(?:\s*-\s*(\d+))?/g;
  let m;
  while ((m = re.exec(raw)) !== null) {
    const surah = m[1];
    const start = m[2];
    const end = m[3] || null;
    out.push({
      surah,
      start,
      end,
      // Numbers only. The surah name is prepended at render time because it
      // depends on the language, which the parser has no view of.
      ref: end ? `${surah}:${start}-${end}` : `${surah}:${start}`,
      // Quran.com deep-links to the starting verse of the range.
      href: `https://quran.com/${surah}/${start}`,
    });
  }
  return out;
}

// Matches the reference chips in MatchedReferenceChips exactly — same warm
// sand, same height, same radius — so the two panels read as one system.
// Those chips are Tailwind classes; these are inline styles, so the values
// are duplicated here rather than shared. Keep them in step.
const CHIP_BG = 'transparent';
const CHIP_BG_HOVER = '#EBE7DE';
const CHIP_TEXT = '#5C5347';

// 'Alaq 96:1-5'. Falls back to the bare reference when the surah number is
// out of range, rather than printing an empty name and a stray space.
function chipLabel(r, isArabic) {
  const ref = isArabic ? toArabicDigits(r.ref) : r.ref;
  const name = surahName(r.surah, isArabic);
  return name ? `${name} ${ref}` : ref;
}

export default function AyatChips({ ayat, showEmpty = false, isArabic: isArabicProp }) {
  const ctx = useLanguage();
  // Prefer an explicit prop; fall back to the global context when it isn't given.
  const isArabic = isArabicProp !== undefined ? isArabicProp : ctx.isArabic;
  const refs = parseAyat(ayat);

  if (refs.length === 0) {
    if (!showEmpty) return null;
    return (
      <p style={{ color: '#8a6d3b', fontStyle: 'italic', margin: 0 }}>
        {isArabic ? 'لا توجد آيات مرتبطة بهذا الحديث.' : 'No ayat annotations available for this hadith.'}
      </p>
    );
  }

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
      {refs.map((r, i) => (
        <a
          key={`${r.ref}-${i}`}
          href={r.href}
          target="_blank"
          rel="noopener noreferrer"
          title={`Open Qur'an ${r.ref} on Quran.com`}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '26px',
            padding: '0 10px',
            borderRadius: '8px',
            fontSize: '12px',
            fontWeight: 500,
            textDecoration: 'none',
            color: CHIP_TEXT,
            backgroundColor: CHIP_BG,
            border: 'none',
            cursor: 'pointer',
            transition: 'background-color 0.15s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = CHIP_BG_HOVER)}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = CHIP_BG)}
        >
          {chipLabel(r, isArabic)}
        </a>
      ))}
    </div>
  );
}