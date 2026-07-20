"use client";
import { useState } from "react";
import { BookOpen, Share2 } from "lucide-react";
import HadithDetailBottomSheet from "./HadithDetailBottomSheet";
import HadithText from "./HadithText";
import { compilerFor, gradeFor } from "../lib/i18n";

// Pretty-print the grader name returned from the API.
// Backend guarantees final_grader is non-null: "Azami" for azami rows,
// the actual grader (e.g. "Darussalam", "Albani") for sevenbooks rows.
// We add the longer descriptor only for Azami since that's the special case
// the original UI was already calling out.
function formatGrader(name) {
  if (!name) return null;
  const trimmed = String(name).trim();
  if (!trimmed) return null;
  if (trimmed.toLowerCase() === 'azami') {
    return {
      primary: 'Graded by Zia-ur-Rahman Azami',
      secondary: '(Dean of the College of Hadith at the Islamic University of Madinah)',
    };
  }
  return { primary: `Graded by ${trimmed}`, secondary: null };
}

// `language` comes from HadithByCompiler, which reads it from LanguageProvider.
// 'en' => English + Arabic side by side (the default)
// 'ar' => Arabic only, full width
// `index` is now CONTROLLED by the parent (HadithByCompiler).
//
// It used to be local useState in here, which meant the parent had no idea which
// hadith was on screen — and so the "show this book" button next to the heading
// had nothing to work from. Lifted up. If no parent passes it, this falls back
// to its own state, so any other caller keeps working unchanged.
export default function HadithSlider({
    hadiths = [],
    language = 'en',
    index: controlledIndex,
    onIndexChange,
    onPrev,          // optional: parent handles prev, incl. crossing pages
    onNext,          // optional: parent handles next, incl. crossing pages
}) {
    const isArabic = language === 'ar';
    const [showEnglishGradeInfo, setShowEnglishGradeInfo] = useState({});
    const [uncontrolledIndex, setUncontrolledIndex] = useState(0);
    const [showDetail, setShowDetail] = useState(false);

    const isControlled = typeof controlledIndex === 'number' && typeof onIndexChange === 'function';
    const index = isControlled ? controlledIndex : uncontrolledIndex;
    const setIndex = isControlled ? onIndexChange : setUncontrolledIndex;

    if (!hadiths || hadiths.length === 0) {
        return (
            <div className="flex justify-center items-center min-h-[300px] text-gray-500">
                {language === 'ar' ? 'لا يوجد حديث لعرضه.' : 'No hadith to display.'}
            </div>
        );
    }

    // If the parent supplies onPrev/onNext, it is in charge — because it knows
    // things this component does not.
    //
    // The fallback below wraps inside `hadiths`, which is ONE PAGE of 50. So
    // "back" from the first row landed on the 50th, not because 50 means
    // anything but because it was the last row in memory. On page 2 the same
    // click would have gone to row 100. That's pagination leaking into
    // navigation.
    //
    // HadithByCompiler passes real handlers that cross page boundaries and wrap
    // around the whole compiler: Bukhari 1 -> back -> Bukhari 7563. The fallback
    // stays for any other caller that renders this slider with a plain array.
    const onBack = onPrev
        ? onPrev
        : () => setIndex(index > 0 ? index - 1 : hadiths.length - 1);

    const onForward = onNext
        ? onNext
        : () => setIndex((index + 1) % hadiths.length);

    const onShare = () => {
        if (typeof window === "undefined") return;
        const url = window.location.href;
        if (navigator.share) {
            navigator.share({ url }).catch(() => {});
        } else {
            navigator.clipboard?.writeText(url);
        }
    };

    const toggleEnglishGradeInfo = (hadithIndex) => {
        setShowEnglishGradeInfo((prev) => ({
            ...prev,
            [hadithIndex]: !prev[hadithIndex],
        }));
    };

    // The parent resets index on filter changes, but a render can slip through
    // with a stale value. Clamp rather than crash on undefined.
    const hadith = hadiths[Math.min(index, hadiths.length - 1)];

    const englishNarrator = hadith.english_narrator
        ? `${hadith.english_narrator} reported,`
        : "Reported,";
    const arabicNarrator = hadith.arabic_intro_clause || "";

    // hadith_text_english is NULL when there is no translation (Malik: 0 of 1,952).
    // Say so plainly rather than showing an empty panel.
    const englishContent = hadith.hadith_text_english
        || 'No English translation available for this hadith yet.';
    const arabicContent  = hadith.hadith_text_arabic || '';

    // English-side labels: translated compiler + English grade
    const englishLabel = `${compilerFor(hadith.compiler, 'en')} ${hadith.hadith_number}`;
    const englishGrade = gradeFor(hadith.grade, 'en');

    // Arabic-side labels: keep DB values as-is (Arabic reader expects Arabic)
    const arabicLabel = `${hadith.compiler || ''} ${hadith.hadith_number}`;
    const arabicGrade = hadith.grade || '';

    // Pulled from the API (final_grader column). For Azami rows the backend
    // hardcodes the value to "Azami"; for sevenbooks rows it uses whatever
    // the Final Grader column held (Darussalam, Albani, etc.).
    const graderInfo = formatGrader(hadith.final_grader);

    return (
        <div className="flex flex-col w-full font-['Inter'] bg-[#F6F4F1] min-h-screen ">
            <div className="w-full max-w-[1920px] mx-auto">
                <div className="flex items-stretch justify-center gap-8 md:gap-8 mb-6 mt-10">
                    {/* English Section — hidden entirely in Arabic mode */}
                    {!isArabic && (
                    <div className="relative bg-white rounded-[5px] p-6 w-full max-w-[1728px] flex-1 flex flex-col">
                        <div className="flex-1">
                            <p className="text-base font-bold text-black mb-4">{englishNarrator}</p>
                            <p className="text-base text-black font-normal leading-[26px] mb-5 whitespace-pre-line"><HadithText text={englishContent} /></p>
                        </div>

                        <div className="mt-auto pt-6">
                            <div className="flex gap-3">
                                <div className="px-3 py-1 bg-[#E6DEDA] rounded-[10px] text-sm text-[#6B5B55] font-medium">
                                    {englishLabel}
                                </div>
                                <div
                                    className="px-3 py-1 bg-[#EDE4E1] rounded-[10px] text-sm font-medium text-[#6E4A44] flex items-center gap-1 cursor-pointer"
                                    onClick={() => toggleEnglishGradeInfo(index)}
                                >
                                    <BookOpen size={15} className="mr-1" />
                                    {englishGrade}
                                </div>
                            </div>

                            {showEnglishGradeInfo[index] && graderInfo && (
                                <p className="text-black text-xs font-medium font-['Inter'] mt-2">
                                    {graderInfo.primary}
                                    {graderInfo.secondary && (
                                        <>
                                            <br />
                                            {graderInfo.secondary}
                                        </>
                                    )}
                                </p>
                            )}
                        </div>
                    </div>
                    )}

                    {/* Arabic Section */}
                    <div className="bg-white rounded-[5px] p-6 text-right w-full max-w-[1728px] flex-1 flex flex-col" dir="rtl">
                        <div className="flex-1">
                            <p className="text-base font-bold text-black mb-4" lang="ar">
                                {arabicNarrator}
                            </p>
                            <p className="text-base text-black font-normal leading-[26px] mb-5 whitespace-pre-line" lang="ar">
                                <HadithText text={arabicContent} />
                            </p>
                        </div>

                        {/* justify-START, not end.

                            The Arabic panel is dir="rtl", so the flex main axis runs
                            right-to-left: "end" is the LEFT edge. To pin the chips to
                            the right — where an Arabic reader's eye starts — the
                            correct value is `start`. */}
                        <div className="flex gap-3 justify-start mt-auto pt-6">
                            <div className="flex items-center justify-center gap-2 px-3 py-1 bg-[#EDE4E1] rounded-[10px] text-sm font-['Inter'] text-[#6E4A44]">
                                <span className="relative -translate-y-0.5">{arabicGrade}</span>
                                <BookOpen size={15} />
                            </div>
                            <div className="px-3 py-1 bg-[#E6DEDA] rounded-[10px] text-sm text-[#6B5B55] font-['Inter']">
                                {arabicLabel}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-between items-center px-4">
                    <div className="flex-1 max-w-[940px]">
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowDetail(!showDetail)}
                                aria-label="View details"
                                className={`w-10 h-10 rounded-[8px] flex items-center justify-center transition-colors ${
                                    showDetail
                                        ? "bg-[#523230] text-white"
                                        : "bg-[#E8DCD8] text-[#523230] hover:bg-[#DFD0CB]"
                                }`}
                            >
                                <svg width="16" height="20" viewBox="0 0 14 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M0 4.09363V14.9923C0 15.3868 0.21374 15.732 0.587786 15.8799L5.29008 17.9512C5.61069 18.0991 5.9313 18.0991 6.25191 17.9512L13.6794 14.2525C13.8397 14.1539 13.9466 14.006 13.9466 13.8087V2.56486C13.9466 2.17034 13.5191 1.97308 13.145 2.12103L5.55725 6.01692C5.39695 6.11555 5.18321 6.11555 5.0229 6.01692L2.72519 4.78404C2.40458 4.58678 2.40458 4.14295 2.72519 3.94569L7.37405 1.47993C7.9084 1.18404 7.96183 0.493631 7.48092 0.197741C7.21374 0.000480797 6.83969 0.000480797 6.57252 0.148426L0.534351 3.20596C0.21374 3.40322 0 3.74843 0 4.09363Z" fill="currentColor" />
                                    <path d="M5.34392 4.93229L10.5271 2.12133C10.7409 1.97339 10.8477 1.6775 10.6874 1.48024C10.5271 1.23366 10.2065 1.18435 9.93934 1.28298L4.80957 4.09394C4.54239 4.19257 4.43552 4.53777 4.59583 4.73503C4.75613 4.98161 5.07674 5.08024 5.34392 4.93229Z" fill="currentColor" />
                                </svg>
                            </button>

                            <button
                                onClick={onShare}
                                aria-label="Share"
                                className="w-10 h-10 rounded-[8px] flex items-center justify-center bg-[#EAE2D4] text-[#6E6250] hover:bg-[#E0D6C4] transition-colors"
                            >
                                <Share2 size={18} />
                            </button>
                        </div>
                    </div>

                    <div className="flex gap-4 items-center text-sm text-gray-600">
                        <button
                            onClick={onBack}
                            className="w-8 h-8 bg-[#523230] rounded-[5px] flex items-center justify-center"
                        >
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                <path d="M5.83398 9.99667H17.5007M10.834 15L5.83398 10L10.834 5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </button>
                        <button
                            onClick={onForward}
                            className="w-8 h-8 bg-[#523230] rounded-[5px] flex items-center justify-center"
                        >
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                <path d="M14.166 9.99667H2.49935M9.16602 15L14.166 10L9.16602 5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {showDetail && (
                <HadithDetailBottomSheet
                    isOpen={showDetail}
                    onClose={() => setShowDetail(false)}
                    hadith={hadith}
                />
            )}
        </div>
    );
}