"use client";
import { useState } from "react";
import { BookOpen } from "lucide-react";
import Link from "next/link";
import HadithText from "./HadithText";
import { slugFromLabel } from "../lib/hadithUrl";

// Pretty-print the grader name from the API's final_grader column.
// Azami rows get the longer Madinah descriptor; everyone else gets just the name.
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

// The maroon expand button (the book icon). Shared by both the English and
// Arabic sides so the control exists in every language, not just English.
function ExpandBookButton({ onClick }) {
  return (
    <div onClick={onClick} className="w-11 h-12 relative rounded-[5px] cursor-pointer flex-shrink-0">
      <div className="w-11 h-12 absolute left-0 top-0 bg-[#523230] hover:bg-[#412725] rounded-[5px] flex items-center justify-center transition-colors">
        <button>
          <svg
            width="14"
            height="18"
            viewBox="0 0 14 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-[14px] h-[18px]"
          >
            <g clipPath="url(#clip0_1501_721)">
              <path
                d="M0 4.09363V14.9923C0 15.3868 0.21374 15.732 0.587786 15.8799L5.29008 17.9512C5.61069 18.0991 5.9313 18.0991 6.25191 17.9512L13.6794 14.2525C13.8397 14.1539 13.9466 14.006 13.9466 13.8087V2.56486C13.9466 2.17034 13.5191 1.97308 13.145 2.12103L5.55725 6.01692C5.39695 6.11555 5.18321 6.11555 5.0229 6.01692L2.72519 4.78404C2.40458 4.58678 2.40458 4.14295 2.72519 3.94569L7.37405 1.47993C7.9084 1.18404 7.96183 0.493631 7.48092 0.197741C7.21374 0.000480797 6.83969 0.000480797 6.57252 0.148426L0.534351 3.20596C0.21374 3.40322 0 3.74843 0 4.09363Z"
                fill="#FFFFFF"
              />
              <path
                d="M5.34392 4.93229L10.5271 2.12133C10.7409 1.97339 10.8477 1.6775 10.6874 1.48024C10.5271 1.23366 10.2065 1.18435 9.93934 1.28298L4.80957 4.09394C4.54239 4.19257 4.43552 4.53777 4.59583 4.73503C4.75613 4.98161 5.07674 5.08024 5.34392 4.93229Z"
                fill="#FFFFFF"
              />
            </g>
            <defs>
              <clipPath id="clip0_1501_721">
                <rect width="14" height="18" fill="white" />
              </clipPath>
            </defs>
          </svg>
        </button>
      </div>
    </div>
  );
}

