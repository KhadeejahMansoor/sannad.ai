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
      label: end ? `${surah}:${start}-${end}` : `${surah}:${start}`,
      // Quran.com deep-links to the starting verse of the range.
      href: `https://quran.com/${surah}/${start}`,
    });
  }
  return out;
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
          key={`${r.label}-${i}`}
          href={r.href}
          target="_blank"
          rel="noopener noreferrer"
          title={`Open Qur'an ${r.label} on Quran.com`}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '4px 12px',
            borderRadius: '9999px',
            fontSize: '0.85rem',
            fontWeight: 600,
            textDecoration: 'none',
            color: '#523230',
            backgroundColor: '#EFE7E1',
            border: '1px solid #D9CDC5',
            cursor: 'pointer',
            transition: 'background-color 0.15s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#E5D8CF')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#EFE7E1')}
        >
          {isArabic ? toArabicDigits(r.label) : r.label}
        </a>
      ))}
    </div>
  );
}