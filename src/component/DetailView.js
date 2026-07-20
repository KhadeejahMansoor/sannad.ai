"use client";
import Header from "./Header";
import BottomPopupMenu from "./BottomPopupMenu";
import LanguageMenu from "./LanguageMenu";
import HadithCollectionMenu from "./HadithCollectionMenu";
import { AnimatePresence } from 'framer-motion';
import { useEffect, useState } from "react";
import { BookOpen, Share2 } from "lucide-react";
import ThreeDotDropdown from "./ThreeDotDropDown";
import { useRouter } from "next/navigation";
import { Noto_Sans_Arabic } from "next/font/google";
import { translateCompiler, translateGrade } from "../lib/i18n";
import MatchedReferenceChips from "./MatchedReferenceChips";
import AyatChips from "./AyatChips";
import HadithText from "./HadithText";
import { useOpenReference } from "../hooks/useOpenReference";
import { useScrollLock } from '../lib/useScrollLock';

const notoSansArabic = Noto_Sans_Arabic({
 subsets: ["arabic"],
 weight: ["400", "700"],
});

export default function DetailView({ hadith, onClose, selectedLanguage, resultsQueryString, asPage = false, onPrev, onNext, hasPrev = false, hasNext = false }) {
 const [showBottomMenu, setShowBottomMenu] = useState(false);
 const [showLanguageMenu, setShowLanguageMenu] = useState(false);
 const [showHadithCollectionMenu, setShowHadithCollectionMenu] = useState(false);
 const [activeTab, setActiveTab] = useState("Contents");
 const [showGradingDetail, setShowGradingDetail] = useState(false);
 const [isArabic, setIsArabic] = useState(false);
 const [isExpanded, setIsExpanded] = useState(false);
 const router = useRouter();
 const openRef = useOpenReference();

 // ─── Data extraction ──────────────────────────────────────────────────
 const arabicText = hadith?.hadith_text_arabic || '';
 const englishText = hadith?.hadith_text || '';
 const englishNarrator = hadith?.english_narrator
 ? `${hadith.english_narrator} reported,`
 : '';
 const arabicNarrator = hadith?.arabic_intro_clause || '';

 const compilerArabic = hadith?.compiler || '';
 const compiler = translateCompiler(compilerArabic);
 const gradeArabic = hadith?.grade || '';
 const grade = translateGrade(gradeArabic);

 // ─── Grader (from API's final_grader column) ─────────────────────────
 // Backend always returns a non-null value: "Azami" for azami rows,
 // the actual grader name (e.g. "Darussalam", "Albani") for sevenbooks rows.
 // For the Azami case we still show the longer Madinah descriptor that the
 // original UI had hardcoded; for everyone else we just show the name.
 const graderInfo = formatGrader(hadith?.final_grader);

 const reference = hadith?.reference || '';
 // Display labels, not the raw columns.
 //
 // These were all `hadith?.book` etc — the RAW value, prefix and all
 // ("كتاب الإيمان"). The API also returns the stripped forms and their English
 // translations, which is what the sidebar and the inline Contents panel show.
 // The detail page was the last thing still disagreeing with them.
 //
 // English side: prefer the English name, fall back to stripped Arabic, then raw.
 const book = hadith?.book_stripped_english || hadith?.book_stripped || hadith?.book || '';
 const chapter = hadith?.chapter_stripped_english || hadith?.chapter_stripped || hadith?.chapter || '';
 const section = hadith?.section_stripped_english || hadith?.section_stripped || hadith?.section || '';
 // Empty is EMPTY. These used to fall back to the literal string 'None', which
 // then behaved like real content everywhere downstream: it rendered the English
 // word into an Arabic panel, and — because the commentary paragraph sets
 // dir="rtl" whenever it HAS content — it pushed "None" over to the right.
 // A placeholder pretending to be data.
 const ayat = hadith?.ayat || '';
 const commentary = hadith?.commentary || '';
 const hadithIdLabel = `${compiler} ${hadith?.hadith_number || ''}`;
 const arabicIdLabel = `${compilerArabic} ${hadith?.hadith_number || ''}`;
 const hadith_number = hadith?.hadith_number || '';
 // `duplicates` was read here to gate a hardcoded sentence claiming every
 // duplicated hadith shared one specific isnad. Both are gone. The column
 // doesn't exist in AllBooks_July13.xlsx anyway — the API returns NULL for it.

 const arabicFields = {
 arabicText: hadith?.hadith_text_arabic || '',
 reference: hadith?.reference || '',
 // Arabic side: stripped Arabic, falling back to raw.
 book: hadith?.book_stripped || hadith?.book || '',
 chapter: hadith?.chapter_stripped || hadith?.chapter || '',
 section: hadith?.section_stripped || hadith?.section || '',
 ayat: hadith?.ayat || '',
 commentary: hadith?.commentary || '',
 grade: gradeArabic,
 };

 const handleBack = () => onClose();
 const handleEditClick = () => router.push(`/`);

 // Body-scroll lock, modal mode only.
 //
 // This one was already correct in isolation. It's on the shared counter now so
 // it can't fight the other overlays: if DetailView and MenuModal were ever open
 // together, whichever closed first unlocked the page out from under the other.
 useScrollLock(!asPage);

 const getField = (en, ar) => (isArabic ? ar : en);
 const getFont = () => (isArabic ? notoSansArabic.className : '');
 const getDir = () => (isArabic ? 'rtl' : 'ltr');

 // Parse references like "Bukhari 7405, Muslim 2675" into chip data

 // ═══════════════════════════════════════════════════════════════════════
 // PAGE LAYOUT (Figma dashboard) — desktop full-screen, all panels visible
 // ═══════════════════════════════════════════════════════════════════════
 if (asPage) {
 return (
 <div className={`min-h-screen w-full bg-[#F6F4F1] font-[Inter]`}>
 <Header onEdit={handleEditClick} onMenu={() => setShowBottomMenu(true)} />

 <div className="max-w-[1500px] mx-auto px-4 md:px-8 py-6">
 {/* Back button — plain text */}
 <button
 onClick={handleBack}
 className="mb-6 inline-flex items-center gap-2 text-base text-gray-800 hover:opacity-75 transition-opacity"
 >
 <span className="text-lg leading-none">←</span>
 Back
 </button>

 {/* ── Hadith cards row: English left, Arabic right ── */}
 {/* Mobile: flex-col-reverse so Arabic (rendered second in DOM) appears on top. */}
 <div className="flex flex-col-reverse md:grid md:grid-cols-2 gap-6 mb-4">
 {/* English card */}
 <div className={`bg-white rounded-[5px] p-6`}>
 <h3 className={`text-sm font-semibold mb-3 text-gray-900`}>
 {englishNarrator}
 </h3>
 <p className={`text-sm leading-[22px] mt-2 mb-5 whitespace-pre-line text-black`}>
 <HadithText text={englishText} />
 </p>
 <div className="flex items-center justify-between gap-3">
 <div className="flex items-center gap-3">
 <span className="h-[32px] px-4 inline-flex items-center justify-center bg-[#E6DEDA] rounded-[10px] text-[#6B5B55] text-sm font-medium whitespace-nowrap">
 {hadithIdLabel}
 </span>
 <span
 onClick={() => setShowGradingDetail(p => !p)}
 className="h-[32px] px-4 inline-flex items-center justify-center bg-[#EDE4E1] rounded-[10px] text-[#6E4A44] text-sm font-medium cursor-pointer"
 >
 <BookOpen size={16} className="mr-2" />
 {grade}
 </span>
 </div>
 {/* Mobile-only book toggle. Same expand behavior as desktop's action row. */}
 <button
 onClick={() => setIsExpanded(p => !p)}
 aria-label={isExpanded ? 'Hide details' : 'Show details'}
 className="md:hidden w-10 h-10 inline-flex items-center justify-center bg-[#523230] rounded-[5px] hover:bg-[#412725] transition-colors flex-shrink-0"
 >
 <svg width="14" height="18" viewBox="0 0 14 18" fill="none" xmlns="http://www.w3.org/2000/svg">
 <g clipPath="url(#clip0_book_mobile)">
 <path d="M0 4.09363V14.9923C0 15.3868 0.21374 15.732 0.587786 15.8799L5.29008 17.9512C5.61069 18.0991 5.9313 18.0991 6.25191 17.9512L13.6794 14.2525C13.8397 14.1539 13.9466 14.006 13.9466 13.8087V2.56486C13.9466 2.17034 13.5191 1.97308 13.145 2.12103L5.55725 6.01692C5.39695 6.11555 5.18321 6.11555 5.0229 6.01692L2.72519 4.78404C2.40458 4.58678 2.40458 4.14295 2.72519 3.94569L7.37405 1.47993C7.9084 1.18404 7.96183 0.493631 7.48092 0.197741C7.21374 0.000480797 6.83969 0.000480797 6.57252 0.148426L0.534351 3.20596C0.21374 3.40322 0 3.74843 0 4.09363Z" fill="white"/>
 <path d="M5.34392 4.93229L10.5271 2.12133C10.7409 1.97339 10.8477 1.6775 10.6874 1.48024C10.5271 1.23366 10.2065 1.18435 9.93934 1.28298L4.80957 4.09394C4.54239 4.19257 4.43552 4.53777 4.59583 4.73503C4.75613 4.98161 5.07674 5.08024 5.34392 4.93229Z" fill="white"/>
 </g>
 <defs>
 <clipPath id="clip0_book_mobile"><rect width="14" height="18" fill="white" /></clipPath>
 </defs>
 </svg>
 </button>
 </div>
 {showGradingDetail && graderInfo && (
 <div className={`mt-3 text-[13px] text-gray-700`}>
 Graded by <span className="font-semibold">{graderInfo.name}</span>
 {graderInfo.descriptor && (
 <div className="text-gray-500 text-[12px] mt-0.5">
 {graderInfo.descriptor}
 </div>
 )}
 </div>
 )}
 </div>

 {/* Arabic card */}
 <div className={`bg-white rounded-[5px] p-6`} dir="rtl" lang="ar">
 <h3 className={`text-right text-[15px] font-bold mb-3 ${notoSansArabic.className} text-[#1D1D1D]`}>
 {arabicNarrator}
 </h3>
 <p className={`${notoSansArabic.className} text-sm font-normal leading-[28px] mt-2 mb-5 whitespace-pre-line text-black`}>
 <HadithText text={arabicText} />
 </p>
 <div className="flex items-center gap-3">
 <span className="h-[32px] px-4 inline-flex items-center justify-center bg-[#E6DEDA] rounded-[10px] text-[#6B5B55] text-sm font-medium whitespace-nowrap">
 {arabicIdLabel}
 </span>
 <span className="h-[32px] px-4 inline-flex items-center justify-center bg-[#EDE4E1] rounded-[10px] text-[#6E4A44] text-sm font-medium gap-2">
 {gradeArabic}
 <BookOpen size={16} />
 </span>
 </div>
 </div>
 </div>

 {/* Action row — desktop only. On mobile the book button lives inside the English card. */}
 <div className="hidden md:flex items-center justify-between mb-5">
 <div className="flex items-center gap-2">
 {/* Green book button — toggles panel expansion */}
 <button
 onClick={() => setIsExpanded(p => !p)}
 aria-label={isExpanded ? 'Hide details' : 'Show details'}
 className="w-10 h-10 inline-flex items-center justify-center bg-[#523230] rounded-[5px] hover:bg-[#412725] transition-colors"
 >
 <svg width="14" height="18" viewBox="0 0 14 18" fill="none" xmlns="http://www.w3.org/2000/svg">
 <g clipPath="url(#clip0_book_toggle)">
 <path
 d="M0 4.09363V14.9923C0 15.3868 0.21374 15.732 0.587786 15.8799L5.29008 17.9512C5.61069 18.0991 5.9313 18.0991 6.25191 17.9512L13.6794 14.2525C13.8397 14.1539 13.9466 14.006 13.9466 13.8087V2.56486C13.9466 2.17034 13.5191 1.97308 13.145 2.12103L5.55725 6.01692C5.39695 6.11555 5.18321 6.11555 5.0229 6.01692L2.72519 4.78404C2.40458 4.58678 2.40458 4.14295 2.72519 3.94569L7.37405 1.47993C7.9084 1.18404 7.96183 0.493631 7.48092 0.197741C7.21374 0.000480797 6.83969 0.000480797 6.57252 0.148426L0.534351 3.20596C0.21374 3.40322 0 3.74843 0 4.09363Z"
 fill="white"
 />
 <path
 d="M5.34392 4.93229L10.5271 2.12133C10.7409 1.97339 10.8477 1.6775 10.6874 1.48024C10.5271 1.23366 10.2065 1.18435 9.93934 1.28298L4.80957 4.09394C4.54239 4.19257 4.43552 4.53777 4.59583 4.73503C4.75613 4.98161 5.07674 5.08024 5.34392 4.93229Z"
 fill="white"
 />
 </g>
 <defs>
 <clipPath id="clip0_book_toggle">
 <rect width="14" height="18" fill="white" />
 </clipPath>
 </defs>
 </svg>
 </button>

 <button
 aria-label="Share"
 onClick={() => alert('Share — coming soon')}
 className="w-10 h-10 inline-flex items-center justify-center bg-[#EDE4E1] rounded-[5px] text-[#523230] hover:bg-[#E4D8D4] transition-colors"
 >
 <Share2 size={18} />
 </button>
 </div>
 <div className="flex items-center gap-3">
 {/* Same metrics as HadithSlider on /desktopcompiler: w-8 h-8, rounded-[5px],
     20px icons. These were w-12 h-12 / rounded-[8px] / 22px — noticeably chunkier
     than the identical control one page over.

     The list is CIRCULAR now (see the neighbors route): back from Bukhari 1 goes
     to Bukhari 7563, the compiler's last. So prev/next are effectively always
     available; the disabled state only survives for a compiler with a single
     hadith, where wrapping would land you back where you started. */}
 <button
 aria-label="Previous"
 onClick={onPrev}
 disabled={!hasPrev}
 className="w-8 h-8 bg-[#523230] rounded-[5px] flex items-center justify-center transition-colors hover:bg-[#412725] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-[#523230]"
 >
 <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
 <path d="M5.83398 9.99667H17.5007M10.834 15L5.83398 10L10.834 5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
 </svg>
 </button>
 <button
 aria-label="Next"
 onClick={onNext}
 disabled={!hasNext}
 className="w-8 h-8 bg-[#523230] rounded-[5px] flex items-center justify-center transition-colors hover:bg-[#412725] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-[#523230]"
 >
 <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
 <path d="M14.166 9.99667H2.49935M9.16602 15L14.166 10L9.16602 5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
 </svg>
 </button>
 </div>
 </div>

 {/* When expanded: tabs on mobile, stacked panels on desktop. */}
 {isExpanded && (
 <>
 {/* ─── MOBILE: tabbed view ─── */}
 <div className="md:hidden">
 <div className="flex gap-34 mb-4 px-4">
 {["Contents", "Reference", "Commentary", "Ayat"].map(tab => (
 <div key={tab} onClick={() => setActiveTab(tab)} className="cursor-pointer">
 <div className={`inline-flex flex-col ${tab === "Ayat" ? "items-center" : "items-start"}`}>
 <div className={`text-sm font-medium ${activeTab === tab ? "text-black" : "text-gray-500"}`}>{tab}</div>
 {activeTab === tab && <div className={`h-[5px] bg-[#523230] mt-2.5 ${tab === "Ayat" ? "w-[63px]" : "w-full"}`} />}
 </div>
 </div>
 ))}
 </div>

 {activeTab === "Contents" && (
 <div className="bg-white rounded-[5px] p-4 mb-6">
 {[
 { type: "Book", title: getField(book, arabicFields.book) },
 { type: "Chapter", title: getField(chapter, arabicFields.chapter) },
 { type: "Section", title: getField(section, arabicFields.section) },
 { type: "Hadith", title: isArabic || selectedLanguage === 'ar' ? `الجامع الكامل ${hadith_number}` : `al-Jami al-Kamil ${hadith_number}` },
 ].map((item, i) => (
 <div key={i} className="flex items-start py-2 gap-3">
 <span className="w-4 h-4 flex items-center justify-center flex-shrink-0 mt-1">
 <RowIcon type={item.type} />
 </span>
 <span className="text-sm w-[70px] flex-shrink-0 text-gray-400">{item.type}</span>
 <div className={`flex-1 text-sm text-black ${getFont()}`} dir={getDir()}>
 {item.title || '—'}
 </div>
 </div>
 ))}
 </div>
 )}
 {activeTab === "Reference" && (
 <div className="bg-white rounded-[5px] p-4 mb-6">
 <MatchedReferenceChips
   value={hadith?.matched_hadith}
   onSelect={openRef} isArabic={isArabic}
   emptyText={isArabic ? 'لا توجد مراجع خارجية لهذا الحديث.' : 'No external references available for this hadith.'}
 />
 </div>
 )}
 {activeTab === "Commentary" && (
 <div className="bg-white rounded-[5px] p-4 mb-6">
 <div className={`text-sm text-black leading-[20px] whitespace-pre-line ${getFont()}`} dir={getDir()}>
 {getField(commentary, arabicFields.commentary) || (isArabic ? 'لا يوجد شرح لهذا الحديث.' : 'No commentary available for this hadith.')}
 </div>
 </div>
 )}
 {activeTab === "Ayat" && (
 <div className="bg-white rounded-[5px] p-4 mb-6">
 <div className={`text-sm text-black leading-[20px] whitespace-pre-line ${getFont()}`} dir={getDir()}>
 {ayat
   ? <AyatChips ayat={ayat} isArabic={isArabic} />
   : (isArabic ? 'لا توجد آيات مرتبطة بهذا الحديث.' : 'No ayat annotations available for this hadith.')}
 </div>
 </div>
 )}
 </div>

 {/* ─── DESKTOP ───
     Same shape and sizing as HadithDetailBottomSheet on /desktopcompiler:
     two 50% columns, Details + Ayat on the left, Reference + Commentary on the
     right. It used to be a 2x2 grid at larger type, so the same hadith looked
     like two different pages depending on how you reached it. */}
 <div className="hidden md:flex justify-center gap-8 w-full max-w-[1650px] mx-auto">

 {/* Details + Ayat */}
 <div className="w-[50%]">
 <PanelHeading isArabic={isArabic}>{isArabic ? 'التفاصيل' : 'Details'}</PanelHeading>

 <div dir={getDir()} lang={isArabic ? 'ar' : 'en'} className="bg-white p-3 rounded-[5px] mb-4">
 {/* Book > Chapter > Section — the real hierarchy, and the parameter order
     /api/sections-by-chapter takes. */}
 <DetailRow label="Book" display={isArabic ? 'الكتاب' : 'Book'} value={getField(book, arabicFields.book)} font={getFont()} />
 <DetailRow label="Chapter" display={isArabic ? 'الباب' : 'Chapter'} value={getField(chapter, arabicFields.chapter)} font={getFont()} />
 <DetailRow label="Section" display={isArabic ? 'الفصل' : 'Section'} value={getField(section, arabicFields.section)} font={getFont()} />
 <DetailRow
 label="Hadith"
 display={isArabic ? 'الحديث' : 'Hadith'}
 value={isArabic || selectedLanguage === 'ar' ? `الجامع الكامل ${hadith_number}` : `al-Jami al-Kamil ${hadith_number}`}
 font={getFont()}
 last
 />
 </div>

 <PanelHeading isArabic={isArabic}>{isArabic ? 'الآيات' : 'Ayat annotation'}</PanelHeading>
 <div dir={getDir()} lang={isArabic ? 'ar' : 'en'} className="bg-white px-4 py-3 rounded-[5px]">
 <div className={`text-xs leading-[18px] whitespace-pre-line text-start ${getFont()} ${ayat ? 'text-black' : 'text-[#6B5B55]'}`}>
 {ayat
   ? <AyatChips ayat={ayat} isArabic={isArabic} />
   : (isArabic ? 'لا توجد آيات مرتبطة بهذا الحديث.' : 'No ayat annotations available for this hadith.')}
 </div>
 </div>
 </div>

 {/* Reference + Commentary */}
 <div className="w-[50%] relative">

 {/* The language switch, moved here from a row of its own above the panels.
     It was a w-14 h-7 slab, permanently black — no "off" state, so it never
     showed you which way it was set.

     Now it matches HadithDetailBottomSheet: small, level with the Reference
     heading, grey when off and black when on.

     `end-4` not `right-4`: physical positioning ignores direction, so under RTL
     the switch would stay pinned right while everything else moved left. */}
 <div className="absolute end-4 top-2 z-10">
 <button
 onClick={() => setIsArabic(p => !p)}
 aria-label={isArabic ? 'Switch to English' : 'Switch to Arabic'}
 aria-pressed={isArabic}
 className={`relative inline-flex h-4 w-7 items-center rounded-full transition-colors focus:outline-none ${isArabic ? 'bg-black' : 'bg-gray-300'}`}
 >
 <span
 className={`inline-block h-2.5 w-2.5 transform rounded-full bg-white transition-transform ${isArabic ? 'translate-x-3.5' : 'translate-x-0.5'}`}
 />
 </button>
 </div>

 <PanelHeading isArabic={isArabic}>{isArabic ? 'المرجع' : 'Reference'}</PanelHeading>

 <div dir={getDir()} lang={isArabic ? 'ar' : 'en'} className="bg-white rounded-[5px] p-3 mb-4">
 <MatchedReferenceChips
   value={hadith?.matched_hadith}
   onSelect={openRef} isArabic={isArabic}
   emptyText={'No reference available'}
 />
 </div>

 <PanelHeading isArabic={isArabic}>{isArabic ? 'الشرح' : 'Commentary'}</PanelHeading>
 <div dir={getDir()} lang={isArabic ? 'ar' : 'en'} className="bg-white rounded-[5px] p-3 min-h-[100px]">
 {/* The commentary is Arabic in the DATA — commentary_1 has no English
     counterpart — so it carries its own dir regardless of UI language. */}
 <p
 className={`text-xs leading-[18px] whitespace-pre-line text-start ${commentary ? 'text-black' : 'text-[#6B5B55]'}`}
 dir={commentary ? 'rtl' : undefined}
 lang={commentary ? 'ar' : undefined}
 >
 {commentary || (isArabic ? 'لا يوجد شرح لهذا الحديث.' : 'No commentary available for this hadith.')}
 </p>
 </div>
 </div>

 </div>
 </>
 )}
 </div>

 <AnimatePresence>
 {showBottomMenu && (
 <BottomPopupMenu
 onClose={() => setShowBottomMenu(false)}
 onCollectionClick={() => { setShowBottomMenu(false); setShowHadithCollectionMenu(true); }}
 onLanguageClick={() => { setShowBottomMenu(false); setShowLanguageMenu(true); }}
 onAboutHadithClick={() => {}}
 onAboutUsClick={() => {}}
 />
 )}
 </AnimatePresence>
 <AnimatePresence>
 {showLanguageMenu && <LanguageMenu onClose={() => setShowLanguageMenu(false)} />}
 </AnimatePresence>
 <AnimatePresence>
 {showHadithCollectionMenu && <HadithCollectionMenu onClose={() => setShowHadithCollectionMenu(false)} />}
 </AnimatePresence>
 </div>
 );
 }

 // ═══════════════════════════════════════════════════════════════════════
 // MODAL LAYOUT (existing mobile behavior — preserved)
 // ═══════════════════════════════════════════════════════════════════════
 return (
 <div className="w-full max-w-md md:max-w-lg lg:max-w-xl mt-16 mx-auto min-h-screen bg-[#F6F4F1] z-[4000] flex flex-col font-[Inter] fixed inset-0">
 <div className="flex-1 px-[13px] pt-9 pb-10 pr-4 bg-[#F6F4F1] overflow-auto scrollbar-hide">
 {selectedLanguage !== 'ar' && (
 <div className="mb-[23px]">
 <div className="bg-white rounded-[5px] pt-4 px-5 pb-4">
 <div className="flex justify-end mb-3">
 <h3 className={`text-right text-[#1D1D1D] text-[15px] font-bold ${notoSansArabic.className}`} dir="rtl">
 {arabicNarrator}
 </h3>
 </div>
 <div className="text-right" dir="rtl">
 <p className={`${notoSansArabic.className} text-black text-sm font-normal leading-[26px] whitespace-pre-line`}>
 <HadithText text={arabicText} />
 </p>
 </div>
 </div>
 </div>
 )}

 <div className="mb-[23px]">
 <div className="bg-white rounded-[5px] pt-4 pr-7 pb-4 pl-5">
 <h3 className="text-sm font-semibold text-gray-900 mb-3">{englishNarrator}</h3>
 <p className="text-sm text-black leading-[22px] mt-2 mb-4 whitespace-pre-line">{englishText}</p>
 <div className="flex items-center justify-between mt-4">
 <div className="flex gap-7">
 <span className="w-[100px] h-[32px] px-4 py-1 bg-[#E6DEDA] rounded-[10px] inline-flex justify-center items-center text-[#6B5B55] text-sm font-medium whitespace-nowrap">
 {hadithIdLabel}
 </span>
 <span
 onClick={() => setShowGradingDetail(p => !p)}
 className="w-[100px] h-[32px] bg-[#EDE4E1] rounded-[10px] inline-flex items-center justify-center text-[#6E4A44] text-sm font-medium cursor-pointer"
 >
 <BookOpen size={16} className="mr-3 text-[#6E4A44]" />
 {grade}
 </span>
 </div>
 <div onClick={handleBack} className="w-11 h-12 rounded-[5px] bg-[#523230] flex items-center justify-center cursor-pointer">
 <BookOpen size={20} className="text-white" />
 </div>
 </div>
 {showGradingDetail && graderInfo && (
 <div className="mt-3 text-sm text-gray-700">
 <p className="text-[13px]">
 Graded by <span className="font-semibold">{graderInfo.name}</span>
 </p>
 {graderInfo.descriptor && (
 <p className="text-[12px] text-gray-500 mt-0.5">{graderInfo.descriptor}</p>
 )}
 </div>
 )}
 </div>
 </div>

 <div className="flex justify-between mb-4 px-2">
 {["Contents", "Reference", "Commentary", "Ayat"].map(tab => (
 <div key={tab} onClick={() => setActiveTab(tab)} className="cursor-pointer">
 <div className={`inline-flex flex-col ${tab === "Ayat" ? "items-center" : "items-start"}`}>
 <div className={`text-sm font-medium ${activeTab === tab ? "text-black" : "text-gray-500"}`}>{tab}</div>
 {activeTab === tab && <div className="h-[3px] bg-[#523230] mt-2 w-full" />}
 </div>
 </div>
 ))}
 </div>

 {activeTab === "Contents" && (
 <div className="bg-white p-4">
 {[
 { type: "Book", title: getField(book, arabicFields.book) },
 { type: "Chapter", title: getField(chapter, arabicFields.chapter) },
 { type: "Section", title: getField(section, arabicFields.section) },
 { type: "Hadith", title: isArabic || selectedLanguage === 'ar' ? `الجامع الكامل ${hadith_number}` : `al-Jami al-Kamil ${hadith_number}` },
 ].map((item, i) => (
 <div key={i} className="flex items-start py-1">
 <span className="text-xs text-gray-400 w-[60px]">{item.type}</span>
 <div className={`flex-1 text-black text-xs ${getFont()}`} dir={getDir()}>
 {item.title || '—'}
 </div>
 </div>
 ))}
 </div>
 )}
 {activeTab === "Reference" && (
 <div className="bg-white p-4 rounded-[5px]">
 <div className={`text-black text-xs ${getFont()}`} dir={getDir()}>
 <MatchedReferenceChips value={hadith?.matched_hadith} onSelect={openRef} isArabic={isArabic} emptyText={'No reference available'} />
 </div>
 </div>
 )}
 {activeTab === "Commentary" && (
 <div className="bg-white p-4 rounded-[5px]">
 <div className={`text-xs text-black leading-[18px] whitespace-pre-line ${getFont()}`} dir={getDir()}>
 {getField(commentary, arabicFields.commentary)}
 </div>
 </div>
 )}
 {activeTab === "Ayat" && (
 <div className="bg-white p-4 rounded-[5px]">
 <div className={`text-black text-xs leading-[18px] ${getFont()}`} dir={getDir()}>
 {ayat
   ? <AyatChips ayat={ayat} isArabic={isArabic} />
   : (isArabic ? 'لا توجد آيات مرتبطة بهذا الحديث.' : 'No ayat annotations available for this hadith.')}
 </div>
 </div>
 )}

 <ThreeDotDropdown onViewArabic={() => setIsArabic(p => !p)} isArabic={isArabic} selectedLanguage={selectedLanguage} />
 </div>

 <AnimatePresence>
 {showBottomMenu && (
 <BottomPopupMenu
 onClose={() => setShowBottomMenu(false)}
 onCollectionClick={() => { setShowBottomMenu(false); setShowHadithCollectionMenu(true); }}
 onLanguageClick={() => { setShowBottomMenu(false); setShowLanguageMenu(true); }}
 onAboutHadithClick={() => {}}
 onAboutUsClick={() => {}}
 />
 )}
 </AnimatePresence>
 <AnimatePresence>
 {showLanguageMenu && <LanguageMenu onClose={() => setShowLanguageMenu(false)} />}
 </AnimatePresence>
 <AnimatePresence>
 {showHadithCollectionMenu && <HadithCollectionMenu onClose={() => setShowHadithCollectionMenu(false)} />}
 </AnimatePresence>
 </div>
 );
}