export default function HadithCard({
  // English side
  narrator,
  content,
  hadithId,        // display label, e.g. "Tirmidhi 1"
  hadithLinkId,    // raw id used for the URL, e.g. "sevenbooks-43180"
  grade,
  finalGrader,     // who graded the hadith — from API's final_grader column
  // Arabic side
  narratorAr,
  contentAr,
  chainAr,          // Arabic chain of narrators (isnad) — shown above the intro, when present
  hadithIdAr,      // Arabic display label, e.g. "الترمذي 1"
  gradeAr,
  // Behavior
  onView,            // legacy: opens mobile detail modal
  onToggleExpand,    // new: toggle inline panel expansion (used on /results)
  isExpanded = false,// new: when true, book button shows dark-green "active" state
  // Language
  showEnglish = true, // false in Arabic mode: hide the English column entirely
  //                     and let the Arabic run full width.
}) {
  const hasArabic = !!(contentAr || narratorAr);
  const bilingual = showEnglish && hasArabic;

  // Local toggle for the "Graded by" line that drops below the grade chip
  // when it's tapped. Independent of the panel expansion (isExpanded) so
  // either can be open without the other.
  const [showGrader, setShowGrader] = useState(false);
  const graderInfo = formatGrader(finalGrader);

  // Prefer the new toggle handler if provided; fall back to legacy onView.
  const handleBookClick = onToggleExpand || onView;

  // The hadith-id tag becomes a Link if a hadithLinkId is provided;
  // otherwise it stays as a plain styled div (backward-compatible).
  // Link to the readable URL (Tirmidhi1) rather than the composite id.
  // hadithId is already "Tirmidhi 1", so the slug comes straight off it; if it
  // isn't that shape, fall back to the id, which still resolves.
  const linkTarget = slugFromLabel(hadithId) || hadithLinkId;

  const idTagClassName =
    "h-[32px] px-4 py-1 bg-[#E6DEDA] rounded-[10px] flex items-center justify-center whitespace-nowrap text-[#6B5B55] text-sm font-medium hover:bg-[#DDD2CD] transition-colors";

  const EnglishIdTag = hadithLinkId ? (
    <Link href={`/${encodeURIComponent(linkTarget)}`} className={idTagClassName}>
      {hadithId}
    </Link>
  ) : (
    <div className={idTagClassName}>{hadithId}</div>
  );

  const ArabicIdTag = hadithLinkId ? (
    <Link href={`/${encodeURIComponent(linkTarget)}`} className={idTagClassName}>
      {hadithIdAr}
    </Link>
  ) : (
    <div className={idTagClassName}>{hadithIdAr}</div>
  );

  return (
    <div className="w-full mb-8 font-['Inter']">
      {/* Two SEPARATE cards, like HadithSlider on /desktopcompiler — each side
          is its own white panel with a gap between them, not one box split by a
          border. bg-white / rounded moved onto the panels below; the divider
          border is gone. Nothing inside either panel changed. */}
      <div className={`flex flex-col-reverse gap-5 ${
        bilingual ? 'md:flex-row md:gap-8' : 'md:block'
      }`}>
        {/* ─── English side ─── */}
        {showEnglish && (
        <div className={`bg-white rounded-[5px] px-6 py-6 flex flex-col ${bilingual ? 'md:flex-1' : ''}`}>
          <p className="text-sm font-semibold text-black mb-5">{narrator}</p>

          <p className="text-sm text-black font-normal leading-[22px] mt-2 mb-4 whitespace-pre-line">
            <HadithText text={content} />
          </p>

          <div className="flex items-center justify-between mt-auto">
            <div className="flex items-center gap-2 flex-wrap">
              {EnglishIdTag}

              <div
                onClick={graderInfo ? () => setShowGrader(p => !p) : undefined}
                className={`inline-flex h-[32px] px-4 bg-[#EDE4E1] rounded-[10px] items-center justify-center ${graderInfo ? 'cursor-pointer hover:bg-[#E4D8D4] transition-colors' : ''}`}
              >
                <div
                  className="flex items-center text-sm font-medium"
                  style={{ color: "#6E4A44" }}
                >
                  <BookOpen size={16} className="mr-3" />
                  {grade}
                </div>
              </div>
            </div>

            <div onClick={handleBookClick} className="w-11 h-12 relative rounded-[5px] cursor-pointer flex-shrink-0">
              <div className="w-11 h-12 absolute left-0 top-0 bg-[#523230] hover:bg-[#412725] rounded-[5px] flex items-center justify-center transition-colors">
                <button>
                  <svg
                    width="14"
                    height="18"
                    viewBox="0 0 14 18"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-[14px] h-[18px]"
                  >
                    <g clipPath="url(#clip0_1501_721)">
                      <path
                        d="M0 4.09363V14.9923C0 15.3868 0.21374 15.732 0.587786 15.8799L5.29008 17.9512C5.61069 18.0991 5.9313 18.0991 6.25191 17.9512L13.6794 14.2525C13.8397 14.1539 13.9466 14.006 13.9466 13.8087V2.56486C13.9466 2.17034 13.5191 1.97308 13.145 2.12103L5.55725 6.01692C5.39695 6.11555 5.18321 6.11555 5.0229 6.01692L2.72519 4.78404C2.40458 4.58678 2.40458 4.14295 2.72519 3.94569L7.37405 1.47993C7.9084 1.18404 7.96183 0.493631 7.48092 0.197741C7.21374 0.000480797 6.83969 0.000480797 6.57252 0.148426L0.534351 3.20596C0.21374 3.40322 0 3.74843 0 4.09363Z"
                        fill="#FFFFFF"
                      />
                      <path
                        d="M5.34392 4.93229L10.5271 2.12133C10.7409 1.97339 10.8477 1.6775 10.6874 1.48024C10.5271 1.23366 10.2065 1.18435 9.93934 1.28298L4.80957 4.09394C4.54239 4.19257 4.43552 4.53777 4.59583 4.73503C4.75613 4.98161 5.07674 5.08024 5.34392 4.93229Z"
                        fill="#FFFFFF"
                      />
                    </g>
                    <defs>
                      <clipPath id="clip0_1501_721">
                        <rect width="14" height="18" fill="white" />
                      </clipPath>
                    </defs>
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* "Graded by" reveal — only when the user taps the grade chip */}
          {showGrader && graderInfo && (
            <div className="mt-3 text-[13px] text-gray-700">
              Graded by <span className="font-semibold">{graderInfo.name}</span>
              {graderInfo.descriptor && (
                <div className="text-gray-500 text-[12px] mt-0.5">
                  {graderInfo.descriptor}
                </div>
              )}
            </div>
          )}
        </div>
        )}

        {/* ─── Arabic side ─── */}
        {hasArabic && (
          <div className={`bg-white rounded-[5px] px-6 py-6 flex flex-col ${bilingual ? 'md:flex-1' : ''}`} dir="rtl" lang="ar">
            {chainAr && (
              <p className="text-[15px] font-semibold text-black mb-2 leading-[30px]">
                <HadithText text={chainAr} />
              </p>
            )}

            <p className="text-[15px] font-semibold text-black mb-5 leading-[30px]">
              {narratorAr}
            </p>

            <p className="text-[15px] text-black font-normal leading-[30px] mt-2 mb-4 whitespace-pre-line">
              <HadithText text={contentAr} />
            </p>

            <div className="flex items-center justify-between gap-2 mt-auto">
              <div className="flex items-center gap-2 flex-wrap">
                {ArabicIdTag}

                <div className="inline-flex h-[32px] px-4 bg-[#EDE4E1] rounded-[10px] items-center justify-center">
                  <div
                    className="flex items-center text-sm font-medium gap-3"
                    style={{ color: "#6E4A44" }}
                  >
                    {gradeAr}
                    <BookOpen size={16} />
                  </div>
                </div>
              </div>

              {!showEnglish && handleBookClick && <ExpandBookButton onClick={handleBookClick} />}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}