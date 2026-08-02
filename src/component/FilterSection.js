'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCompilers, useGrades, useNarrators, useNarratorSearch } from '../hooks/useData';
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
  selectedNarrators = [],
  setSelectedNarrators = () => {},
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

  // Narrator chips come from the API, not a constant. There are 3,621
  // narrators; nine of them account for 42,900 of the 80,661 hadiths, so those
  // nine get chips and the rest are reachable by typing.
  const { data: narratorChips } = useNarrators();
  const [narratorQuery, setNarratorQuery] = useState('');
  const { data: narratorResults } = useNarratorSearch(narratorQuery);

  const narratorLabel = (row) =>
    isArabic && row.narrator_ar ? row.narrator_ar : row.narrator;

  // A narrator chosen from the search box keeps its chip after the query is
  // cleared — otherwise it would be selected with no way to unselect it.
  const chipNames = narratorChips.map((n) => n.narrator);
  const extraSelected = selectedNarrators.filter((n) => !chipNames.includes(n));

  const toggleNarrator = (name) =>
    setSelectedNarrators((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );

  const narratorBlock = (pillClass) => (
    <>
      <div className="flex flex-wrap gap-2 justify-center mb-4">
        {narratorChips.map((row) => (
          <button
            key={row.narrator}
            onClick={() => toggleNarrator(row.narrator)}
            className={pillClass(selectedNarrators.includes(row.narrator))}
          >
            {narratorLabel(row)}
          </button>
        ))}
        {extraSelected.map((name) => (
          <button key={name} onClick={() => toggleNarrator(name)} className={pillClass(true)}>
            {name}
          </button>
        ))}
        {/* Opens the type-ahead over the remaining ~3,612 narrators. Closing it
            also clears the query, so reopening starts clean rather than showing
            stale results from a previous search. */}
        <button
          onClick={() => {
            if (showNarratorSearch) setNarratorQuery('');
            setShowNarratorSearch((v) => !v);
          }}
          className={pillClass(showNarratorSearch)}
        >
          {isArabic ? 'أخرى' : 'Other'}
        </button>
      </div>

      {showNarratorSearch && (
      <div className="flex items-center gap-2 w-full bg-white border border-[#E4DCD6] rounded-[13px] px-4 py-3 focus-within:border-[#523230]">
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" className="flex-shrink-0" aria-hidden="true">
          <circle cx="11" cy="11" r="7" stroke="#9A8A85" strokeWidth="2" />
          <path d="M20 20l-3.5-3.5" stroke="#9A8A85" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <input
          type="text"
          value={narratorQuery}
          onChange={(e) => setNarratorQuery(e.target.value)}
          placeholder={isArabic ? '…ابحث عن راوٍ' : 'Search other narrators…'}
          className="w-full bg-transparent text-sm text-[#523230] outline-none placeholder:text-[#9A8A85]"
        />
      </div>
      )}

      {showNarratorSearch && narratorQuery.trim() && (
        <ul className="mt-2 space-y-1 max-h-32 overflow-y-auto">
          {narratorResults.length > 0 ? (
            narratorResults.map((row) => (
              <li
                key={row.narrator}
                onClick={() => toggleNarrator(row.narrator)}
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
            <li className="text-gray-400 text-sm px-2">{isArabic ? 'لا توجد نتائج' : 'No matches'}</li>
          )}
        </ul>
      )}
    </>
  );

  const mobilePill = (active) =>
    `h-[38px] px-5 rounded-full text-sm font-medium transition-all duration-200 flex items-center justify-center border ${
      active
        ? 'bg-[#523230] border-[#523230] text-white'
        : 'bg-white border-[#E4DCD6] text-[#523230] hover:bg-[#FAF5F3]'
    }`;

  const desktopPill = (active) =>
    `h-[32px] px-6 rounded-full text-sm font-medium transition ${
      active ? 'bg-[#523230] text-white' : 'bg-[#D9D9D9] text-gray-800 hover:bg-[#CFCFCF]'
    }`;

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
          className="w-full bg-[#ECEAE4] rounded-t-[22px] p-4"
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

          <hr className="my-4 border-[#DDD8D0] w-[350px] mx-auto" />

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

          <hr className="my-4 border-[#DDD8D0] w-[350px] mx-auto" />

          <div className="mb-8 mt-8">{narratorBlock(mobilePill)}</div>

          <hr className="my-4 border-[#DDD8D0] w-[350px] mx-auto" />

          <div className="flex items-center gap-2 w-full bg-white border border-[#E4DCD6] rounded-[13px] px-4 py-3 focus-within:border-[#523230]">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" className="flex-shrink-0" aria-hidden="true">
              <circle cx="11" cy="11" r="7" stroke="#9A8A85" strokeWidth="2" />
              <path d="M20 20l-3.5-3.5" stroke="#9A8A85" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isArabic ? '…ابحث في المجموعات' : 'Search hadith collections…'}
              className="w-full bg-transparent text-sm text-[#523230] outline-none placeholder:text-[#9A8A85]"
            />
          </div>

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

        {(gradePills.length > 0 || scholarPills.length > 0) && (
          <hr className="border-t border-gray-300 max-w-[280px] mx-auto" />
        )}

        <div className="max-w-[520px] mx-auto">{narratorBlock(desktopPill)}</div>

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