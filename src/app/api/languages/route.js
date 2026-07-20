// src/app/api/languages/route.js
//
// All nine languages are listed so the picker shows where this is going.
// Only two are `enabled`, because only two have data behind them:
//
//   hadiths.final_hadith         -> Arabic   (100% of 80,661 rows)
//   hadiths.post_clause_english  -> English  (~95%; 0% for Malik)
//
// There is no Urdu column, no Bengali column, no Persian column. Selecting
// those cannot do anything, so the UI shows them as coming-soon rather than
// letting a tap fail silently.
//
// To turn one on later: add the translated text to the database, then flip
// `enabled` to true here. Nothing else in the app needs to change.

import { NextResponse } from 'next/server';

export async function GET() {
  const languages = [
    { code: 'en', name: 'English',    native_name: 'English',          direction: 'ltr', enabled: true  },
    { code: 'ar', name: 'Arabic',     native_name: 'العَرَبيَّة',        direction: 'rtl', enabled: true  },
    { code: 'ur', name: 'Urdu',       native_name: 'اُردُو',            direction: 'rtl', enabled: false },
    { code: 'bn', name: 'Bengali',    native_name: 'বাংলা',            direction: 'ltr', enabled: false },
    { code: 'fa', name: 'Persian',    native_name: 'فارسی',            direction: 'rtl', enabled: false },
    { code: 'tr', name: 'Turkish',    native_name: 'Türkçe',           direction: 'ltr', enabled: false },
    { code: 'id', name: 'Indonesian', native_name: 'Bahasa Indonesia', direction: 'ltr', enabled: false },
    { code: 'hi', name: 'Hindi',      native_name: 'हिन्दी',            direction: 'ltr', enabled: false },
    { code: 'uz', name: 'Uzbek',      native_name: 'Ўзбекча',          direction: 'ltr', enabled: false },
  ];

  return NextResponse.json({ success: true, data: languages });
}