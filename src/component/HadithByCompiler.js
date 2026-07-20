"use client";
import { useState, useEffect, useRef, useMemo } from 'react';
import { useWindowVirtualizer } from '@tanstack/react-virtual';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronLeft, BookOpen } from 'lucide-react';
import Header from './Header';
import HadithCard from './HadithCard';
import HadithText from './HadithText';
import HadithSlider from './HadithSlider';
import BottomPopupMenu from './BottomPopupMenu';
import MenuModal from './MenuModal';
import LanguageMenu from './LanguageMenu';
import HadithCollectionMenu from './HadithCollectionMenu';
import DetailView from './DetailView';
import AyatChips from './AyatChips';
import FloatingButton from './FloatingButton';
import { AnimatePresence } from 'framer-motion';
import {
  useBooksByCompiler,
  useChaptersByBook,
  useSectionsByChapter,
  useHadithsByFilters,
} from '../hooks/useData';
import { compilerFor, gradeFor, compilerToDb } from '../lib/i18n';
import { useLanguage, pickLabel } from '../lib/LanguageContext';

const PAGE_SIZE = 50;

export default function HadithByCompiler() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // 'en' (default) => bilingual cards + English filter labels
  // 'ar'           => Arabic-only cards + Arabic filter labels
  const { language, isArabic } = useLanguage();

  // Read compiler from URL (English label) and translate to DB Arabic value.
  const compilerLabel = searchParams.get('compiler') || 'Azami';
  const compilerArabic = compilerToDb(compilerLabel);   // now from lib/i18n.js

  // Optional pre-selection from URL — when the user arrives via the MenuModal
  // they hit /desktopcompiler?compiler=X&book=Y&chapter=Z&section=W. We honor
  // those so the page lands already-filtered to what they picked.
  const urlBook    = searchParams.get('book');
  const urlChapter = searchParams.get('chapter');
  const urlSection = searchParams.get('section');

  const [selectedBook,    setSelectedBook]    = useState(urlBook    || null);
  const [selectedChapter, setSelectedChapter] = useState(urlChapter || null);
  const [selectedSection, setSelectedSection] = useState(urlSection || null);
  const [page, setPage] = useState(0);

  // ── Reveal-in-sidebar ─────────────────────────────────────────────
  //
  // `selectedBook` FILTERS the hadith list. `expandedBook` only opens a book's
  // chapters in the sidebar. They used to be the same variable, which is why
  // there was no way to show a book without also narrowing the results.
  //
  // Clicking a book in the sidebar still does both. The book button next to the
  // heading sets only `expandedBook` — so it reveals where you are without
  // moving you.
  const [expandedBook, setExpandedBook] = useState(urlBook || null);
  const [expandedChapter, setExpandedChapter] = useState(urlChapter || null);

  // The book/chapter/section of the hadith currently on screen, once revealed.
  // Purely a highlight: "you are here". Sets nothing, filters nothing.
  const [revealed, setRevealed] = useState({ book: null, chapter: null, section: null });

  // Which slide the desktop reader is on. This used to live inside HadithSlider,
  // where the parent couldn't see it — so the parent had no idea which hadith
  // was on screen and couldn't reveal its book. Lifted up.
  const [index, setIndex] = useState(0);

  // The sidebar is closed by default. The book button next to the heading is
  // what opens it — and it opens it already scrolled to wherever you are.
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // When an arrow crosses a page boundary we setPage() and the new rows arrive
  // asynchronously. This says where to land once they do: the top of the new
  // page, or the bottom of it.
  const pendingIndexRef = useRef('first');

  const bookRefs = useRef({});
  const chapterRefs = useRef({});
  const sidebarRef = useRef(null);

  // Re-apply the URL's book/chapter/section whenever they change. Without this,
  // pressing "Go" in the mobile MenuModal (which router.push-es to this same
  // page with new params) updates the URL but NOT the filter state — the
  // useState initializers only run once, at mount, and same-page navigations
  // don't remount. This mirrors the current params into state on every change.
  useEffect(() => {
    setSelectedBook(urlBook || null);
    setSelectedChapter(urlChapter || null);
    setSelectedSection(urlSection || null);
    setExpandedBook(urlBook || null);
    setExpandedChapter(urlChapter || null);
    setPage(0);
  }, [urlBook, urlChapter, urlSection]);

  // Reset selections when compiler changes — but skip the very first mount,
  // because we want URL-supplied book/chapter/section to survive.
  // The same didMount ref is used for the book/chapter/section reset effects
  // below so that none of them clobber state on the initial render.
  const didMount = useRef(false);
  useEffect(() => {
    if (!didMount.current) return;
    setSelectedBook(null);
    setSelectedChapter(null);
    setSelectedSection(null);
    setExpandedBook(null);
    setExpandedChapter(null);
    setRevealed({ book: null, chapter: null, section: null });
    setPage(0);
  }, [compilerArabic]);

  // Reset chapter, section, and page when book changes
  useEffect(() => {
    if (!didMount.current) return;
    setSelectedChapter(null);
    setSelectedSection(null);
    setPage(0);
  }, [selectedBook]);

  // Reset section and page when chapter changes
  useEffect(() => {
    if (!didMount.current) return;
    setSelectedSection(null);
    setPage(0);
  }, [selectedChapter]);

  // Reset page when section changes
  useEffect(() => {
    if (!didMount.current) return;
    setPage(0);
  }, [selectedSection]);

  // Mark as mounted AFTER the first round of effects fired (which we skipped above).
  // From here on, real user-driven changes to compiler/book/chapter/section will
  // trigger the resets normally.
  useEffect(() => {
    didMount.current = true;
  }, []);

  // Fetch books for this compiler
  const { data: booksRes, loading: booksLoading } = useBooksByCompiler(compilerArabic);
  // useMemo, not a bare ternary: `[]` is a new array identity on every render,
  // so any effect depending on it would re-fire forever.
  const books = useMemo(() => (booksRes?.success ? booksRes.data : []), [booksRes]);
  const hasBooks = books.length > 0;

  // Fetch chapters for selected book
  // Chapters follow the EXPANDED book, sections the EXPANDED chapter — so the
  // reveal button can open all three columns without touching the filter.
  const { data: chaptersRes } = useChaptersByBook(compilerArabic, expandedBook);
  const chapters = useMemo(() => (chaptersRes?.success ? chaptersRes.data : []), [chaptersRes]);

  // Only Azami has sections — 5,967 of them. Every other compiler returns an
  // empty array here, so the third column simply never appears for them.
  const { data: sectionsRes } = useSectionsByChapter(compilerArabic, expandedBook, expandedChapter);
  const sections = useMemo(() => (sectionsRes?.success ? sectionsRes.data : []), [sectionsRes]);

  // Fetch hadiths
  const { data: hadithsRes, loading: hadithsLoading } = useHadithsByFilters(
    compilerArabic,
    selectedBook,
    selectedChapter,
    selectedSection,
    PAGE_SIZE,
    page * PAGE_SIZE
  );
  const hadiths = useMemo(() => (hadithsRes?.success ? hadithsRes.data : []), [hadithsRes]);

  // Whenever a new set of rows lands — a filter changed, or an arrow pushed us
  // onto another page — decide where the reader should be.
  //
  // Normally the top. But if an arrow walked BACKWARDS off the start of a page,
  // the reader should arrive at the BOTTOM of the previous one: stepping back
  // from Bukhari 51 has to land on Bukhari 50, not Bukhari 1.
  useEffect(() => {
    if (hadiths.length === 0) return;
    setIndex(pendingIndexRef.current === 'last' ? hadiths.length - 1 : 0);
    pendingIndexRef.current = 'first';
  }, [hadiths]);

  // Filters changed: always back to the top, never a carried-over 'last'.
  useEffect(() => {
    pendingIndexRef.current = 'first';
  }, [compilerArabic, selectedBook, selectedChapter, selectedSection]);

  const currentHadith = hadiths[index] || null;
  const total = hadithsRes?.pagination?.total || 0;
  const hasMore = hadithsRes?.pagination?.hasMore || false;

  // Mobile detail view state
  const [isDetailView, setIsDetailView] = useState(false);
  const [selectedHadith, setSelectedHadith] = useState(null);

  // Mobile inline-expand: which hadith card has its tabs panel open
  const [expandedId, setExpandedId] = useState(null);
  const handleToggleExpand = (id) => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  // Menu states
  const [showBottomMenu, setShowBottomMenu] = useState(false);
  // Mobile-only: opens the Books/Chapters/Sections drill-down. Floating book
  // button on mobile triggers this; desktop is unchanged.
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [showHadithCollectionMenu, setShowHadithCollectionMenu] = useState(false);

  // ── Reveal the current hadith's book in the sidebar ────────────────
  //
  // Expands the book, marks it + its chapter as "you are here", and scrolls it
  // into view. Deliberately does NOT touch selectedBook — the hadith list stays
  // exactly as it is, so you don't lose your place.
  const revealCurrentBook = () => {
    // On mobile there is no sidebar — open the drill-down modal instead.
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setIsMenuOpen(true);
      return;
    }

    // Second click closes it again.
    if (sidebarOpen) {
      setSidebarOpen(false);
      return;
    }

    setSidebarOpen(true);

    if (currentHadith?.book) {
      setExpandedBook(currentHadith.book);
      setExpandedChapter(currentHadith.chapter || null);
      setRevealed({
        book: currentHadith.book,
        chapter: currentHadith.chapter || null,
        section: currentHadith.section || null,
      });
    }
  };

  // Scroll the revealed row into view once React has rendered it.
  useEffect(() => {
    if (!sidebarOpen) return;

    // Which row do we actually need to bring into view?
    //
    // Once a book is expanded it collapses into a breadcrumb — there's no book
    // row left to scroll to. The row that matters is the CHAPTER, and with 349
    // of them in Bukhari's كتاب التفسير, it will not be on screen by luck.
    //
    // If the book has no chapters (Ahmad, Malik) fall back to the book row,
    // which is still in the list because nothing collapsed.
    const target = revealed.chapter
      ? chapterRefs.current[revealed.chapter]
      : revealed.book
        ? bookRefs.current[revealed.book]
        : null;

    if (!target) return;

    // Chapters arrive from a fetch, so the row may not be painted yet. One frame
    // is enough once the data is in; the effect re-runs when `chapters` lands.
    const t = requestAnimationFrame(() => {
      target.scrollIntoView({ block: 'center', behavior: 'smooth' });
    });
    return () => cancelAnimationFrame(t);
  }, [sidebarOpen, revealed.book, revealed.chapter, chapters]);

  // ── Circular navigation across the whole compiler ─────────────────
  //
  // HadithSlider used to wrap inside its own array:
  //     index > 0 ? index - 1 : hadiths.length - 1
  //
  // But that array is one PAGE of 50. So "back" from Bukhari 1 landed on
  // Bukhari 50 — not because 50 is meaningful, but because it happened to be
  // the last row in memory. On page 2 the same click would have gone to
  // Bukhari 100. An artifact of pagination, not a decision.
  //
  // The slider can't fix this: it doesn't know `page` or `total` exist. So the
  // arrows are driven from here, where they do.
  //
  // Bukhari 1 -> back -> Bukhari 7563. Truly circular.
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const goPrev = () => {
    if (hadiths.length === 0) return;

    // Not at the top of the page: ordinary step back.
    if (index > 0) {
      setIndex(index - 1);
      return;
    }

    // At the top. If the whole collection fits on one page, wrap in place.
    if (totalPages === 1) {
      setIndex(hadiths.length - 1);
      return;
    }

    // Otherwise fetch the previous page (wrapping to the last) and land at its end.
    pendingIndexRef.current = 'last';
    setPage(page > 0 ? page - 1 : totalPages - 1);
  };

  const goNext = () => {
    if (hadiths.length === 0) return;

    if (index < hadiths.length - 1) {
      setIndex(index + 1);
      return;
    }

    if (totalPages === 1) {
      setIndex(0);
      return;
    }

    pendingIndexRef.current = 'first';
    setPage(page < totalPages - 1 ? page + 1 : 0);
  };

  const startRow = total > 0 ? page * PAGE_SIZE + 1 : 0;
  const endRow = Math.min((page + 1) * PAGE_SIZE, total);

  // ─── Mobile virtual scroller ─────────────────────────────────────────
  // Only used in the md:hidden branch. Renders ~5 cards above and below the
  // visible viewport instead of all 7,000+, which keeps DOM memory manageable
  // on phones. estimateSize is the typical collapsed card height; the
  // virtualizer self-corrects via measureElement after each row mounts.
  //
  // Note: we deliberately do NOT call mobileVirtualizer.measure() manually
  // when expandedId changes. The ref={measureElement} attached to each row
  // installs a ResizeObserver that auto-detects height changes (collapsed
  // ~320px → expanded ~700px) and re-lays-out the rows below. A manual
  // .measure() call here would race that observer and produce stale offsets.
  const mobileListRef = useRef(null);
  const mobileVirtualizer = useWindowVirtualizer({
    count: hadiths.length,
    estimateSize: () => 320,                         // typical mobile card height
    overscan: 5,
    scrollMargin: mobileListRef.current?.offsetTop ?? 0,
  });

  return (
    <div className="min-h-screen w-full bg-[#F6F4F1]">
      <Header
        onEdit={() => router.push('/')}
        onMenu={() => setShowBottomMenu(true)}
      />

      <div className="max-w-[1700px] mx-auto px-4 md:px-8 py-6">
        {/* Page heading */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => router.push('/')} className="text-gray-600 hover:text-gray-800">
            <ChevronLeft size={24} />
          </button>
          <h1
            className="text-2xl font-bold text-gray-900"
            dir={isArabic ? 'rtl' : 'ltr'}
            lang={isArabic ? 'ar' : 'en'}
          >
            {compilerFor(compilerArabic, language)}
          </h1>
          {/* Was a decorative SVG. Now it reveals the current hadith's book in
              the sidebar — expand, highlight, scroll to it — without changing
              the filter, so you keep your place. */}
          <button
            onClick={revealCurrentBook}
            aria-expanded={sidebarOpen}
            title={
              sidebarOpen
                ? (isArabic ? 'إخفاء الكتب' : 'Hide books')
                : (isArabic ? 'إظهار الكتب' : 'Show books')
            }
            aria-label={
              sidebarOpen
                ? (isArabic ? 'إخفاء الكتب' : 'Hide books')
                : (isArabic ? 'إظهار الكتب' : 'Show books')
            }
            className={`hidden md:inline-flex rounded-[5px] p-1 transition-colors cursor-pointer ${
              sidebarOpen
                ? 'bg-[#523230] text-white'
                : 'text-[#523230] hover:bg-[#EFE7E4]'
            }`}
          >
            <svg width="30" height="30" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M29.1833 11.19C28.4665 11.0661 27.7406 11.0025 27.0133 11C24.5316 10.998 22.1018 11.7096 20.0133 13.05C17.9194 11.7272 15.4899 11.033 13.0133 11.05C12.2859 11.0525 11.56 11.1161 10.8433 11.24C10.6085 11.2805 10.3958 11.4035 10.2437 11.5868C10.0915 11.7701 10.0098 12.0018 10.0133 12.24V24.24C10.0111 24.3869 10.0414 24.5325 10.1019 24.6664C10.1624 24.8004 10.2517 24.9193 10.3634 25.0148C10.4751 25.1102 10.6065 25.1799 10.7482 25.2188C10.8899 25.2578 11.0385 25.265 11.1833 25.24C12.6163 24.9919 14.0845 25.0331 15.5013 25.3611C16.9182 25.6891 18.2551 26.2974 19.4333 27.15L19.5533 27.22H19.6633C19.774 27.2668 19.893 27.2908 20.0133 27.2908C20.1335 27.2908 20.2525 27.2668 20.3633 27.22H20.4733L20.5933 27.15C21.7632 26.2783 23.0963 25.6503 24.5134 25.3034C25.9306 24.9564 27.4029 24.8974 28.8433 25.13C28.9881 25.155 29.1366 25.1478 29.2783 25.1088C29.42 25.0699 29.5514 25.0002 29.6631 24.9048C29.7748 24.8093 29.8641 24.6904 29.9246 24.5564C29.9851 24.4225 30.0154 24.2769 30.0133 24.13V12.13C30.0029 11.9022 29.9149 11.6847 29.7639 11.5137C29.6129 11.3428 29.4081 11.2285 29.1833 11.19ZM19.0133 24.48C17.1627 23.5078 15.1036 22.9999 13.0133 23H12.0133V13C12.3463 12.9815 12.6802 12.9815 13.0133 13C15.1467 12.9976 17.2335 13.6237 19.0133 14.8V24.48ZM28.0133 23.04H27.0133C24.9229 23.0399 22.8638 23.5478 21.0133 24.52V14.8C22.7931 13.6237 24.8799 12.9976 27.0133 13C27.3463 12.9815 27.6802 12.9815 28.0133 13V23.04ZM29.1833 27.19C28.4665 27.0661 27.7406 27.0025 27.0133 27C24.5316 26.998 22.1018 27.7096 20.0133 29.05C17.9248 27.7096 15.4949 26.998 13.0133 27C12.2859 27.0025 11.56 27.0661 10.8433 27.19C10.7131 27.2107 10.5883 27.2568 10.476 27.3259C10.3638 27.395 10.2663 27.4855 10.1891 27.5924C10.112 27.6993 10.0568 27.8204 10.0266 27.9487C9.99639 28.077 9.99187 28.21 10.0133 28.34C10.0641 28.5997 10.2158 28.8286 10.4351 28.9767C10.6544 29.1248 10.9234 29.1799 11.1833 29.13C12.6163 28.8819 14.0845 28.9231 15.5013 29.2511C16.9182 29.5791 18.2551 30.1874 19.4333 31.04C19.6026 31.1606 19.8054 31.2254 20.0133 31.2254C20.2212 31.2254 20.4239 31.1606 20.5933 31.04C21.7714 30.1874 23.1083 29.5791 24.5252 29.2511C25.9421 28.9231 27.4102 28.8819 28.8433 29.13C29.1031 29.1799 29.3722 29.1248 29.5915 28.9767C29.8108 28.8286 29.9624 28.5997 30.0133 28.34C30.0347 28.21 30.0301 28.077 30 27.9487C29.9698 27.8204 29.9145 27.6993 29.8374 27.5924C29.7603 27.4855 29.6628 27.395 29.5505 27.3259C29.4382 27.2568 29.3134 27.2107 29.1833 27.19Z" fill="currentColor" />
            </svg>
          </button>
        </div>

        <div className="flex gap-6">
          {/* ── Browser: one column, levels stacked ───────────────────────
              Books sits on top. Pick one and it collapses to a single header row
              — a breadcrumb you can click to go back — and Chapters opens
              underneath it. Pick a chapter and the same thing happens again for
              Sections.

              Only one long list is on screen at a time, which matters: Bukhari's
              كتاب التفسير has 349 chapters and Azami has 5,967 sections. Showing
              two of those at once is how you lose someone.

              Sections only exist for Azami. For every other compiler `sections`
              comes back empty and that level never appears. */}
          {hasBooks && sidebarOpen && (
            <div
              ref={sidebarRef}
              className="hidden md:flex flex-col gap-2 w-[280px] flex-shrink-0 max-h-[80vh]"
            >

              {/* ── Level 1: Books ── */}
              {expandedBook ? (
                <Crumb
                  title={isArabic ? 'الكتب' : 'Books'}
                  label={pickLabel(books.find(b => b.value === expandedBook), language)}
                  isArabic={isArabic}
                  onBack={() => {
                    setExpandedBook(null);
                    setExpandedChapter(null);
                  }}
                />
              ) : (
                <Panel
                  title={isArabic ? 'الكتب' : 'Books'}
                  loading={booksLoading}
                  isArabic={isArabic}
                  onClose={() => setSidebarOpen(false)}
                >
                  {books.map((book) => (
                    <Row
                      key={book.value}
                      innerRef={(el) => { bookRefs.current[book.value] = el; }}
                      label={pickLabel(book, language)}
                      selected={selectedBook === book.value}
                      here={revealed.book === book.value}
                      isArabic={isArabic}
                      onClick={() => {
                        setSelectedBook(book.value);
                        setExpandedBook(book.value);
                        setExpandedChapter(null);
                        setSelectedChapter(null);
                        setSelectedSection(null);
                      }}
                    />
                  ))}
                </Panel>
              )}

              {/* ── Level 2: Chapters ──
                  Ahmad and Malik have zero chapters, so this never opens for them. */}
              {expandedBook && (
                expandedChapter && sections.length > 0 ? (
                  <Crumb
                    title={isArabic ? 'الأبواب' : 'Chapters'}
                    label={pickLabel(chapters.find(c => c.value === expandedChapter), language)}
                    isArabic={isArabic}
                    onBack={() => setExpandedChapter(null)}
                  />
                ) : chapters.length > 0 ? (
                  <Panel
                    title={isArabic ? 'الأبواب' : 'Chapters'}
                    isArabic={isArabic}
                  >
                    {chapters.map((ch) => (
                      <Row
                        key={ch.value}
                        innerRef={(el) => { chapterRefs.current[ch.value] = el; }}
                        label={pickLabel(ch, language)}
                        selected={selectedChapter === ch.value}
                        here={revealed.chapter === ch.value}
                        isArabic={isArabic}
                        onClick={() => {
                          setSelectedChapter(ch.value);
                          setExpandedChapter(ch.value);
                          setSelectedSection(null);
                        }}
                      />
                    ))}
                  </Panel>
                ) : (
                  <Empty isArabic={isArabic} />
                )
              )}

              {/* ── Level 3: Sections (Azami only) ──
                  Collapses to a crumb like the levels above it once you pick one.
                  There's no level 4, so the crumb's only job is to say what you
                  chose and let you clear it. */}
              {expandedChapter && sections.length > 0 && (
                selectedSection ? (
                  <Crumb
                    title={isArabic ? 'الفصول' : 'Sections'}
                    label={pickLabel(sections.find(x => x.value === selectedSection), language)}
                    isArabic={isArabic}
                    onBack={() => setSelectedSection(null)}
                  />
                ) : (
                  <Panel
                    title={isArabic ? 'الفصول' : 'Sections'}
                    isArabic={isArabic}
                  >
                    {sections.map((sec) => (
                      <Row
                        key={sec.value}
                        label={pickLabel(sec, language)}
                        selected={selectedSection === sec.value}
                        here={revealed.section === sec.value}
                        isArabic={isArabic}
                        onClick={() => setSelectedSection(sec.value)}
                      />
                    ))}
                  </Panel>
                )
              )}

            </div>
          )}

          {/* Main content — hadith list */}
          <div className="flex-1 min-w-0">
            {hadithsLoading && (
              <div className="text-center text-gray-500 py-8">Loading hadiths...</div>
            )}

            {!hadithsLoading && hadiths.length === 0 && (
              <div className="text-center text-gray-500 py-8">
                {isArabic ? 'لا توجد أحاديث لهذا الاختيار.' : 'No hadiths found for this selection.'}
              </div>
            )}

            {/* Mobile cards — window-virtualized list with inline expand */}
            <div ref={mobileListRef} className="md:hidden">
              <div
                style={{
                  height: `${mobileVirtualizer.getTotalSize()}px`,
                  width: '100%',
                  position: 'relative',
                }}
              >
                {mobileVirtualizer.getVirtualItems().map((virtualRow) => {
                  const hadith = hadiths[virtualRow.index];
                  const expanded = expandedId === hadith.hadith_id;
                  return (
                    <div
                      key={hadith.hadith_id}
                      data-index={virtualRow.index}
                      ref={mobileVirtualizer.measureElement}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        transform: `translateY(${virtualRow.start - mobileVirtualizer.options.scrollMargin}px)`,
                      }}
                    >
                      {/* IMPORTANT: HadithCard AND its expanded panels both
                          live inside the measured element. Putting <InlinePanels>
                          as a sibling of this div would render it at offset
                          (0,0) of the relative container — the panels would
                          appear to float between cards and overlap rows below.
                          Keeping them inside means measureElement sees the
                          full row height (collapsed ~320px, expanded ~700px)
                          and re-lays-out the rows below correctly. */}
                      {/* The Arabic props were always supported by HadithCard —
                          they were simply never passed, so the Arabic column
                          never rendered. Now both sides are fed.

                          showEnglish=false in Arabic mode drops the English
                          column and lets the Arabic run full width. */}
                      <HadithCard
                        showEnglish={!isArabic}
                        /* English side */
                        narrator={hadith.english_narrator ? `${hadith.english_narrator} reported,` : ''}
                        content={hadith.hadith_text_english}
                        hadithId={`${compilerFor(hadith.compiler, 'en')} ${hadith.hadith_number}`}
                        grade={gradeFor(hadith.grade, 'en')}
                        finalGrader={hadith.final_grader}
                        /* Arabic side — mobile shows English only by default;
                           Arabic only when the Arabic language is selected. */
                        narratorAr={isArabic ? hadith.arabic_intro_clause : undefined}
                        contentAr={isArabic ? hadith.hadith_text_arabic : undefined}
                        hadithIdAr={isArabic ? `${hadith.compiler} ${hadith.hadith_number}` : undefined}
                        gradeAr={isArabic ? hadith.grade : undefined}
                        /* Behavior */
                        hadithLinkId={hadith.hadith_id}
                        isExpanded={expanded}
                        onToggleExpand={() => handleToggleExpand(hadith.hadith_id)}
                      />
                      {expanded && <InlinePanels hadith={hadith} />}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Desktop slider — reuse the one we already built */}
            <div className="hidden md:block">
              {hadiths.length > 0 && (
                <HadithSlider
                  hadiths={hadiths}
                  language={language}
                  index={index}
                  onIndexChange={setIndex}
                  onPrev={goPrev}
                  onNext={goNext}
                />
              )}
            </div>

            
          </div>
        </div>
      </div>

      {/* Mobile detail view */}
      {isDetailView && selectedHadith && (
        <div className="md:hidden">
          <DetailView hadith={selectedHadith} onClose={() => setIsDetailView(false)} />
        </div>
      )}

      {/* Mobile floating button — opens the Books/Chapters/Sections drill-down */}
      <div className="md:hidden fixed bottom-6 right-6 z-50">
        <FloatingButton onClick={() => setIsMenuOpen(true)} />
      </div>

      {/* Mobile-only Books/Chapters/Sections menu. Hitting Go re-navigates to
          /desktopcompiler with the selection as URL params, which the URL
          pre-fill logic at the top of this component honors on next render. */}
      {isMenuOpen && (
        <div className="md:hidden">
          <MenuModal
            onClose={() => setIsMenuOpen(false)}
            compiler={compilerArabic}
            compilerLabel={compilerFor(compilerArabic, language)}
          />
        </div>
      )}

      {/* Bottom popup menu */}
      <AnimatePresence>
        {showBottomMenu && (
          <BottomPopupMenu
            onClose={() => setShowBottomMenu(false)}
            onCollectionClick={() => {
              setShowBottomMenu(false);
              setShowHadithCollectionMenu(true);
            }}
            onLanguageClick={() => {
              setShowBottomMenu(false);
              setShowLanguageMenu(true);
            }}
            onAboutHadithClick={() => console.log('About Hadith')}
            onAboutUsClick={() => console.log('About Us')}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showLanguageMenu && <LanguageMenu onClose={() => setShowLanguageMenu(false)} />}
      </AnimatePresence>

      <AnimatePresence>
        {showHadithCollectionMenu && (
          <HadithCollectionMenu onClose={() => setShowHadithCollectionMenu(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Inline panels rendered below an expanded card (mobile only) ──────
// Tabbed layout matching ResultsScreen's mobile expand: Contents / Reference / Commentary / Ayat.
function InlinePanels({ hadith }) {
  const [activeTab, setActiveTab] = useState('Contents');
  const { isArabic } = useLanguage();

  // Was reading hadith.book straight — the RAW column, prefix and all
  // ("كتاب الإيمان"). /api/hadiths-by-filters also returns the stripped forms
  // and their English translations, which is what the sidebar shows.
  //
  // English is the default language, so the default here is the English name.
  // Falls back to the stripped Arabic, then the raw value — better a book name
  // in the wrong language than an empty row.
  const pick = (stripped, english, raw) =>
    (isArabic ? (stripped || raw) : (english || stripped || raw)) || '';

  const book    = pick(hadith?.book_stripped,    hadith?.book_stripped_english,    hadith?.book);
  const chapter = pick(hadith?.chapter_stripped, hadith?.chapter_stripped_english, hadith?.chapter);
  const section = pick(hadith?.section_stripped, hadith?.section_stripped_english, hadith?.section);
  const reference = hadith?.matched_hadith || '';
  const ayat      = hadith?.ayat || '';
  const commentary= hadith?.commentary || 'None';
  const hadithNumber = hadith?.hadith_number || '';

  const referenceChips = reference
    ? reference.split(/[,;\n]+/).map(s => s.trim()).filter(Boolean)
    : [];

  return (
    <div className="mt-4 mb-6">
      <div className="flex justify-start gap-[22px] mb-4 px-3 py-2 bg-[#F6F4F1] rounded-[10px]">
        {['Contents', 'Reference', 'Commentary', 'Ayat'].map(tab => (
          <div key={tab} onClick={() => setActiveTab(tab)} className="cursor-pointer">
            <div className="inline-flex flex-col items-start">
              <div className={`text-[13px] font-medium ${activeTab === tab ? 'text-[#523230]' : 'text-[#9A8A85]'}`}>
                {tab}
              </div>
              {activeTab === tab && <div className="h-[2px] bg-[#523230] mt-[7px] w-full rounded-[2px]" />}
            </div>
          </div>
        ))}
      </div>

      {activeTab === 'Contents' && (
        <div className="bg-white border border-[#DDD8D0] rounded-[5px] p-4">
          {/* Book > Chapter > Section. That's the actual hierarchy — it's the
              parameter order /api/sections-by-chapter takes. Section was listed
              above Chapter, which reads as though sections contain chapters. */}
          {[
            { type: 'Book', value: book },
            { type: 'Chapter', value: chapter },
            { type: 'Section', value: section },
            { type: 'Hadith', value: `al-Jami al-Kamil ${hadithNumber}` },
          ].filter((item) => item.type !== 'Section' || item.value).map((item, i) => (
            <div key={i} className="flex items-start py-2 gap-3">
              <span className="w-4 h-4 flex items-center justify-center flex-shrink-0 mt-1">
                <RowIcon type={item.type} />
              </span>
              <span className="text-sm w-[70px] flex-shrink-0 text-gray-400">{item.type}</span>
              <div className="flex-1 text-sm text-black">{item.value ? <HadithText text={item.value} /> : '—'}</div>
            </div>
          ))}
        </div>
      )}
      {activeTab === 'Reference' && (
        <div className="bg-white border border-[#DDD8D0] rounded-[5px] p-4">
          {referenceChips.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {referenceChips.map((chip, i) => (
                <span key={i} className="h-[28px] px-3 inline-flex items-center justify-center bg-[#EDE4E1] text-[#523230] text-xs font-medium rounded-[10px]">
                  {chip}
                </span>
              ))}
            </div>
          ) : (
            <div className="text-sm text-gray-400 italic">No reference available</div>
          )}
        </div>
      )}
      {activeTab === 'Commentary' && (
        <div className="bg-white border border-[#DDD8D0] rounded-[5px] p-4">
          <div className="text-sm text-black leading-[20px] whitespace-pre-line">
            {commentary || 'None'}
          </div>
        </div>
      )}
      {activeTab === 'Ayat' && (
        <div className="bg-white border border-[#DDD8D0] rounded-[5px] p-4">
          {ayat
            ? <AyatChips ayat={ayat} />
            : <div className="text-sm text-gray-400 italic">No ayat annotations available</div>}
        </div>
      )}
    </div>
  );
}

function RowIcon({ type }) {
  const common = { width: 16, height: 16, viewBox: '0 0 16 16', fill: 'none', 'aria-hidden': 'true' };
  if (type === 'Book') return (
    <svg {...common}>
      <path d="M4 14.6663H14V13.333H4.008C3.7 13.325 3.33333 13.203 3.33333 12.6663C3.33333 12.1297 3.7 12.0077 4.008 11.9997H14V2.66634C14 1.93101 13.402 1.33301 12.6667 1.33301H4C3.196 1.33301 2 1.86567 2 3.33301V12.6663C2 14.1337 3.196 14.6663 4 14.6663ZM3.33333 5.33301V3.33301C3.33333 2.79634 3.7 2.67434 4 2.66634H12.6667V10.6663H3.33333V5.33301Z" fill="#939393" />
      <path d="M5.33301 4H11.333V5.33333H5.33301V4Z" fill="#939393" />
    </svg>
  );
  if (type === 'Section') return (
    <svg {...common}>
      <path d="M13.9997 1.33301H1.99967C1.82286 1.33301 1.65329 1.40325 1.52827 1.52827C1.40325 1.65329 1.33301 1.82286 1.33301 1.99967V13.9997C1.33301 14.1765 1.40325 14.3461 1.52827 14.4711C1.65329 14.5961 1.82286 14.6663 1.99967 14.6663H13.9997C14.1765 14.6663 14.3461 14.5961 14.4711 14.4711C14.5961 14.3461 14.6663 14.1765 14.6663 13.9997V1.99967C14.6663 1.82286 14.5961 1.65329 14.4711 1.52827C14.3461 1.40325 14.1765 1.33301 13.9997 1.33301ZM9.33301 13.333H2.66634V2.66634H9.33301V13.333ZM13.333 13.333H10.6663V2.66634H13.333V13.333Z" fill="#939393" />
    </svg>
  );
  if (type === 'Chapter') return (
    <svg {...common}>
      <path d="M3.33366 9.33366V3.33366H12.667V13.3337H7.33366M12.667 10.667H15.3337V0.666992H6.00033V3.33366M3.33366 10.667V16.0003M6.00033 13.3337H0.666992" stroke="#939393" strokeWidth="1.33333" />
    </svg>
  );
  if (type === 'Hadith') return (
    <svg {...common}>
      <path d="M7.99967 13.0968C7.09901 12.4628 6.05634 12.0588 4.96301 11.9228C4.18757 11.7653 3.39755 11.6909 2.60634 11.7008C2.5051 11.7017 2.40469 11.6825 2.3109 11.6444C2.21712 11.6063 2.13181 11.5499 2.05991 11.4787C1.98801 11.4074 1.93094 11.3226 1.892 11.2291C1.85305 11.1357 1.833 11.0354 1.83301 10.9342L1.84701 3.67217C1.84658 3.47732 1.92036 3.28962 2.05336 3.14721C2.18635 3.00481 2.36858 2.91838 2.56301 2.90551C3.36844 2.8895 4.17321 2.96148 4.96301 3.12017C6.05516 3.26108 7.09701 3.66409 7.99967 4.29484M7.99967 13.0968V4.29484M7.99967 13.0968C8.90034 12.4628 9.94301 12.0588 11.0363 11.9228C11.8118 11.7653 12.6018 11.6909 13.393 11.7008C13.4942 11.7017 13.5947 11.6825 13.6884 11.6444C13.7822 11.6063 13.8675 11.5499 13.9394 11.4787C14.0113 11.4074 14.0684 11.3226 14.1074 11.2291C14.1463 11.1357 14.1663 11.0354 14.1663 10.9342L14.1517 3.67217C14.1521 3.47743 14.0784 3.28982 13.9456 3.14743C13.8127 3.00504 13.6306 2.91855 13.4363 2.90551C12.6309 2.8895 11.8261 2.96148 11.0363 3.12017C9.94419 3.26108 8.90234 3.66409 7.99967 4.29484" stroke="#939393" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
  return null;
}

// ─── One level of the browser ─────────────────────────────────────────
// The count in the header is real information: books here hold anywhere from
// 1 hadith to 3,879, and the number tells you what's worth opening.
function Panel({ title, loading, isArabic, onClose, children }) {
  return (
    <div className="flex flex-col bg-white rounded-[8px] border border-[#E4DCD6] overflow-hidden min-h-0">
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-[#E4DCD6] flex-shrink-0">
        <span className="text-[13px] font-medium text-[#2E1F1D]">{title}</span>
        {onClose && (
          <button
            onClick={onClose}
            aria-label={isArabic ? 'إغلاق' : 'Close'}
            className="text-[#9A8A85] hover:text-[#523230] transition-colors leading-none text-lg"
          >
            ×
          </button>
        )}
      </div>

      <div className="overflow-y-auto p-1.5">
        {loading
          ? <div className="text-xs text-[#9A8A85] px-2 py-1.5">{isArabic ? 'جارٍ التحميل...' : 'Loading…'}</div>
          : children}
      </div>
    </div>
  );
}

// ─── A collapsed level ────────────────────────────────────────────────
// What a level turns into once you've drilled past it: one row showing your
// choice, clickable to go back up. This is the whole reason the levels stack
// instead of sitting side by side — only one long list is ever on screen.
function Crumb({ title, label, isArabic, onBack }) {
  return (
    <button
      onClick={onBack}
      className="w-full text-left bg-[#F1E9E6] border border-[#E4DCD6] rounded-[8px] px-3 py-2.5 hover:bg-[#EADFDB] transition-colors flex-shrink-0"
    >
      {/* The level's name sits above the choice, so a collapsed row still says
          what kind of thing it is. Without it, two stacked crumbs are just two
          bits of Arabic with no indication which is the book and which the chapter. */}
      <span className="block text-[11px] font-semibold text-[#2E1F1D] mb-0.5">{title}</span>
      <span
        className="block text-[13px] font-medium text-[#2E1F1D] break-words"
        dir={isArabic ? 'rtl' : 'ltr'}
        lang={isArabic ? 'ar' : 'en'}
      >
        {label}
      </span>
    </button>
  );
}

// ─── A level with nothing in it ───────────────────────────────────────
// Ahmad has 1,010 books and zero chapters; Malik the same. Say so, rather than
// leaving a blank panel that looks broken.
function Empty({ isArabic }) {
  return (
    <div className="bg-white rounded-[8px] border border-[#E4DCD6] px-3 py-3 text-[12px] text-[#9A8A85] flex-shrink-0">
      {isArabic ? 'لا توجد أبواب في هذا الكتاب.' : 'This book has no chapters.'}
    </div>
  );
}

// ─── One row ──────────────────────────────────────────────────────────
// Three visual states, and they mean different things:
//   selected — this is filtering the hadith list  (clay tint, bold)
//   open     — its children are showing in the next column  (left rule)
//   here     — the hadith you're reading lives here  (clay dot)
// A row can be `here` without being `selected`: that's the whole point of the
// reveal button — show me where I am without moving me.
function Row({ innerRef, label, selected, open, here, isArabic, onClick }) {
  const tone = selected
    ? 'bg-[#F1E9E6] font-medium text-[#2E1F1D]'
    : here
      ? 'bg-[#FAF5F3] text-[#2E1F1D]'
      : 'text-[#4A3B37] hover:bg-[#F5F0EE]';

  return (
    <div
      ref={innerRef}
      onClick={onClick}
      className={`text-[13px] leading-[1.6] py-1.5 px-2 cursor-pointer rounded-[5px] transition-colors flex items-center gap-2 ${tone} ${
        open ? 'border-l-2 border-l-[#523230] rounded-l-none' : ''
      }`}
      dir={isArabic ? 'rtl' : 'ltr'}
      lang={isArabic ? 'ar' : 'en'}
    >
      {here && <span className="w-1.5 h-1.5 rounded-full bg-[#523230] flex-shrink-0" aria-hidden="true" />}
      <span className="flex-1 break-words"><HadithText text={label} /></span>
    </div>
  );
}