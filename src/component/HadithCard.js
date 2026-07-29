"use client";
import { useState } from "react";
import { BookOpen } from "lucide-react";
import Link from "next/link";
import HadithText from "./HadithText";
import { slugFromLabel } from "../lib/hadithUrl";
import { formatGrader, gradedByLabel } from "../lib/graders";

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
  finalGraderDescription, // final_grader_description — shown under the name
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
  isNotHadith = false, // row is a "not hadith" marker: the Arabic exists but
  //                      was never translated and was never graded.
}) {
  const hasArabic = !!(contentAr || narratorAr);
  const bilingual = showEnglish && hasArabic;

  // Local toggle for the "Graded by" line that drops below the grade chip
  // when it's tapped. Independent of the panel expansion (isExpanded) so
  // either can be open without the other.
  const [showGrader, setShowGrader] = useState(false);
  // Fixed per card: English chip reads English, Arabic chip reads Arabic.
  const graderRow = { final_grader: finalGrader, final_grader_description: finalGraderDescription };
  const graderInfoEn = formatGrader(graderRow, false);
  const graderInfoAr = formatGrader(graderRow, true);

  // Prefer the new toggle handler if provided; fall back to legacy onView.
  const handleBookClick = onToggleExpand || onView;

  // The hadith-id tag becomes a Link if a hadithLinkId is provided;
  // otherwise it stays as a plain styled div (backward-compatible).
  // Link to the readable URL (Tirmidhi1) rather than the composite id.
  // hadithId is already "Tirmidhi 1", so the slug comes straight off it; if it
  // isn't that shape, fall back to the id, which still resolves.
  const linkTarget = slugFromLabel(hadithId) || hadithLinkId;

  // Colour is an INLINE STYLE, not a text-[...] class.
  //
  // Measured off the rendered page: the grade chip came out #6B5B55 while this
  // one came out near-black (#171717 — the body's --foreground). The grade chip
  // sets its colour inline and this one set it by class, and the class was not
  // winning. Same approach for both removes the discrepancy.
  const idTagClassName =
    "h-[32px] px-4 py-1 bg-[#E6DEDA] rounded-[10px] flex items-center justify-center whitespace-nowrap text-sm font-medium hover:bg-[#DDD2CD] transition-colors";
  const idTagStyle = { color: '#6B5B55' };

  const EnglishIdTag = hadithLinkId ? (
    <Link href={`/${encodeURIComponent(linkTarget)}`} className={idTagClassName} style={idTagStyle}>
      {hadithId}
    </Link>
  ) : (
    <div className={idTagClassName} style={idTagStyle}>{hadithId}</div>
  );

  const ArabicIdTag = hadithLinkId ? (
    <Link href={`/${encodeURIComponent(linkTarget)}`} className={idTagClassName} style={idTagStyle}>
      {hadithIdAr}
    </Link>
  ) : (
    <div className={idTagClassName} style={idTagStyle}>{hadithIdAr}</div>
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

          {/* "not hadith" rows carry Arabic but no English. Left blank, the
              card reads as a loading failure; naming the absence is honest
              and stops the panel collapsing to nothing. */}
          {isNotHadith ? (
            <p className="text-sm font-normal italic leading-[22px] mt-2 mb-4" style={{ color: '#8A7A72' }}>
              No translation available
            </p>
          ) : (
            <p className="text-sm text-black font-normal leading-[22px] mt-2 mb-4 whitespace-pre-line">
              <HadithText text={content} />
            </p>
          )}

          {/* min-h-12 on BOTH footers.

              The two cards already stretch to equal height and both footers are
              mt-auto, so they share a bottom edge. But this one holds the 48px
              book button while the Arabic one holds only 32px chips, and
              items-center then centres each row's chips within a different
              height — leaving the two id tags about 8px apart no matter how long
              the text was. Giving both rows the taller row's height makes the
              chips line up at every text length. */}
          <div className="flex items-center justify-between mt-auto min-h-12">
            <div className="flex items-center gap-2 flex-wrap">
              {EnglishIdTag}

              <div
                onClick={graderInfoEn ? () => setShowGrader(p => !p) : undefined}
                className={`inline-flex h-[32px] px-4 bg-[#E6DEDA] rounded-[10px] items-center justify-center ${graderInfoEn ? 'cursor-pointer hover:bg-[#DDD2CD] transition-colors' : ''}`}
              >
                <div
                  className="flex items-center text-sm font-medium"
                  style={{ color: "#6B5B55" }}
                >
                  <BookOpen size={16} className="mr-3" />
                  {isNotHadith ? 'Not graded' : grade}
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
          {showGrader && graderInfoEn && (
            <div className="mt-3 text-[13px] text-black text-start">
              {gradedByLabel(false)}{graderInfoEn.name}
              {graderInfoEn.descriptor && (
                <div className="text-black text-[13px] mt-0.5">
                  {graderInfoEn.descriptor}
                </div>
              )}
            </div>
          )}
        </div>
        )}

        {/* ─── Arabic side ─── */}
        {hasArabic && (
          <div className={`bg-white rounded-[5px] px-6 py-6 flex flex-col ${bilingual ? 'md:flex-1' : ''}`} dir="rtl" lang="ar">
            {/* Muted and set off by a rule: the isnad is the header to the
                hadith, not a second headline competing with the narrator. */}
            {chainAr && (
              <p className="text-[13px] font-normal text-[#8A7A72] leading-[26px] mb-2 pb-2 border-b border-[#EFE9E6]">
                <HadithText text={chainAr} />
              </p>
            )}

            <p className="text-[15px] font-semibold text-black mb-5 leading-[30px]">
              {narratorAr}
            </p>

            <p className="text-[15px] text-black font-normal leading-[30px] mt-2 mb-4 whitespace-pre-line">
              <HadithText text={contentAr} />
            </p>

            {/* Matches the English footer's min-h-12 — see the note there. */}
            <div className="flex items-center justify-between gap-2 mt-auto min-h-12">
              <div className="flex items-center gap-2 flex-wrap">
                {ArabicIdTag}

                <div
                  onClick={graderInfoAr ? () => setShowGrader(p => !p) : undefined}
                  className={`inline-flex h-[32px] px-4 bg-[#E6DEDA] rounded-[10px] items-center justify-center ${graderInfoAr ? 'cursor-pointer hover:bg-[#DDD2CD] transition-colors' : ''}`}
                >
                  <div
                    className="flex items-center text-sm font-medium gap-3"
                    style={{ color: "#6B5B55" }}
                  >
                    {gradeAr}
                    <BookOpen size={16} />
                  </div>
                </div>
              </div>

              {!showEnglish && handleBookClick && <ExpandBookButton onClick={handleBookClick} />}
            </div>

            {showGrader && graderInfoAr && (
              <div className="mt-3 text-[13px] text-black text-start" lang="ar">
                {gradedByLabel(true)}{graderInfoAr.name}
                {graderInfoAr.descriptor && (
                  <div className="text-black text-[13px] mt-0.5">
                    {graderInfoAr.descriptor}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}