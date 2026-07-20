'use client';
import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../lib/LanguageContext';
import { GRADE_KEYS, COMPILER_KEYS, gradeLabel, compilerLabel } from '../lib/i18n';

// The GRADES / COMPILERS arrays that used to live here are gone — they're now
// GRADE_KEYS / COMPILER_KEYS in lib/i18n.js, shared with ResultsScreen and
// HadithCollectionMenu. Three copies had drifted apart; this one was missing
// Mushkil (2,150 hadiths), which meant that grade could not be filtered at all.

/**
 * Floating filter popup, below the search bar.
 *
 * ⚠️ The chip VALUE is always the English key ('Sahih', 'Ahmad'). Only the
 *    label changes with the language. selectedGrades / selectedCompilers keep
 *    holding English, so the URL (?tags=["Sahih"]) and every shared link keep
 *    working — and ResultsScreen's English→Arabic translation still applies.
 *    Never send the Arabic label upward.
 */
export default function FilterPopup({
  selectedGrades = [],
  selectedCompilers = [],
  onToggleGrade,
  onToggleCompiler,
  onClear,
  onSubmit,
  onClose,
}) {
  const popupRef = useRef(null);
  const { language, isArabic } = useLanguage();

  useEffect(() => {
    function handleClickOutside(e) {
      if (popupRef.current && !popupRef.current.contains(e.target)) {
        const funnelBtn = document.querySelector('[data-funnel-button]');
        if (funnelBtn && (funnelBtn.contains(e.target) || funnelBtn === e.target)) {
          return;
        }
        onClose();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const hasAnySelection = selectedGrades.length > 0 || selectedCompilers.length > 0;

  const t = {
    clearAll: isArabic ? 'مسح الكل' : 'Clear all',
    search:   isArabic ? 'بحث'      : 'Search',
  };

  return (
    <motion.div
      ref={popupRef}
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.15 }}
      className="absolute top-full mt-2 right-0 z-50 w-[420px] bg-white rounded-[8px] shadow-lg border border-gray-100 p-5"
      dir={isArabic ? 'rtl' : 'ltr'}
    >
      {hasAnySelection && (
        <div className={`flex mb-2 ${isArabic ? 'justify-start' : 'justify-end'}`}>
          <button
            onClick={onClear}
            className="text-xs text-gray-500 hover:text-gray-800 transition-colors"
          >
            {t.clearAll}
          </button>
        </div>
      )}

      {/* ── Grade chips ── */}
      <div className="flex flex-wrap gap-2 mb-4">
        {GRADE_KEYS.map(key => (
          <Chip
            key={key}
            label={gradeLabel(key, language)}   /* display */
            selected={selectedGrades.includes(key)}
            onClick={() => onToggleGrade(key)}  /* value stays English */
          />
        ))}
      </div>

      <div className="h-px bg-gray-200 mb-4" />

      {/* ── Compiler chips ── */}
      <div className="flex flex-wrap gap-2 mb-4">
        {COMPILER_KEYS.map(key => (
          <Chip
            key={key}
            label={compilerLabel(key, language)}
            selected={selectedCompilers.includes(key)}
            onClick={() => onToggleCompiler(key)}
          />
        ))}
      </div>

      <div className={`flex pt-2 border-t border-gray-100 ${isArabic ? 'justify-start' : 'justify-end'}`}>
        <button
          onClick={onSubmit}
          className="px-5 py-2 bg-[#523230] text-white text-sm font-medium rounded-[6px] hover:bg-[#412725] transition-colors"
        >
          {t.search}
        </button>
      </div>
    </motion.div>
  );
}

function Chip({ label, selected, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`h-[32px] px-4 rounded-[16px] text-sm font-medium transition-colors ${
        selected
          ? 'bg-[#523230] text-white'
          : 'bg-[#E6DEDA] text-gray-700 hover:bg-[#DDD2CD]'
      }`}
    >
      {label}
    </button>
  );
}