'use client';
import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../lib/LanguageContext';
import { GRADE_KEYS, COMPILER_KEYS, gradeLabel, compilerLabel } from '../lib/i18n';
import { useNarrators, useNarratorSearch } from '../hooks/useData';

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
  selectedNarrators = [],
  onToggleGrade,
  onToggleCompiler,
  onToggleNarrator,
  onClear,
  onSubmit,
  onClose,
}) {
  const popupRef = useRef(null);
  const { language, isArabic } = useLanguage();

  // Narrator chips are FETCHED, not declared. GRADE_KEYS and COMPILER_KEYS are
  // short fixed lists; narrators number 3,621, so the top nine come from the
  // API and the rest are reachable through the search box below them.
  const { data: narratorChips } = useNarrators();
  const [narratorQuery, setNarratorQuery] = useState('');
  const { data: narratorResults, loading: narratorSearching } = useNarratorSearch(narratorQuery);

  // A narrator picked from the search box is still selected once the query is
  // cleared, but its chip is gone — so any selection that isn't in the top nine
  // gets its own chip appended, otherwise there'd be no way to deselect it.
  const chipNames = narratorChips.map((n) => n.narrator);
  const extraSelected = selectedNarrators.filter((n) => !chipNames.includes(n));

  const narratorLabel = (row) =>
    isArabic && row.narrator_ar ? row.narrator_ar : row.narrator;

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

  const hasAnySelection =
    selectedGrades.length > 0 || selectedCompilers.length > 0 || selectedNarrators.length > 0;

  const t = {
    clearAll:  isArabic ? 'مسح الكل'          : 'Clear all',
    search:    isArabic ? 'بحث'               : 'Search',
    narrators: isArabic ? 'الرواة'            : 'Narrators',
    searchNar: isArabic ? '…ابحث عن راوٍ'     : 'Search other narrators…',
    noMatches: isArabic ? 'لا توجد نتائج'     : 'No matches',
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

      <div className="h-px bg-gray-200 mb-4" />

      {/* ── Narrator chips ── */}
      {/* Ordered by hadith count, so the nine most prolific narrators — Abu
          Hurairah through Abdullah bin Amr bin As — are one tap away. */}
      <div className="flex flex-wrap gap-2 mb-3">
        {narratorChips.map((row) => (
          <Chip
            key={row.narrator}
            label={narratorLabel(row)}
            selected={selectedNarrators.includes(row.narrator)}
            onClick={() => onToggleNarrator(row.narrator)}
          />
        ))}
        {extraSelected.map((name) => (
          <Chip
            key={name}
            label={name}
            selected
            onClick={() => onToggleNarrator(name)}
          />
        ))}
      </div>

      {/* ── The other 3,612 ── */}
      <div className="flex items-center gap-2 w-full bg-white border border-[#E4DCD6] rounded-[8px] px-3 py-2 mb-4 focus-within:border-[#523230]">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" className="flex-shrink-0" aria-hidden="true">
          <circle cx="11" cy="11" r="7" stroke="#9A8A85" strokeWidth="2" />
          <path d="M20 20l-3.5-3.5" stroke="#9A8A85" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <input
          type="text"
          value={narratorQuery}
          onChange={(e) => setNarratorQuery(e.target.value)}
          placeholder={t.searchNar}
          className="w-full bg-transparent text-sm text-[#523230] outline-none placeholder:text-[#9A8A85]"
        />
      </div>

      {narratorQuery.trim() && (
        <ul className="mb-4 max-h-40 overflow-y-auto space-y-1">
          {narratorSearching ? (
            <li className="text-gray-400 text-sm px-2">…</li>
          ) : narratorResults.length > 0 ? (
            narratorResults.map((row) => (
              <li
                key={row.narrator}
                onClick={() => onToggleNarrator(row.narrator)}
                className={`text-sm font-medium px-3 py-1 cursor-pointer rounded-md ${
                  selectedNarrators.includes(row.narrator)
                    ? 'bg-[#523230] text-white'
                    : 'text-gray-700 hover:bg-[#EDEDED] hover:text-black'
                }`}
              >
                {narratorLabel(row)}
              </li>
            ))
          ) : (
            <li className="text-gray-400 text-sm px-2">{t.noMatches}</li>
          )}
        </ul>
      )}

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