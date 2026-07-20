'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCompilers, useGrades } from '../hooks/useData';
import { useLanguage } from '../lib/LanguageContext';
import { GRADE_KEYS, COMPILER_KEYS, gradeLabel, compilerLabel, gradeToDb, compilerToDb } from '../lib/i18n';

// The GRADES_ORDER / SCHOLARS_ORDER lists and their Arabic maps used to live
// here — the fourth copy in the codebase. They're now GRADE_KEYS / COMPILER_KEYS
// in lib/i18n.js. This copy was missing Malik and Mushkil, same as the others.
//
// Pills are still pruned against what the API actually returns, so 'Other'
// (أخرى, which no hadith has) drops out on its own.

const norm = (s) => s?.trim().toLowerCase();

export default function FilterSection({
  onClose,
  selectedTags,
  selectedScholars,
  toggleItem,
  setSelectedTags,
  setSelectedScholars,
}) {
  const { language, isArabic } = useLanguage();
  const { data: comp, loading: loadC } = useCompilers();
  const { data: grades, loading: loadG } = useGrades();
  const loading = loadC || loadG;

  const apiGrades = grades?.success ? grades.data : [];
  const apiScholars = comp?.success ? comp.data : [];

  // Show a pill only if the database actually has that value.
  //
  // ⚠️ `key` is the English canonical value ('Sahih', 'Ahmad'). It is what goes
  //    into selectedTags / selectedScholars, into the URL, and eventually into
  //    ResultsScreen's English→Arabic translation. Only the LABEL changes with
  //    the language. Never let the Arabic label into state.
  const gradePills = GRADE_KEYS.filter((key) =>
    apiGrades.some((g) => norm(g.grade) === norm(gradeToDb(key)))
  );

  const scholarPills = COMPILER_KEYS.filter((key) =>
    apiScholars.some((c) => norm(c.compiler ?? c) === norm(compilerToDb(key)))
  );

  const [searchQuery, setSearchQuery] = useState('');

  // Match against what the user can SEE, not the internal key.
  const filteredScholarResults = scholarPills.filter(
    (key) =>
      compilerLabel(key, language).toLowerCase().includes(searchQuery.toLowerCase()) &&
      !selectedScholars.includes(key)
  );

  const handlePillSelect = (item, currentSelected, setter) => {
    toggleItem(item, currentSelected, setter);
  };

  return (
    <>
      {/* MOBILE version */}
      <div
        className="md:hidden fixed inset-0 z-50 flex justify-center items-end bg-[#050505]/60"
        onClick={onClose}
      >
        <motion.div
          onClick={(e) => e.stopPropagation()}
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="w-full bg-white rounded-t-[22px] p-4"
        >
          <div className="flex flex-wrap gap-2 mb-9 mt-4 justify-center">
            {gradePills.map((key) => (
              <button
                key={key}
                onClick={() => toggleItem(key, selectedTags, setSelectedTags)}
                className={`h-[38px] px-5 rounded-full text-sm font-medium transition-all duration-200 flex items-center justify-center border ${
                  selectedTags.includes(key)
                    ? 'bg-[#523230] border-[#523230] text-white'
                    : 'bg-white border-[#E4DCD6] text-[#523230] hover:bg-[#FAF5F3]'
                }`}
              >
                {gradeLabel(key, language)}
              </button>
            ))}
          </div>

          <hr className="my-4 border-[#E4DCD6] w-[350px] mx-auto" />

          <div className="flex flex-wrap gap-2 mb-8 mt-8 justify-center">
            {scholarPills.map((key) => (
              <button
                key={key}
                onClick={() => toggleItem(key, selectedScholars, setSelectedScholars)}
                className={`h-[38px] px-5 rounded-full text-sm font-medium transition-all duration-200 flex items-center justify-center border ${
                  selectedScholars.includes(key)
                    ? 'bg-[#523230] border-[#523230] text-white'
                    : 'bg-white border-[#E4DCD6] text-[#523230] hover:bg-[#FAF5F3]'
                }`}
              >
                {compilerLabel(key, language)}
              </button>
            ))}
          </div>

          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isArabic ? '…ابحث في المجموعات' : 'Search hadith collections…'}
            className="w-full border border-[#E4DCD6] rounded-[13px] px-4 py-3 text-sm text-[#523230] outline-none focus:border-[#523230] focus:ring-1 focus:ring-[#EDE4E1] placeholder:text-[#9A8A85]"
          />

          {searchQuery && (
            <ul className="mt-2 space-y-1 max-h-32 overflow-y-auto">
              {filteredScholarResults.length > 0 ? (
                filteredScholarResults.map((key) => (
                  <li
                    key={key}
                    onClick={() => toggleItem(key, selectedScholars, setSelectedScholars)}
                    className="text-gray-700 text-sm font-medium px-3 py-1 cursor-pointer hover:bg-[#EDEDED] hover:text-black rounded-md"
                  >
                    {compilerLabel(key, language)}
                  </li>
                ))
              ) : (
                <li className="text-gray-400 text-sm px-2">{isArabic ? 'لا توجد نتائج' : 'No matches'}</li>
              )}
            </ul>
          )}

          {loading && <LoaderOverlay />}
        </motion.div>
      </div>

      {/* DESKTOP panel */}
      <div className="hidden md:block w-full max-w-[800px] mx-auto mt-12 space-y-6 relative z-10">
        {gradePills.length === 0 && scholarPills.length === 0 && !loading && (
          <div className="text-center text-gray-500 py-6">
            {isArabic ? 'لا توجد خيارات تصفية.' : 'No filter options available.'}
          </div>
        )}

        {gradePills.length > 0 && (
          <div className="flex flex-wrap gap-3 justify-center">
            {gradePills.map((key) => (
              <Pill
                key={key}
                label={gradeLabel(key, language)}
                active={selectedTags.includes(key)}
                onClick={() => handlePillSelect(key, selectedTags, setSelectedTags)}
              />
            ))}
          </div>
        )}

        {gradePills.length > 0 && scholarPills.length > 0 && (
          <hr className="border-t border-gray-300 max-w-[280px] mx-auto" />
        )}

        {scholarPills.length > 0 && (
          <div className="flex flex-wrap gap-3 justify-center">
            {scholarPills.map((key) => (
              <Pill
                key={key}
                label={compilerLabel(key, language)}
                active={selectedScholars.includes(key)}
                onClick={() => handlePillSelect(key, selectedScholars, setSelectedScholars)}
              />
            ))}
          </div>
        )}

        {loading && <LoaderOverlay />}
      </div>
    </>
  );
}

function Pill({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`h-[32px] px-6 rounded-full text-sm font-medium transition
        ${active ? 'bg-[#523230] text-white' : 'bg-[#D9D9D9] text-gray-800 hover:bg-[#CFCFCF]'}`}
    >
      {label}
    </button>
  );
}

const LoaderOverlay = () => (
  <div className="absolute inset-0 flex items-center justify-center bg-white/70 rounded-md">
    <span className="text-sm text-gray-500">Loading filters…</span>
  </div>
);