// ─── Helper components for the dashboard layout ────────────────────────

// Pretty-print the grader name returned from the API's final_grader column.
// Azami rows get the longer Madinah descriptor that the old hardcoded UI used;
// every other grader just gets their plain name.
function formatGrader(name) {
 if (!name) return null;
 const trimmed = String(name).trim();
 if (!trimmed) return null;
 if (trimmed.toLowerCase() === 'azami') {
 return {
 name: 'Zia-ur-Rahman Azami',
 descriptor: '(Dean of the College of Hadith at the Islamic University of Madinah)',
 };
 }
 return { name: trimmed, descriptor: null };
}

// Just the heading. The white card is written at each call site now, so Details
// and Ayat can sit in one column while Reference and Commentary sit in the
// other — which is what HadithDetailBottomSheet does, and what this page now
// matches.
//
// Sizing copied from that component exactly: text-xs / font-medium, not the
// text-sm / font-semibold this page used. Same hadith should not look like two
// different products depending on how you reached it.
function PanelHeading({ children, isArabic }) {
 return (
 <div
 dir={isArabic ? 'rtl' : 'ltr'}
 className="text-black text-xs font-medium font-['Inter'] mt-10 ms-2 mb-2 text-start"
 >
 {children}
 </div>
 );
}

// Tiny outline icons used next to Book / Section / Chapter / Hadith rows.
function RowIcon({ type }) {
 if (type === 'Book') {
 return (
 <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
 <path d="M4 14.6663H14V13.333H4.008C3.7 13.325 3.33333 13.203 3.33333 12.6663C3.33333 12.1297 3.7 12.0077 4.008 11.9997H14V2.66634C14 1.93101 13.402 1.33301 12.6667 1.33301H4C3.196 1.33301 2 1.86567 2 3.33301V12.6663C2 14.1337 3.196 14.6663 4 14.6663ZM3.33333 5.33301V3.33301C3.33333 2.79634 3.7 2.67434 4 2.66634H12.6667V10.6663H3.33333V5.33301Z" fill="#939393" />
 <path d="M5.33301 4H11.333V5.33333H5.33301V4Z" fill="#939393" />
 </svg>
 );
 }
 if (type === 'Section') {
 return (
 <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
 <path d="M13.9997 1.33301H1.99967C1.82286 1.33301 1.65329 1.40325 1.52827 1.52827C1.40325 1.65329 1.33301 1.82286 1.33301 1.99967V13.9997C1.33301 14.1765 1.40325 14.3461 1.52827 14.4711C1.65329 14.5961 1.82286 14.6663 1.99967 14.6663H13.9997C14.1765 14.6663 14.3461 14.5961 14.4711 14.4711C14.5961 14.3461 14.6663 14.1765 14.6663 13.9997V1.99967C14.6663 1.82286 14.5961 1.65329 14.4711 1.52827C14.3461 1.40325 14.1765 1.33301 13.9997 1.33301ZM9.33301 13.333H2.66634V2.66634H9.33301V13.333ZM13.333 13.333H10.6663V2.66634H13.333V13.333Z" fill="#939393" />
 </svg>
 );
 }
 if (type === 'Chapter') {
 return (
 <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
 <path d="M3.33366 9.33366V3.33366H12.667V13.3337H7.33366M12.667 10.667H15.3337V0.666992H6.00033V3.33366M3.33366 10.667V16.0003M6.00033 13.3337H0.666992" stroke="#939393" strokeWidth="1.33333" />
 </svg>
 );
 }
 if (type === 'Hadith') {
 return (
 <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
 <path d="M7.99967 13.0968C7.09901 12.4628 6.05634 12.0588 4.96301 11.9228C4.18757 11.7653 3.39755 11.6909 2.60634 11.7008C2.5051 11.7017 2.40469 11.6825 2.3109 11.6444C2.21712 11.6063 2.13181 11.5499 2.05991 11.4787C1.98801 11.4074 1.93094 11.3226 1.892 11.2291C1.85305 11.1357 1.833 11.0354 1.83301 10.9342L1.84701 3.67217C1.84658 3.47732 1.92036 3.28962 2.05336 3.14721C2.18635 3.00481 2.36858 2.91838 2.56301 2.90551C3.36844 2.8895 4.17321 2.96148 4.96301 3.12017C6.05516 3.26108 7.09701 3.66409 7.99967 4.29484M7.99967 13.0968V4.29484M7.99967 13.0968C8.90034 12.4628 9.94301 12.0588 11.0363 11.9228C11.8118 11.7653 12.6018 11.6909 13.393 11.7008C13.4942 11.7017 13.5947 11.6825 13.6884 11.6444C13.7822 11.6063 13.8675 11.5499 13.9394 11.4787C14.0113 11.4074 14.0684 11.3226 14.1074 11.2291C14.1463 11.1357 14.1663 11.0354 14.1663 10.9342L14.1517 3.67217C14.1521 3.47743 14.0784 3.28982 13.9456 3.14743C13.8127 3.00504 13.6306 2.91855 13.4363 2.90551C12.6309 2.8895 11.8261 2.96148 11.0363 3.12017C9.94419 3.26108 8.90234 3.66409 7.99967 4.29484" stroke="#939393" strokeLinecap="round" strokeLinejoin="round" />
 </svg>
 );
 }
 return null;
}

// `label` stays English — RowIcon keys off it. `display` is what the user sees.
//
// Metrics match HadithDetailBottomSheet: py-0.5, w-[60px] label, text-xs value.
// This row was py-2 / w-[80px] / text-sm, which is most of why the two pages
// felt unrelated.
//
// me-* / ms-*, not mr-* / ml-*: physical margins ignore direction, so under RTL
// they'd leave the icon on the wrong side of its label.
function DetailRow({ label, display, value, font, last }) {
 return (
 <div className={`flex items-start py-0.5 ${last ? '' : 'mb-1'}`}>
 <span className="w-4 h-4 flex items-start justify-center me-2 flex-shrink-0 mt-0.5">
 <RowIcon type={label} />
 </span>
 <span className="text-xs text-gray-400 me-4 w-[60px] mt-0.5">
 {display || label}
 </span>
 <div className={`flex-1 text-xs break-words ${font} text-black`}>
 {value || '—'}
 </div>
 </div>
 );
}