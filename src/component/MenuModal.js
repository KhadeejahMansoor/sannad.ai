'use client';

import { useEffect, useRef, useState } from 'react';
import { Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
  useBooksByCompiler,
  useChaptersByBook,
  useSectionsByChapter,
} from '@/hooks/useData';
import { useScrollLock } from '../lib/useScrollLock';
import { useLanguage, pickLabel } from '../lib/LanguageContext';
import HadithText from './HadithText';

// ─── Hash slider modal (unchanged) ─────────────────────────────────────
// Number-pad style modal for jumping directly to a hadith number.
// Same behavior as before; only re-pasted so this file is self-contained.
const RotatingHadithSlider = ({
  min = 1,
  max = 7563,
  value = 3250,
  onChange = () => {},
  onNavigate = () => {},
  title = "Bukhari",
  primaryColor = "#059669",
  visibleLines = 21,
  className = ""
}) => {
  const [currentValue, setCurrentValue] = useState(value);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(0);
  const [showSearch, setShowSearch] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const containerRef = useRef(null);
  const searchInputRef = useRef(null);

  const handleValueChange = (newValue) => {
    const clampedValue = Math.max(min, Math.min(max, newValue));
    setCurrentValue(clampedValue);
    onChange(clampedValue);
  };

  const handleMouseDown = (e) => { setIsDragging(true); setDragStart(e.clientX); };
  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const deltaX = e.clientX - dragStart;
    const valueChange = Math.round(deltaX * 0.5);
    const newValue = Math.max(min, Math.min(max, currentValue + valueChange));
    if (newValue !== currentValue) {
      handleValueChange(newValue);
      setDragStart(e.clientX);
    }
  };
  const handleMouseUp = () => setIsDragging(false);
  const handleTouchStart = (e) => { setIsDragging(true); setDragStart(e.touches[0].clientX); };
  const handleTouchMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const deltaX = e.touches[0].clientX - dragStart;
    const valueChange = Math.round(deltaX * 0.5);
    const newValue = Math.max(min, Math.min(max, currentValue + valueChange));
    if (newValue !== currentValue) {
      handleValueChange(newValue);
      setDragStart(e.touches[0].clientX);
    }
  };
  const handleTouchEnd = () => setIsDragging(false);
  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 1 : -1;
    handleValueChange(Math.max(min, Math.min(max, currentValue + delta)));
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleTouchEnd);
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging, currentValue, dragStart]);

  useEffect(() => { setCurrentValue(value); }, [value]);

  useEffect(() => {
    if (showSearch && searchInputRef.current) {
      searchInputRef.current.focus();
      searchInputRef.current.select();
    }
  }, [showSearch]);

  const handleNumberClick = () => {
    if (!showSearch) setSearchValue(currentValue.toString()); else setSearchValue('');
    setShowSearch(!showSearch);
  };
  const handleSearchSubmit = () => {
    const numValue = parseInt(searchValue, 10);
    if (!isNaN(numValue) && numValue >= min && numValue <= max) {
      handleValueChange(numValue);
      setShowSearch(false);
      setSearchValue('');
      setTimeout(() => onNavigate(), 100);
    }
  };
  const handleSearchChange = (e) => {
    const v = e.target.value;
    if (v === '' || /^\d+$/.test(v)) setSearchValue(v);
  };
  const handleKeyPress = (e) => { if (e.key === 'Enter') handleSearchSubmit(); };

  return (
    <div className={`w-full max-w-sm mx-auto bg-white rounded-3xl px-8 py-4 ${className}`}>
      <div className="text-center mb-2">
        <h3 className="text-xl font-medium text-gray-600 mb-2">{title}</h3>
        <div
          className="text-4xl font-bold text-gray-900 mb-1 cursor-pointer hover:text-[#523230] transition-colors active:scale-95 transform"
          onClick={handleNumberClick}
        >
          {currentValue}
        </div>
        {showSearch && (
          <div className="mt-4 px-4">
            <input
              ref={searchInputRef}
              type="text"
              value={searchValue}
              onChange={handleSearchChange}
              onKeyPress={handleKeyPress}
              placeholder={`Enter number (${min}-${max})`}
              className="w-full px-4 py-2 text-base text-gray-900 bg-white border-2 border-[#523230] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#523230] focus:border-transparent"
            />
          </div>
        )}
      </div>
      <div
        ref={containerRef}
        className="relative h-0 flex items-end justify-between mb-0 cursor-grab active:cursor-grabbing select-none px-1 overflow-hidden"
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onWheel={handleWheel}
        style={{ touchAction: 'none' }}
      />
    </div>
  );
};

