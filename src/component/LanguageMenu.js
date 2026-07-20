'use client';
import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { useLanguages } from '@/hooks/useData';
import { useLanguage } from '@/lib/LanguageContext';

export default function LanguageMenu({ onClose }) {
  const popupRef = useRef();
  const [overlayOpen, setOverlayOpen] = useState(false);
  const [fontLoaded, setFontLoaded] = useState(false);

  // The selection now lives in the app-wide context, not in local state.
  //
  // Before, handleLanguageSelect() called setSelectedLanguage() — a useState
  // hook local to this component. The tile highlighted, the menu closed, and
  // the value was destroyed. Nothing outside this file ever saw it. That is
  // why picking a language appeared to do nothing: it genuinely did nothing.
  const { language, setLanguage } = useLanguage();

  const { data } = useLanguages();
  // Only the languages with data. See /api/languages for the full list.
  const activeLanguages = (data?.data || []).filter(l => l.enabled);

  useEffect(() => {
    setOverlayOpen(true);

    const link = document.createElement('link');
    link.href =
      'https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@400;500;600&display=swap';
    link.rel = 'stylesheet';
    link.id = 'noto-arabic-font';

    if (!document.getElementById('noto-arabic-font')) {
      document.head.appendChild(link);
    }

    document.fonts.ready.then(() => setFontLoaded(true));

    return () => {
      setOverlayOpen(false);
      const existingLink = document.getElementById('noto-arabic-font');
      if (existingLink) existingLink.remove();
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popupRef.current && !popupRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  // Only English and Arabic have text in the database. The other seven tiles
  // are shown (so the roadmap is visible) but do nothing when tapped — better
  // a visibly-disabled tile than one that looks live and silently fails.
  const handleLanguageSelect = (lang) => {
    if (!lang?.code || !lang.enabled) return;
    setLanguage(lang.code);
    onClose();               // close so the change is immediately visible
  };

  const needsArabicFont = (code) => ['ar', 'ur', 'fa'].includes(code);

  return (
    <>
      <style jsx global>{`
        .font-noto-arabic {
          font-family: 'Noto Sans Arabic';
          font-weight: 500 !important;
        }
      `}</style>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 z-40 bg-[#050505]/60"
        onClick={onClose}
      />

      <motion.div
        ref={popupRef}
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ duration: 0.3 }}
        className="fixed bottom-0 left-0 right-0 z-50 bg-white"
        style={{ height: '530px', padding: '35px 18px 16px 18px' }}
      >
        <div className="scroll-hidden" style={{ height: '100%', overflowY: 'auto' }}>
          <div className="grid grid-cols-3 gap-3" style={{ rowGap: '16px' }}>
            {activeLanguages.map((lang) => (
              <div key={lang.code} className="aspect-[107/104] w-full">
                <LanguageButton
                  label={lang.native_name}
                  onClick={() => handleLanguageSelect(lang)}
                  // Highlight what's ACTUALLY active, read from the context.
                  isSelected={language === lang.code}
                  disabled={!lang.enabled}
                  useArabicFont={overlayOpen && fontLoaded && needsArabicFont(lang.code)}
                />
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </>
  );
}

function LanguageButton({ label, onClick, isSelected, disabled, useArabicFont }) {
  // Three states:
  //   selected  — dark, this is the active language
  //   available — white, tappable
  //   disabled  — faded, "Soon", not tappable (no translation data yet)
  const base =
    'w-full h-full rounded-[5px] border transition flex flex-col items-center justify-center gap-1 text-sm text-center';

  const state = disabled
    ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
    : isSelected
      ? 'border-gray-300 bg-[#523230] text-white cursor-pointer'
      : 'border-gray-300 bg-white text-black hover:bg-gray-100 cursor-pointer';

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-disabled={disabled}
      className={`${base} ${state} ${useArabicFont ? 'font-noto-arabic' : 'font-[var(--body-text-font-family)]'}`}
      style={{ fontSize: '13px' }}
    >
      <span>{label}</span>
      {disabled && (
        <span className="text-[10px] font-normal text-gray-400">Soon</span>
      )}
    </button>
  );
}