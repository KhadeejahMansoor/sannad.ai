'use client';
import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '../lib/LanguageContext';
import { COMPILER_KEYS, compilerLabel } from '../lib/i18n';

// The list moved to lib/i18n.js (COMPILER_KEYS) so it can't drift away from
// the copies that used to live in FilterPopup and ResultsScreen.

export default function HadithCollectionMenu({ onClose }) {
  const popupRef = useRef();
  const router = useRouter();
  const { language, isArabic } = useLanguage();
  const [selectedScholar, setSelectedScholar] = useState(null);

  // Close when clicking outside.
  // CRITICAL: We delay attaching the listener by one frame, otherwise the
  // very tap/click that opened this menu would bubble up to document.mousedown
  // here and immediately call onClose(). On mobile this manifests as "the
  // menu never appears" — it opens and closes within the same gesture.
  useEffect(() => {
    function handleClickOutside(event) {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        onClose();
      }
    }
    const t = setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside);
    }, 0);
    return () => {
      clearTimeout(t);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  const handleScholarClick = (scholar) => {
    setSelectedScholar(scholar);
    // Navigate to the compiler's collection page, passing the English name.
    // The destination page (HadithByCompiler) handles translation to Arabic.
    router.push(`/desktopcompiler?compiler=${encodeURIComponent(scholar)}`);
    onClose();
  };

  return (
    <>
      {/* Background overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        onClick={onClose}
        className="fixed inset-0 w-screen h-screen bg-black/60 z-40"
      />

      {/* Popup content */}
      <motion.div
        ref={popupRef}
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ duration: 0.3 }}
        className="fixed bottom-0 left-0 z-50 w-screen bg-white px-0 py-4 rounded-t-[5px]"
      >
        <div className="space-y-1 max-h-96 overflow-y-auto hide-scrollbar px-2 pt-1">
          {/* Label follows the language; the VALUE stays the English key, because
              that's what goes in the URL (?compiler=Ahmad) and what
              HadithByCompiler translates to Arabic on arrival. */}
          {COMPILER_KEYS.map((scholar) => (
            <ScholarItem
              key={scholar}
              name={compilerLabel(scholar, language)}
              isArabic={isArabic}
              onClick={() => handleScholarClick(scholar)}
              isSelected={selectedScholar === scholar}
            />
          ))}
        </div>
      </motion.div>
    </>
  );
}

function ScholarItem({ name, onClick, isSelected, isArabic }) {
  return (
    <div
      onClick={onClick}
      className="mx-auto max-w-[390px] h-8 px-2 text-center font-normal text-black cursor-pointer transition-all duration-200 flex items-center justify-center rounded-[5px]"
      dir={isArabic ? 'rtl' : 'ltr'}
      lang={isArabic ? 'ar' : 'en'}
      style={{
        fontFamily: 'Inter',
        fontSize: '15.23px',
        backgroundColor: isSelected ? '#E5E7EB' : 'white'
      }}
      onMouseEnter={(e) => {
        if (!isSelected) e.currentTarget.style.backgroundColor = '#EDEDED';
      }}
      onMouseLeave={(e) => {
        if (!isSelected) e.currentTarget.style.backgroundColor = 'white';
      }}
    >
      {name}
    </div>
  );
}