const HashModal = ({ isOpen, onClose, onCompleteClose, selectedHadithNumber, setSelectedHadithNumber, compilerLabel = 'Azami' }) => {
  const hashModalRef = useRef(null);

  // The lock used to sit in the effect below, with this cleanup:
  //     if (!isOpen) document.body.style.overflow = '';
  // A cleanup closes over the PREVIOUS render's values, so when isOpen went
  // true → false it ran with isOpen still true — and never unlocked. Acquired
  // on open, released on never. That is what froze the results page.
  useScrollLock(isOpen);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (hashModalRef.current && !hashModalRef.current.contains(event.target)) onClose();
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  const handleGoClick = () => {
    onClose();
    if (onCompleteClose) onCompleteClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[5000] backdrop-blur-[2px] bg-[#060606]/50 flex items-end justify-center">
      <div
        ref={hashModalRef}
        className="w-full bg-white shadow-xl flex flex-col overflow-hidden font-[Inter]"
        style={{ height: '300px' }}
      >
        <div className="w-[101px] h-0 outline outline-2 outline-offset-[-1px] outline-[#666666] mx-auto mt-2 mb-1" />
        <div className="flex items-center justify-between px-4 pt-2 pb-2 border-b border-gray-100">
          <div className="text-black text-2xl font-semibold">{compilerLabel}</div>
          <button onClick={onClose} className="w-8 h-8 cursor-pointer flex items-center justify-center hover:bg-gray-100 rounded-full">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
        <div className="flex-1 bg-white flex flex-col justify-center items-center px-4 pt-4 pb-6 overflow-hidden">
          <div className="mb-0 w-full flex justify-center">
            <RotatingHadithSlider
              min={1}
              max={7563}
              value={selectedHadithNumber}
              onChange={setSelectedHadithNumber}
              onNavigate={handleGoClick}
              title={compilerLabel}
              primaryColor="#523230"
              visibleLines={29}
            />
          </div>
          <div className="mt-2">
            <button
              onClick={handleGoClick}
              className="w-[331px] bg-[#523230] text-white py-3 rounded-lg font-medium text-base hover:bg-[#164A38] transition-colors"
            >
              Go
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Main MenuModal ────────────────────────────────────────────────────
// 3-level hierarchy fed by real DB data:
//   Books  (useBooksByCompiler)
//     └── Chapters (useChaptersByBook, lazy — only fetched once a book is opened)
//           └── Sections (useSectionsByChapter, lazy — only fetched once a chapter is opened)
//
// Selection is stored as { book, chapter, section }; each click sets it to the
// most-specific level the user just tapped. The Go button navigates to
// /desktopcompiler with those values as URL params, where the compiler page
// already knows how to filter via useHadithsByFilters.
//
// `compiler` is the Arabic DB value (e.g. "الأعظمي"); `compilerLabel` is the
// English display name (e.g. "Azami") used in the header. Both come from
// ResultsScreen, which knows them from the URL the user arrived with.
export default function MenuModal({
  onClose,
  onHashClick,
  compiler,            // Arabic compiler string (DB value)
  compilerLabel,       // English label for the header
}) {
  const router = useRouter();
  const { language } = useLanguage();
  const [searchText, setSearchText] = useState('');
  const [isSearchVisible, setIsSearchVisible] = useState(false);

  // Which book is "open" (its chapters visible). Null = none open.
  const [openBook, setOpenBook] = useState(null);
  // Which chapter is "open" (its sections visible). Null = none open.
  const [openChapter, setOpenChapter] = useState(null);

  // What the user has explicitly selected. Each level is independent:
  // selecting a book clears the chapter/section selection; selecting a chapter
  // clears section. The Go button uses whichever is set.
  const [sel, setSel] = useState({ book: null, chapter: null, section: null });

  const [isHashModalOpen, setIsHashModalOpen] = useState(false);
  const [selectedHadithNumber, setSelectedHadithNumber] = useState(3230);

  const modalRef = useRef(null);

  // Books for this compiler (top-level list).
  const { data: booksRes, loading: booksLoading } = useBooksByCompiler(compiler);
  const books = booksRes?.success ? booksRes.data : [];

  // Chapters for the currently-open book (lazy: only when one is opened).
  const { data: chaptersRes } = useChaptersByBook(compiler, openBook);
  const chapters = chaptersRes?.success ? chaptersRes.data : [];

  // Sections for the currently-open (book, chapter).
  const { data: sectionsRes } = useSectionsByChapter(compiler, openBook, openChapter);
  const sections = sectionsRes?.success ? sectionsRes.data : [];

  // Open for as long as it's mounted, so it holds the lock the whole time.
  //
  // The old cleanup read `if (!isHashModalOpen) unlock`, which SKIPPED the
  // unlock whenever the hash modal was open at teardown: open the menu, open
  // the hash modal, close both, page stays frozen. useScrollLock counts
  // holders, so this and HashModal can both hold it and the page only unlocks
  // when the last one lets go.
  useScrollLock(true);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target) && !isHashModalOpen) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose, isHashModalOpen]);

  const handleHashClick = (e) => {
    e.stopPropagation();
    setIsHashModalOpen(true);
  };

  // Tapping a book: toggle it open/closed. Mark it as the current selection
  // (book level) and clear any chapter/section selection.
  const handleBookClick = (book) => {
    if (openBook === book) {
      setOpenBook(null);
      setOpenChapter(null);
    } else {
      setOpenBook(book);
      setOpenChapter(null);
    }
    setSel({ book, chapter: null, section: null });
  };

  // Tapping a chapter: toggle it open/closed; selection moves down to chapter.
  const handleChapterClick = (chapter) => {
    if (openChapter === chapter) {
      setOpenChapter(null);
    } else {
      setOpenChapter(chapter);
    }
    setSel({ book: openBook, chapter, section: null });
  };

  // Tapping a section: leaf — selection moves down to section. No expansion below.
  const handleSectionClick = (section) => {
    setSel({ book: openBook, chapter: openChapter, section });
  };

  const handleGo = () => {
    // If nothing was selected, just close — no navigation.
    if (!sel.book && !sel.chapter && !sel.section) {
      onClose();
      return;
    }
    // Always carry the compiler label since /desktopcompiler reads it from the URL.
    const params = new URLSearchParams({ compiler: compilerLabel || '' });
    if (sel.book)    params.set('book', sel.book);
    if (sel.chapter) params.set('chapter', sel.chapter);
    if (sel.section) params.set('section', sel.section);
    router.push(`/desktopcompiler?${params.toString()}`);
    onClose();
  };

  // Filter applied to all three lists when the user types in the search box.
  const matches = (item) => {
    if (!searchText.trim()) return true;
    const label = pickLabel(item, language) || '';
    return label.toLowerCase().includes(searchText.trim().toLowerCase());
  };

  return (
    <>
      {!isHashModalOpen && (
        <div className="fixed inset-0 z-[2000] backdrop-blur-[2px] bg-[#060606]/40 flex items-end justify-center">
          <div
            ref={modalRef}
            className="w-full h-[75%] bg-white shadow-md flex flex-col overflow-hidden font-[Inter]"
          >
            <div className="w-[101px] h-0 outline outline-2 outline-offset-[-1px] outline-[#666666] mx-auto mt-2 mb-1" />

            {/* Header: compiler label + hash + search icons */}
            <div className="flex items-center justify-between px-4 pt-2 pb-2">
              <div className="text-black text-2xl font-semibold">
                {compilerLabel || 'Compiler'}
              </div>
              <div className="flex items-center gap-3">
                <div
                  onClick={handleHashClick}
                  className="w-6 h-6 cursor-pointer flex items-center justify-center hover:bg-gray-100 rounded"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M3.74806 16.1587H6.81191L5.89777 20.6989C5.87768 20.8049 5.86764 20.9125 5.86777 21.0204C5.86777 21.5124 6.20891 21.7837 6.6812 21.7837C7.16334 21.7837 7.51477 21.5222 7.61549 21.0302L8.59949 16.1587H13.3506L12.4369 20.6989C12.4069 20.7992 12.3971 20.9201 12.3971 21.0204C12.3971 21.5124 12.7386 21.7837 13.2208 21.7837C13.7029 21.7837 14.0543 21.5222 14.1551 21.0302L15.1283 16.1587H18.7142C19.2666 16.1587 19.6485 15.7571 19.6485 15.2145C19.6485 14.7727 19.3472 14.4109 18.8951 14.4109H15.4896L16.5555 9.10737H20.0711C20.6239 9.10737 21.0053 8.7058 21.0053 8.16323C21.0053 7.72137 20.7041 7.35965 20.2519 7.35965H16.9069L17.7306 3.3118C17.7405 3.25137 17.7606 3.12065 17.7606 2.99037C17.7606 2.49794 17.4092 2.2168 16.9271 2.2168C16.3648 2.2168 16.1136 2.52794 16.0129 3.00023L15.1292 7.35965H10.3776L11.2013 3.3118C11.2112 3.25137 11.2313 3.12065 11.2313 2.99037C11.2313 2.49794 10.8696 2.2168 10.3978 2.2168C9.8252 2.2168 9.56377 2.52794 9.47334 3.00023L8.58963 7.35965H5.2952C4.74234 7.35965 4.36091 7.78137 4.36091 8.3338C4.36091 8.78594 4.6622 9.10737 5.11434 9.10737H8.2382L7.1732 14.4109H3.92891C3.37606 14.4109 2.99463 14.8327 2.99463 15.3851C2.99463 15.8372 3.29591 16.1587 3.74806 16.1587ZM8.95091 14.4109L10.0262 9.10737H14.7769L13.7021 14.4109H8.95091Z"
                      fill="black"
                    />
                  </svg>
                </div>
                <div
                  onClick={() => setIsSearchVisible(!isSearchVisible)}
                  className="w-6 h-6 cursor-pointer flex items-center justify-center ml-[20px]"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="24" height="24" fill="white" fillOpacity="0.01" />
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M16.0002 10.4002C16.0002 13.493 13.493 16.0002 10.4002 16.0002C7.3074 16.0002 4.8002 13.493 4.8002 10.4002C4.8002 7.3074 7.3074 4.8002 10.4002 4.8002C13.493 4.8002 16.0002 7.3074 16.0002 10.4002ZM14.8943 16.0256C13.6626 17.0111 12.1002 17.6002 10.4002 17.6002C6.42375 17.6002 3.2002 14.3766 3.2002 10.4002C3.2002 6.42375 6.42375 3.2002 10.4002 3.2002C14.3766 3.2002 17.6002 6.42375 17.6002 10.4002C17.6002 12.1002 17.0111 13.6626 16.0256 14.8943L20.566 19.4344C20.8783 19.7469 20.8783 20.2535 20.566 20.566C20.2535 20.8783 19.7469 20.8783 19.4344 20.566L14.8943 16.0256Z"
                      fill={isSearchVisible ? '#296851' : '#000714'}
                      fillOpacity="0.9"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {isSearchVisible && (
              <div className="px-4 py-3">
                <div className="relative flex items-center w-full h-10 bg-white rounded-[5px] border border-[#35A47A]">
                  <Search className="absolute left-3 text-gray-400" size={17} />
                  <input
                    type="text"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    placeholder="Search books, chapters, sections..."
                    className="w-full pl-10 pr-3 py-3 text-base text-gray-700 focus:outline-none rounded-[5px]"
                  />
                </div>
              </div>
            )}

            {/* List body */}
            <div className="flex-1 overflow-auto px-4 py-2 scrollbar-hide" dir="ltr" lang="en">
              {!compiler && (
                <div className="text-sm text-gray-500 italic px-2 py-4" dir="ltr">
                  No compiler selected.
                </div>
              )}
              {compiler && booksLoading && (
                <div className="text-sm text-gray-500 px-2 py-4" dir="ltr">Loading books…</div>
              )}
              {compiler && !booksLoading && books.length === 0 && (
                <div className="text-sm text-gray-500 italic px-2 py-4" dir="ltr">
                  No books found for this compiler.
                </div>
              )}

              {compiler && !booksLoading && books.length > 0 && (
                <div className="text-[11px] font-semibold tracking-wide text-gray-400 uppercase px-1 mb-2 mt-1">
                  Books
                </div>
              )}

              {books.filter(matches).filter((book) => !openBook || book.value === openBook).map((book) => {
                const bookVal = book.value;
                const isOpen = openBook === bookVal;
                const isSelectedBook = sel.book === bookVal && !sel.chapter && !sel.section;

                return (
                  <div key={bookVal} className="mb-[7px]">
                    {/* Book row */}
                    <div
                      onClick={() => handleBookClick(bookVal)}
                      className={`flex items-center gap-2 px-2 py-1.5 text-[13px] leading-[1.6] cursor-pointer rounded-[5px] transition-colors ${
                        isSelectedBook || isOpen
                          ? 'bg-[#F1E9E6] text-[#2E1F1D] font-medium'
                          : 'text-[#4A3B37] hover:bg-[#F5F0EE]'
                      }`}
                    >
                      {(isSelectedBook || isOpen) && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#523230] flex-shrink-0" />
                      )}
                      <span className="flex-1"><HadithText text={pickLabel(book, language)} /></span>
                    </div>

                    {/* Chapters under the open book */}
                    {isOpen && (
                      <div className="mr-3 mt-[7px] flex flex-col gap-[7px]">
                        {chapters.length > 0 && (
                          <div className="text-[11px] font-semibold tracking-wide text-gray-400 uppercase px-1 mb-1 mt-1">
                            Chapters
                          </div>
                        )}
                        {chapters.length === 0 && (
                          <div className="text-xs italic text-gray-400 px-2 py-1" dir="ltr">
                            No chapters available
                          </div>
                        )}
                        {chapters.filter(matches).filter((chapter) => !openChapter || chapter.value === openChapter).map((chapter) => {
                          const chapterVal = chapter.value;
                          const chapOpen = openChapter === chapterVal;
                          const isSelectedChapter =
                            sel.book === bookVal && sel.chapter === chapterVal && !sel.section;
                          return (
                            <div key={chapterVal}>
                              <div
                                onClick={() => handleChapterClick(chapterVal)}
                                className={`flex items-center gap-2 px-2 py-1.5 text-[13px] leading-[1.6] cursor-pointer rounded-[5px] transition-colors ${
                                  isSelectedChapter || chapOpen
                                    ? 'bg-[#F1E9E6] text-[#2E1F1D] font-medium'
                                    : 'text-[#4A3B37] hover:bg-[#F5F0EE]'
                                }`}
                              >
                                {(isSelectedChapter || chapOpen) && (
                                  <span className="w-1.5 h-1.5 rounded-full bg-[#523230] flex-shrink-0" />
                                )}
                                <span className="flex-1"><HadithText text={pickLabel(chapter, language)} /></span>
                              </div>

                              {/* Sections under the open chapter */}
                              {chapOpen && (
                                <div className="mr-3 mt-[7px] flex flex-col gap-[6px]">
                                  {sections.length > 0 && (
                                    <div className="text-[11px] font-semibold tracking-wide text-gray-400 uppercase px-1 mb-1 mt-1">
                                      Sections
                                    </div>
                                  )}
                                  {sections.length === 0 && (
                                    <div className="text-xs italic text-gray-400 px-4 py-1" dir="ltr">
                                      No sections
                                    </div>
                                  )}
                                  {sections.filter(matches).filter((section) => !sel.section || section.value === sel.section).map((section) => {
                                    const sectionVal = section.value;
                                    const isSelectedSection =
                                      sel.book === bookVal &&
                                      sel.chapter === chapterVal &&
                                      sel.section === sectionVal;
                                    return (
                                      <div
                                        key={sectionVal}
                                        onClick={() => handleSectionClick(sectionVal)}
                                        className={`flex items-center gap-2 px-2 py-1.5 text-[13px] leading-[1.6] cursor-pointer rounded-[5px] transition-colors ${
                                          isSelectedSection
                                            ? 'bg-[#F1E9E6] text-[#2E1F1D] font-medium'
                                            : 'text-[#4A3B37] hover:bg-[#F5F0EE]'
                                        }`}
                                      >
                                        {isSelectedSection && (
                                          <span className="w-1.5 h-1.5 rounded-full bg-[#523230] flex-shrink-0" />
                                        )}
                                        <span className="flex-1"><HadithText text={pickLabel(section, language)} /></span>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="p-4 flex justify-center bg-white border-t border-gray-100">
              <button
                onClick={handleGo}
                className="w-[331px] bg-[#523230] text-white py-3 rounded-lg font-medium text-base hover:bg-[#164A38] transition-colors"
              >
                Go
              </button>
            </div>
          </div>
        </div>
      )}

      <HashModal
        isOpen={isHashModalOpen}
        onClose={() => setIsHashModalOpen(false)}
        onCompleteClose={onClose}
        selectedHadithNumber={selectedHadithNumber}
        setSelectedHadithNumber={setSelectedHadithNumber}
        compilerLabel={compilerLabel}
      />
    </>
  );
}