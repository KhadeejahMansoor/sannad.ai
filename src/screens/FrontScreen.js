'use client';

import { useEffect, useRef, useState } from 'react';
import { FiEdit, FiFilter } from 'react-icons/fi';
import { FaBars } from 'react-icons/fa6';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import FilterSection from '../component/FilterSection';
import BottomPopupMenu from '../component/BottomPopupMenu';
import HadithCollectionMenu from '../component/HadithCollectionMenu';
import { useRouter } from 'next/navigation';
import { useLanguage } from '../lib/LanguageContext';
import { useLanguages } from '../hooks/useData';
import { gradeLabel, compilerLabel } from '../lib/i18n';
import { stripArabicDiacritics } from '../lib/arabic';

/* ───── Desktop‑only search box ───── */
const DesktopSearchBox = ({ searchText, setSearchText, onSearchClick, onFilterClick, placeholder = 'Search hadith...' }) => (
  <div className="relative w-[850px] h-[180px] bg-white rounded-2xl shadow-md">
    {!searchText && (
      <span className="absolute left-6 top-5 text-neutral-900/50 text-xl font-medium pointer-events-none">
        {placeholder}
      </span>
    )}
    <textarea
      value={searchText}
      onChange={(e) => setSearchText(e.target.value)}
      onKeyDown={(e) => {
        // Plain Enter submits; Shift+Enter still inserts a newline.
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          if (searchText.trim()) onSearchClick();
        }
      }}
      rows={4}
      className="absolute left-6 top-5 w-[730px] h-[130px] resize-none outline-none bg-transparent text-xl font-medium"
    />
    <button
      onClick={onFilterClick}
      className="absolute bottom-4 left-4 w-10 h-10 bg-white rounded-[5px] flex items-center justify-center"
    >
      <FiFilter className="w-6 h-8 text-stone-500" />
    </button>
    <button
      onClick={onSearchClick}
      disabled={!searchText.trim()}
      className="absolute bottom-4 right-4 w-[42px] h-[41px] p-0 disabled:cursor-not-allowed"
    >
      <svg width="42" height="41" viewBox="0 0 42 41" className="rounded-[5px]">
        <rect width="42" height="41" rx="5" fill={searchText.trim() ? '#523230' : '#C0C0C0'} />
        <path d="M21 27V14M21 14L16 19M21 14L26 19" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </button>
  </div>
);

/* ————— Updated sticky pill component ————— */
function StickyPill({ label, onRemove, type }) {
  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.8, opacity: 0 }}
      className="h-10 px-5 bg-[#523230] rounded-[20px] inline-flex justify-center items-center gap-2"
    >
      <div className="justify-start text-white text-sm font-medium font-['Inter'] leading-normal">
        {label}
      </div>
      <button
        onClick={onRemove}
        className="w-5 h-5 flex items-center justify-center hover:opacity-70 transition-opacity mt-0.5"
      >
        <svg width="19" height="18" viewBox="0 0 19 18" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M5.3 14.25L4.25 13.2L8.45 9L4.25 4.8L5.3 3.75L9.5 7.95L13.7 3.75L14.75 4.8L10.55 9L14.75 13.2L13.7 14.25L9.5 10.05L5.3 14.25Z" fill="white"/>
        </svg>
      </button>
    </motion.div>
  );
}

/* ─────────────────────────────────── */

