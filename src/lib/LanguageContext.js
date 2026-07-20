// src/lib/LanguageContext.js
//
// One place that holds the current UI language. Everything else reads from here.
//
//   'en'  (default) — bilingual cards (Arabic + English), English filter labels
//   'ar'             — Arabic-only cards, Arabic filter labels
//
// English is the default because a first-time visitor gets the most information
// that way: the Arabic source text AND the translation side by side. Choosing
// Arabic is a deliberate narrowing, not a fallback.

'use client';

import { createContext, useContext, useEffect, useState } from 'react';

const LanguageContext = createContext(null);

const STORAGE_KEY = 'sunnahsource:lang';
const SUPPORTED = ['en', 'ar'];

export function LanguageProvider({ children }) {
  // Always start at 'en' on the server AND on the first client render.
  //
  // Reading localStorage during useState would give the server 'en' and the
  // client (say) 'ar', and React would throw a hydration mismatch. So we render
  // 'en' first, then correct it in an effect once we're safely on the client.
  const [language, setLanguageState] = useState('en');
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved && SUPPORTED.includes(saved)) {
        setLanguageState(saved);
      }
    } catch {
      // localStorage can throw in private mode / blocked storage. Not fatal —
      // the language just won't persist across reloads.
    }
    setHydrated(true);
  }, []);

  const setLanguage = (lang) => {
    if (!SUPPORTED.includes(lang)) return;
    setLanguageState(lang);
    try {
      window.localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // see above
    }
  };

  const value = {
    language,                  // 'en' | 'ar'
    setLanguage,
    isArabic: language === 'ar',
    hydrated,                  // false until localStorage has been read
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useLanguage must be used inside <LanguageProvider>. Check app/layout.js.');
  }
  return ctx;
}

/**
 * Pick the right label off a { value, label_ar, label_en } object as returned by
 * /api/books-by-compiler, /api/chapters-by-book and /api/sections-by-chapter.
 *
 * Falls back to the other language, then to the raw value, so a missing
 * translation shows *something* rather than an empty row.
 */
export function pickLabel(item, language) {
  if (!item) return '';
  if (language === 'ar') return item.label_ar || item.label_en || item.value || '';
  return item.label_en || item.label_ar || item.value || '';
}