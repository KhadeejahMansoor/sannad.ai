'use client';

import { useEffect, useRef, useState } from 'react';
import { Search, ListOrdered } from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
  useBooksByCompiler,
  useChaptersByBook,
  useSectionsByChapter,
} from '@/hooks/useData';
import { useScrollLock } from '../lib/useScrollLock';
import { useLanguage, pickLabel } from '../lib/LanguageContext';
import HadithText from './HadithText';

const HashModal = ({ isOpen, onClose, onCompleteClose, selectedHadithNumber, setSelectedHadithNumber, compilerLabel = 'Azami' }) => {
  const hashModalRef = useRef(null);
  const router = useRouter();

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
    // Navigate to the single-hadith page: /hadith/{compiler}-{number}
    // e.g. Azami 3230 -> /hadith/azami-3230. Matches the URL the search uses.
    // Spaces in multi-word compilers (e.g. "Ibn Majah") become hyphens.
    const slug = `${String(compilerLabel).toLowerCase().trim().replace(/\s+/g, '-')}-${selectedHadithNumber}`;
    router.push(`/hadith/${slug}`);
    onClose();
    if (onCompleteClose) onCompleteClose();
  };

  if (!isOpen) return null;

  const min = 1;
  const max = 7563;
  const value = Math.max(min, Math.min(max, Number(selectedHadithNumber) || min));

  const setValue = (n) => {
    const clamped = Math.max(min, Math.min(max, Math.round(n)));
    setSelectedHadithNumber(clamped);
  };

  // Ruler: 13 ticks centered on the current value, ~5 apart, so scrubbing feels
  // fine-grained. The middle tick is the current position (maroon).
  const TICKS = 13;
  const STEP = 5;
  const ticks = Array.from({ length: TICKS }, (_, i) => i - Math.floor(TICKS / 2)); // -6..+6

  // Drag state for the ruler
  const dragRef = { current: null };
  let startX = 0;
  let startVal = value;

  const onPointerDown = (e) => {
    startX = (e.touches ? e.touches[0].clientX : e.clientX);
    startVal = value;
    const move = (ev) => {
      const x = (ev.touches ? ev.touches[0].clientX : ev.clientX);
      const dx = x - startX;
      // ~6px of drag = 1 hadith
      setValue(startVal - Math.round(dx / 6));
    };
    const up = () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
      window.removeEventListener('touchmove', move);
      window.removeEventListener('touchend', up);
    };
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
    window.addEventListener('touchmove', move, { passive: false });
    window.addEventListener('touchend', up);
  };

  // Label positions under the ruler: prev/current/next rounded to nearest 50.
  const midLabel = Math.round(value / 50) * 50;
  const leftLabel = Math.max(min, midLabel - 50);
  const rightLabel = Math.min(max, midLabel + 50);

  return (
    <div className="fixed inset-0 z-[5000] backdrop-blur-[2px] bg-[#060606]/50 flex items-end justify-center">
      <div
        ref={hashModalRef}
        className="w-full max-w-[420px] bg-white rounded-t-[22px] shadow-xl flex flex-col overflow-hidden font-[Inter]"
      >
        {/* Grab handle */}
        <div className="mx-auto mt-3 mb-1 h-[5px] w-10 rounded-full bg-[#DDD8D0]" />

        {/* Header: compiler name + hash chip + close */}
        <div className="flex items-center justify-between px-5 pt-2 pb-4">
          <div className="text-[#523230] text-base font-medium">{compilerLabel}</div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-[9px] bg-[#F1E9E6] flex items-center justify-center text-[#523230] text-lg font-semibold">#</div>
            <button onClick={onClose} className="w-8 h-8 cursor-pointer flex items-center justify-center hover:bg-gray-100 rounded-full text-[#6B5B55]">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>

        <div className="px-5 pb-6">
          {/* Editable number box */}
          <div className="text-center mb-4">
            <input
              type="text"
              inputMode="numeric"
              value={value}
              onChange={(e) => {
                const v = e.target.value.replace(/[^\d]/g, '');
                if (v === '') { setSelectedHadithNumber(''); return; }
                setValue(parseInt(v, 10));
              }}
              className="w-[130px] text-center text-[26px] font-medium text-[#2E1F1D] border-[1.5px] border-[#523230] rounded-[12px] py-2 outline-none focus:ring-2 focus:ring-[#EDE4E1]"
            />
          </div>

          {/* Ruler slider — drag to scrub */}
          <div
            className="relative select-none cursor-grab active:cursor-grabbing mb-1"
            style={{ touchAction: 'none' }}
            onMouseDown={onPointerDown}
            onTouchStart={onPointerDown}
          >
            <div className="flex items-end justify-between h-[34px] px-0.5">
              {ticks.map((t) => {
                const isCenter = t === 0;
                const isMajor = Math.abs(t) % 3 === 0;
                return (
                  <div
                    key={t}
                    style={{
                      width: isCenter ? 2 : 1,
                      height: isCenter ? 34 : isMajor ? 22 : 14,
                      background: isCenter ? '#523230' : isMajor ? '#C3B3AB' : '#D9CDC5',
                    }}
                  />
                );
              })}
            </div>
            <div className="flex justify-between text-[11px] text-[#9A8A85] mt-1.5 px-0.5">
              <span>{leftLabel}</span>
              <span className="text-[#523230] font-medium">{midLabel}</span>
              <span>{rightLabel}</span>
            </div>
          </div>

          {/* Go */}
          <button
            onClick={handleGoClick}
            className="w-full mt-5 bg-[#523230] text-white py-3 rounded-[12px] font-medium text-base hover:bg-[#412725] transition-colors"
          >
            Go
          </button>
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

  // Tapping a book: open it and select it. Clears any chapter/section.
  const handleBookClick = (book) => {
    if (openBook === book) {
      // Tapping the already-open book collapses back to the full list.
      setOpenBook(null);
      setOpenChapter(null);
      setSel({ book: null, chapter: null, section: null });
    } else {
      setOpenBook(book);
      setOpenChapter(null);
      setSel({ book, chapter: null, section: null });
    }
  };

  // Tapping a chapter: open it, keep the book, clear section.
  const handleChapterClick = (chapter) => {
    if (openChapter === chapter) {
      setOpenChapter(null);
      setSel((prev) => ({ book: prev.book, chapter: null, section: null }));
    } else {
      setOpenChapter(chapter);
      setSel((prev) => ({ book: prev.book, chapter, section: null }));
    }
  };

  // Tapping a section: leaf — keep book + chapter, set section.
  const handleSectionClick = (section) => {
    setSel((prev) => ({ book: prev.book, chapter: prev.chapter, section }));
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
            className="w-full h-[75%] bg-white shadow-md flex flex-col overflow-hidden font-[Inter] rounded-t-[22px]"
          >
            <div className="mx-auto mt-3 mb-2 h-[5px] w-10 rounded-full bg-[#DDD8D0]" />

            {/* Header: compiler label + hash + search icons */}
            <div className="flex items-center justify-between px-4 pt-2 pb-2">
              <div className="text-black text-2xl font-semibold">
                {compilerLabel || 'Compiler'}
              </div>
              <div className="flex items-center gap-3">
                <div
                  onClick={handleHashClick}
                  aria-label="Jump to hadith number"
                  className="w-6 h-6 cursor-pointer flex items-center justify-center hover:bg-gray-100 rounded"
                >
                  <ListOrdered size={22} color="black" strokeWidth={1.8} />
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
                      fill={isSearchVisible ? '#523230' : '#000714'}
                      fillOpacity="0.9"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {isSearchVisible && (
              <div className="px-4 py-3">
                <div className="relative flex items-center w-full h-10 bg-white rounded-[10px] border border-[#E4DCD6]">
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
                <div className="text-[11px] font-semibold tracking-wide text-gray-400 px-1 mb-2 mt-1">
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
                          <div className="text-[11px] font-semibold tracking-wide text-gray-400 px-1 mb-1 mt-1">
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
                                    <div className="text-[11px] font-semibold tracking-wide text-gray-400 px-1 mb-1 mt-1">
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
                className="w-[331px] bg-[#523230] text-white py-3 rounded-lg font-medium text-base hover:bg-[#412725] transition-colors"
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