export default function FrontScreen() {
  // This is the THIRD language bar in the codebase (Header.js and
  // LanguageMenu.js are the others). This one's buttons had no onClick at all —
  // they rendered and did nothing. All three now write to the same provider.
  const { language, isArabic, setLanguage } = useLanguage();
  const { data: langRes } = useLanguages();
  // Only the languages with data. See /api/languages for the full list.
  const languages = (langRes?.data || []).filter(l => l.enabled);

  const [showFilters, setShowFilters] = useState(false);
  const [showBottomMenu, setShowBottomMenu] = useState(false);
  const [showHadithCollectionMenu, setShowHadithCollectionMenu] = useState(false);
  const [showLangBar, setShowLangBar] = useState(false);

  const [searchText, setSearchText] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedScholars, setSelectedScholars] = useState([]);
  // Narrator chips. No i18n mapping: machine_clauses.english is already one
  // canonical name per narrator, so the value here, in the URL and in the API
  // param are the same string. Compare selectedScholars, which holds an English
  // key that gets translated to Arabic on the way to the database.
  const [selectedNarrators, setSelectedNarrators] = useState([]);

  const router = useRouter();

  /* close sidebar on outside click */
  const barRef = useRef(null);
  useEffect(() => {
    function handle(e) {
      if (showLangBar && barRef.current && !barRef.current.contains(e.target)) {
        setShowLangBar(false);
      }
    }
    window.addEventListener('mousedown', handle);
    return () => window.removeEventListener('mousedown', handle);
  }, [showLangBar]);

  const handleSearch = () => {
    if (!searchText.trim()) return;
    router.push(
      `/results?search=${encodeURIComponent(searchText)}&tags=${encodeURIComponent(
        JSON.stringify(selectedTags),
      )}&scholars=${encodeURIComponent(JSON.stringify(selectedScholars))}` +
        `&narrators=${encodeURIComponent(JSON.stringify(selectedNarrators))}`,
    );
  };

  // Check if we have any selections
  const hasSelections =
    selectedTags.length > 0 || selectedScholars.length > 0 || selectedNarrators.length > 0;

  // Handle filter button click
  const handleFilterClick = () => {
    if (!showFilters && hasSelections) {
      // If filters are closed and we have selections, clear them first
      setSelectedTags([]);
      setSelectedScholars([]);
      setSelectedNarrators([]);
    }
    setShowFilters(!showFilters);
  };

  return (
    <div className="min-h-screen bg-[#F6F4F1]">
      <div className="relative w-full mx-auto px-4 flex flex-col items-center  pt-6 pb-10
                      md:max-w-none md:min-h-screen md:px-10 md:pt-12 md:pb-16">

        {/* header icons */}
    
<div className="absolute top-5 right-4 md:top-8 md:right-8 flex items-center gap-2 z-10">
          {/* One shared button box for every icon here — w-9/md:w-10 square,
              centered contents — so the globe and the burger are the same size
              and sit on the same baseline. They used to be p-2 around icons of
              different sizes (20px vs 24px), which made two boxes of 36px and
              40px that couldn't line up. Matches Header.js. */}

          {/* edit (mobile only) */}
          <button className="w-9 h-9 bg-white rounded-md flex items-center justify-center cursor-pointer md:hidden">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-black">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="m18.5 2.5 3 3L12 15l-4 1 1-4z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          {/* world (desktop only) */}
          <button
            className="hidden md:flex w-10 h-10 bg-white rounded-md items-center justify-center cursor-pointer"
            onClick={() => setShowLangBar((p) => !p)}
            aria-label="Language"
          >
            <svg width="21" height="21" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1.43359 8.59938C1.43359 12.557 4.64171 15.7652 8.59938 15.7652C12.557 15.7652 15.7652 12.557 15.7652 8.59938C15.7652 4.64171 12.557 1.43359 8.59938 1.43359C4.64171 1.43359 1.43359 4.64171 1.43359 8.59938Z" stroke="black" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M9.31568 1.46973C9.31568 1.46973 11.4654 4.30021 11.4654 8.59968C11.4654 12.8991 9.31568 15.7296 9.31568 15.7296M7.88253 15.7296C7.88253 15.7296 5.73279 12.8991 5.73279 8.59968C5.73279 4.30021 7.88253 1.46973 7.88253 1.46973M1.88477 11.1077H15.3134M1.88477 6.09166H15.3134" stroke="black" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          {/* burger */}
          <button
            className="w-9 h-9 bg-white rounded-md flex items-center justify-center cursor-pointer md:hidden"
            onClick={() => setShowBottomMenu(true)}
            aria-label="Menu"
          >
            <FaBars className="w-5 h-5 text-black opacity-70" style={{ fontWeight: 100 }} />
          </button>
          <button
            className="hidden md:flex w-10 h-10 bg-white rounded-md items-center justify-center cursor-pointer"
            onClick={() => setShowBottomMenu(true)}
            aria-label="Menu"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 18C3.71667 18 3.47934 17.904 3.288 17.712C3.09667 17.52 3.00067 17.2827 3 17C2.99934 16.7173 3.09534 16.48 3.288 16.288C3.48067 16.096 3.718 16 4 16H20C20.2833 16 20.521 16.096 20.713 16.288C20.905 16.48 21.0007 16.7173 21 17C20.9993 17.2827 20.9033 17.5203 20.712 17.713C20.5207 17.9057 20.2833 18.0013 20 18H4ZM4 13C3.71667 13 3.47934 12.904 3.288 12.712C3.09667 12.52 3.00067 12.2827 3 12C2.99934 11.7173 3.09534 11.48 3.288 11.288C3.48067 11.096 3.718 11 4 11H20C20.2833 11 20.521 11.096 20.713 11.288C20.905 11.48 21.0007 11.7173 21 12C20.9993 12.2827 20.9033 12.5203 20.712 12.713C20.5207 12.9057 20.2833 13.0013 20 13H4ZM4 8C3.71667 8 3.47934 7.904 3.288 7.712C3.09667 7.52 3.00067 7.28267 3 7C2.99934 6.71733 3.09534 6.48 3.288 6.288C3.48067 6.096 3.718 6 4 6H20C20.2833 6 20.521 6.096 20.713 6.288C20.905 6.48 21.0007 6.71733 21 7C20.9993 7.28267 20.9033 7.52033 20.712 7.713C20.5207 7.90567 20.2833 8.00133 20 8H4Z" fill="black"/>
            </svg>
          </button>
        </div>

     {/* logo */}
<div className="mt-20 mb-8 md:mt-55 md:mb-3">
         {/* The peach disc was a wrapper background (bg-[#FFE6CA]) applied on
             mobile only and switched off at md, so the same logo sat on a pink
             circle on phones and on nothing on desktop. Dropped, and the mobile
             mark scaled up from 40px to sit closer to the desktop presence. */}
         <div className="flex items-center justify-center">
            {/* Mobile logo */}
            <Image src="/logo.svg" alt="Hadith Logo" width={96} height={96} className="md:hidden" />
            {/* Desktop logo */}
            <Image src="/logo.svg" alt="Hadith Logo" width={180} height={230} className="hidden md:block" />
          </div>
        </div>
         

        {/* mobile search */}
        <div className="md:hidden w-full h-[204px] mx-10 bg-white border border-[#523230] rounded-[5px] p-4 relative">
          <textarea
            placeholder={isArabic ? '...ابحث عن حديث' : 'Search hadith...'}
            rows={4}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (searchText.trim()) handleSearch();
              }
            }}
            className="w-full h-full resize-none outline-none bg-transparent text-sm"
          />
          <button className="absolute bottom-4 left-4 text-[#676767]" onClick={handleFilterClick}>
            <svg width="20" height="32" viewBox="0 0 24 24" fill="none" className="text-[#676767]">
              <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <button
            onClick={handleSearch}
            disabled={!searchText.trim()}
            className="absolute bottom-4 right-4 w-[42px] h-[41px]"
          >
            <svg width="42" height="41" viewBox="0 0 42 41" className="rounded-[5px]">
              <rect width="42" height="41" rx="5" fill={searchText.trim() ? '#523230' : '#C0C0C0'} />
              <path d="M21 28V12M21 12L15 18M21 12L27 18" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* desktop search */}
        <div className="hidden md:block">
          <DesktopSearchBox
            searchText={searchText}
            setSearchText={setSearchText}
            onSearchClick={handleSearch}
            onFilterClick={handleFilterClick}
            placeholder={isArabic ? '...ابحث عن حديث' : 'Search hadith...'}
          />
        </div>

        {/* Sticky Pills Below Search Bar - Only show when filters are closed and we have selections */}
        <AnimatePresence>
          {!showFilters && hasSelections && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
           className="mt-4 md:mt-8 w-full md:w-[850px]"
            >
              <div className=" space-y-2 md:space-y-4">        
                {/* First Row - Grades */}
                {selectedTags.length > 0 && (
                  <div className="flex flex-wrap gap-5">
                    {selectedTags.map((tag) => (
                      <StickyPill
                        key={`grade-${tag}`}
                        label={gradeLabel(tag, language)}
                        onRemove={() =>
                          setSelectedTags((prev) => prev.filter((t) => t !== tag))
                        }
                        type="grade"
                      />
                    ))}
                  </div>
                )}

                {/* Second Row - Scholars */}
                {selectedScholars.length > 0 && (
                  <div className="flex flex-wrap gap-5">
                    {selectedScholars.map((scholar) => (
                      <StickyPill
                        key={`scholar-${scholar}`}
                        label={compilerLabel(scholar, language)}
                        onRemove={() =>
                          setSelectedScholars((prev) => prev.filter((s) => s !== scholar))
                        }
                        type="scholar"
                      />
                    ))}
                  </div>
                )}

                {/* Third Row - Narrators. Labelled with the stored value
                    directly: the name is already canonical, and FilterSection
                    is where the Arabic label gets substituted for display. */}
                {selectedNarrators.length > 0 && (
                  <div className="flex flex-wrap gap-5">
                    {selectedNarrators.map((narrator) => (
                      <StickyPill
                        key={`narrator-${narrator}`}
                        label={narrator}
                        onRemove={() =>
                          setSelectedNarrators((prev) => prev.filter((n) => n !== narrator))
                        }
                        type="narrator"
                      />
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

       {/* language sidebar */}
{showLangBar && (
  <div
    ref={barRef}
    className="hidden md:block fixed right-[26px] top-[83px] z-50   bg-white  overflow-y-auto"
  >
            <div className="flex flex-col gap-2 px-2 py-2">
              {languages.map((lang) => {
                const active = language === lang.code;
                const disabled = !lang.enabled;
                return (
                  <button
                    key={lang.code}
                    disabled={disabled}
                    aria-disabled={disabled}
                    title={disabled ? 'No translation available yet' : undefined}
                    onClick={() => {
                      if (disabled) return;
                      setLanguage(lang.code);
                      setShowLangBar(false);
                    }}
                    className={`h-8 w-36 rounded-[5px] flex items-center px-2 text-base font-medium font-['Inter'] transition-colors ${
                      disabled
                        ? 'text-gray-300 cursor-not-allowed'
                        : active
                          ? 'bg-[#523230] text-white'
                          : 'text-black hover:bg-gray-200'
                    }`}
                    // The Arabic serif was applied to every entry, so "English" and
                    // "Français" rendered in a Naskh face while the rest of the app
                    // uses Inter. Only Arabic-script names need it.
                    style={
                    /[\u0600-\u06FF]/.test(lang.native_name || '')
                    ? { fontFamily: "'Noto Naskh Arabic', serif" }
                    : undefined
                    }
                  >
                    {stripArabicDiacritics(lang.native_name)}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* filters */}
        <AnimatePresence>
          {showFilters && (
            <FilterSection
              onClose={() => setShowFilters(false)}
              selectedTags={selectedTags}
              selectedScholars={selectedScholars}
              toggleItem={(i, l, s) =>
                s((prev) => (prev.includes(i) ? prev.filter((p) => p !== i) : [...prev, i]))
              }
              setSelectedTags={setSelectedTags}
              setSelectedScholars={setSelectedScholars}
              selectedNarrators={selectedNarrators}
              setSelectedNarrators={setSelectedNarrators}
            />
          )}
        </AnimatePresence>

        {/* bottom pop‑ups */}
        <AnimatePresence>
          {showBottomMenu && (
            <BottomPopupMenu
              onClose={() => setShowBottomMenu(false)}
              onCollectionClick={() => {
                setShowBottomMenu(false);
                setShowHadithCollectionMenu(true);
              }}
              onLanguageClick={() => setShowLangBar(true)}
              onAboutHadithClick={() => console.log('About hadith')}
              onAboutUsClick={() => console.log('About us')}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showHadithCollectionMenu && (
            <HadithCollectionMenu onClose={() => setShowHadithCollectionMenu(false)} />
          )}
        </AnimatePresence>
          
      </div>
    </div>
  );
}