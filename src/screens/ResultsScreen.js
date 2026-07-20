'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from '@/component/Header';
import HadithCard from '@/component/HadithCard';
import BottomPopupMenu from '@/component/BottomPopupMenu';
import LanguageMenu from '@/component/LanguageMenu';
import HadithCollectionMenu from '@/component/HadithCollectionMenu';
import { AnimatePresence } from 'framer-motion';
import DetailView from '@/component/DetailView';
import MenuModal from '@/component/MenuModal';
import { useSearchHadiths } from '@/hooks/useData';
import HadithSlider from '@/component/HadithSlider';
import { compilerFor, gradeFor, gradeToDb, compilerToDb } from '@/lib/i18n';
import { useLanguage } from '@/lib/LanguageContext';
import MatchedReferenceChips from '@/component/MatchedReferenceChips';
import AyatChips from '@/component/AyatChips';
import { useOpenReference } from '@/hooks/useOpenReference';

export default function ResultsScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // 'en' => bilingual cards; 'ar' => Arabic-only
  const { language, isArabic } = useLanguage();

  const [showBottomMenu, setShowBottomMenu] = useState(false);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [showHadithCollectionMenu, setShowHadithCollectionMenu] = useState(false);
  const [isDetailView, setIsDetailView] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isHashModalVisible, setIsHashModalVisible] = useState(false);
  const [selectedHadith, setSelectedHadith] = useState(null);

  // Track which card has its inline panels expanded (only one at a time on mobile)
  const [expandedId, setExpandedId] = useState(null);
  const handleToggleExpand = (id) => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  const searchText = searchParams.get('search') || '';
  let selectedTags = [];
  let selectedScholars = [];
  try {
    selectedTags = JSON.parse(searchParams.get('tags')) || [];
  } catch { }
  try {
    selectedScholars = JSON.parse(searchParams.get('scholars')) || [];
  } catch { }

  // English keys from the URL → Arabic values for the database.
  // The URL keeps carrying English; only the outgoing API call gets Arabic.
  const grades    = selectedTags.map(gradeToDb).filter(Boolean);
  const compilers = selectedScholars.map(compilerToDb).filter(Boolean);

  const { data, loading, error } = useSearchHadiths(searchText, compilers, grades);

  const hadiths = data && data.success && Array.isArray(data.data) ? data.data : [];

  const handleEditClick = () => {
    router.push(`/`);
  };

  const hasAnyQuery = !!(searchText || grades.length || compilers.length);

  return (
    <div className="w-full min-h-screen bg-[#F6F4F1] pb-20 relative">
      <Header onEdit={handleEditClick} onMenu={() => setShowBottomMenu(true)} />
      <div className="mx-auto w-full max-w-sm md:max-w-full md:px-10">
        <div className="pt-6 mb-[28px] space-y-[28px]">
          {loading && <div className="text-center text-gray-500">{isArabic ? 'جارٍ التحميل...' : 'Loading...'}</div>}
          {error && <div className="text-center text-red-500">{error}</div>}
          {!loading && !error && hadiths.length === 0 && hasAnyQuery && (
            <div className="text-center text-gray-500">{isArabic ? 'لا توجد نتائج.' : 'No results found.'}</div>
          )}
          {!loading && !error && !hasAnyQuery && (
            <div className="text-center text-gray-500">
              {isArabic
                ? 'اكتب شيئًا في شريط البحث أعلاه، اختر عوامل التصفية، ثم اضغط Enter.'
                : 'Type something in the search bar above, pick filters, then press Enter.'}
            </div>
          )}

          {/* Mobile list view — inline expand below tapped card */}
          <div className="md:hidden space-y-4">
            {hadiths.map((hadith) => {
              const expanded = expandedId === hadith.hadith_id;
              return (
                <div key={hadith.hadith_id}>
                  {/* Mobile: English only by default; Arabic only when the
                      Arabic language is selected. We achieve this by only
                      passing the Arabic props when isArabic is true — otherwise
                      HadithCard has no Arabic data to show and renders English
                      alone. Desktop (below) keeps both languages. */}
                  <HadithCard
                    showEnglish={!isArabic}
                    narrator={hadith.english_narrator ? `${hadith.english_narrator} reported,` : ''}
                    content={hadith.hadith_text_english}
                    hadithId={`${compilerFor(hadith.compiler, 'en')} ${hadith.hadith_number}`}
                    grade={gradeFor(hadith.grade, 'en')}
                    finalGrader={hadith.final_grader}
                    narratorAr={isArabic ? hadith.arabic_intro_clause : undefined}
                    contentAr={isArabic ? hadith.hadith_text_arabic : undefined}
                    hadithIdAr={isArabic ? `${hadith.compiler} ${hadith.hadith_number}` : undefined}
                    gradeAr={isArabic ? hadith.grade : undefined}
                    hadithLinkId={hadith.hadith_id}
                    isExpanded={expanded}
                    onToggleExpand={() => handleToggleExpand(hadith.hadith_id)}
                  />
                  {expanded && <InlinePanels hadith={hadith} />}
                </div>
              );
            })}
          </div>

          {/* Desktop — stack ALL results vertically */}
          <div className="hidden md:block space-y-4">
            {hadiths.map((hadith) => {
              const expanded = expandedId === hadith.hadith_id;
              return (
                <div key={hadith.hadith_id}>
                  {/* Was onView -> setIsDetailView, which opened the old detail
                      modal. That path was dead, so the book icon did nothing.
                      Now it toggles the same inline Details/Reference/Ayat/
                      Commentary panels the mobile card and the compiler page use. */}
                  <HadithCard
                    showEnglish={!isArabic}
                    narrator={hadith.english_narrator ? `${hadith.english_narrator} reported,` : ''}
                    content={hadith.hadith_text_english}
                    hadithId={`${compilerFor(hadith.compiler, 'en')} ${hadith.hadith_number}`}
                    hadithLinkId={hadith.hadith_id}
                    grade={gradeFor(hadith.grade, 'en')}
                    finalGrader={hadith.final_grader}
                    narratorAr={hadith.arabic_intro_clause}
                    contentAr={hadith.hadith_text_arabic}
                    hadithIdAr={`${hadith.compiler} ${hadith.hadith_number}`}
                    gradeAr={hadith.grade}
                    isExpanded={expanded}
                    onToggleExpand={() => handleToggleExpand(hadith.hadith_id)}
                  />
                  {expanded && <InlinePanels hadith={hadith} />}
                </div>
              );
            })}
          </div>
        </div>
      </div>

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
            onAboutHadithClick={() => console.log('About Hadith clicked')}
            onAboutUsClick={() => console.log('About Us clicked')}
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

      {isDetailView && selectedHadith && (
        <div className='lg:hidden md:hiddem'>
          <DetailView hadith={selectedHadith} onClose={() => setIsDetailView(false)} />
        </div>
      )}

      {/* Floating book button removed from /results — search results page
          shouldn't expose the Books/Chapters drill-down menu. */}

      {isMenuOpen && (
        <div className="md:hidden">
          <MenuModal
            onClose={() => setIsMenuOpen(false)}
            onHashClick={() => {
              setIsMenuOpen(false);
              setIsHashModalVisible(true);
            }}
            compiler={compilers[0] || null}
            compilerLabel={selectedScholars[0] || null}
          />
        </div>
      )}
    </div>
  );
}

// ─── Inline panels rendered below an expanded card ────────────────────
// Two-column expand: Details + Ayat on the left, Reference + Commentary on the
// right — the same layout as HadithDetailBottomSheet and the detail page, so the
// three surfaces finally match. This used to be a tabbed view (Contents /
// Reference / Commentary / Ayat, one at a time), which is why the results page
// looked different from everywhere else.
function InlinePanels({ hadith }) {
  const { isArabic } = useLanguage();
  const openRef = useOpenReference();

  // English is the default, so the default label is the English name. Falls back
  // to stripped Arabic, then the raw column — better a name in the wrong
  // language than a blank row.
  const pick = (stripped, english, raw) =>
    (isArabic ? (stripped || raw) : (english || stripped || raw)) || '—';

  const book    = pick(hadith?.book_stripped,    hadith?.book_stripped_english,    hadith?.book);
  const chapter = pick(hadith?.chapter_stripped, hadith?.chapter_stripped_english, hadith?.chapter);
  const section = pick(hadith?.section_stripped, hadith?.section_stripped_english, hadith?.section);

  // Empty is empty. No 'None' literal — it would render the word into the panel
  // and, being truthy, defeat the empty-state check.
  const ayat         = hadith?.ayat || '';
  const commentary   = hadith?.commentary || '';
  const hadithNumber = hadith?.hadith_number || '';


  const rows = [
    { type: 'Book',    label: isArabic ? 'الكتاب' : 'Book',    value: book },
    { type: 'Chapter', label: isArabic ? 'الباب'  : 'Chapter', value: chapter },
    { type: 'Section', label: isArabic ? 'الفصل'  : 'Section', value: section },
    { type: 'Hadith',  label: isArabic ? 'الحديث' : 'Hadith',
      value: isArabic ? `الجامع الكامل ${hadithNumber}` : `al-Jami al-Kamil ${hadithNumber}` },
  ].filter((row) => row.type !== 'Section' || row.value !== '—');

  return (
    <div className="mt-4 mb-6 flex flex-col md:flex-row gap-6">

      {/* Details + Ayat */}
      <div className="w-full md:w-1/2">
        <PanelHeading isArabic={isArabic}>{isArabic ? 'التفاصيل' : 'Details'}</PanelHeading>
        <div dir={isArabic ? 'rtl' : 'ltr'} className="bg-white rounded-[5px] p-3">
          {rows.map((item, i) => (
            <div key={i} className="flex items-start py-0.5 mb-1 last:mb-0">
              <span className="w-4 h-4 flex items-start justify-center me-2 flex-shrink-0 mt-0.5">
                <RowIcon type={item.type} />
              </span>
              <span className="text-xs text-gray-400 me-4 w-[60px] mt-0.5">{item.label}</span>
              <div className="flex-1 text-xs text-black break-words">{item.value || '—'}</div>
            </div>
          ))}
        </div>

        <PanelHeading isArabic={isArabic}>{isArabic ? 'الآيات' : 'Ayat annotation'}</PanelHeading>
        <div dir={isArabic ? 'rtl' : 'ltr'} className="bg-white rounded-[5px] p-3">
          <div className={`text-xs leading-[18px] whitespace-pre-line text-start ${ayat ? 'text-black' : 'text-[#6B5B55]'}`}>
            {ayat
              ? <AyatChips ayat={ayat} />
              : (isArabic ? 'لا توجد آيات مرتبطة بهذا الحديث.' : 'No ayat annotations available for this hadith.')}
          </div>
        </div>
      </div>

      {/* Reference + Commentary */}
      <div className="w-full md:w-1/2">
        <PanelHeading isArabic={isArabic}>{isArabic ? 'المرجع' : 'Reference'}</PanelHeading>
        <div dir={isArabic ? 'rtl' : 'ltr'} className="bg-white rounded-[5px] p-3">
          <MatchedReferenceChips
            value={hadith?.matched_hadith}
            onSelect={openRef}
            emptyText={isArabic ? 'لا توجد مراجع خارجية لهذا الحديث.' : 'No external references available for this hadith.'}
          />
        </div>

        <PanelHeading isArabic={isArabic}>{isArabic ? 'الشرح' : 'Commentary'}</PanelHeading>
        <div dir={isArabic ? 'rtl' : 'ltr'} className="bg-white rounded-[5px] p-3 min-h-[80px]">
          {/* Commentary is Arabic in the DATA (commentary_1, no English form), so
              it carries its own dir regardless of UI language. */}
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
  );
}

// Heading above each white card. text-xs / font-medium, matching the detail page.
function PanelHeading({ children, isArabic }) {
  return (
    <div
      dir={isArabic ? 'rtl' : 'ltr'}
      className="text-black text-xs font-medium font-['Inter'] mt-6 first:mt-0 ms-2 mb-2 text-start"
    >
      {children}
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

function Row({ label, value }) {
  return (
    <div className="flex items-start py-2 gap-3">
      <span className="w-4 h-4 flex items-center justify-center flex-shrink-0 mt-1">
        <RowIcon type={label} />
      </span>
      <span className="text-sm w-[80px] flex-shrink-0 text-gray-400">{label}</span>
      <div className="flex-1 text-sm text-black">{value || '—'}</div>
    </div>
  );
}