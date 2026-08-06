'use client';
import React, { useState } from 'react';
import Header from './Header';
import { useRouter } from 'next/navigation';
import BottomPopupMenu from './BottomPopupMenu';
import { ReferenceProvider, Citation, ReferencesList } from './ReferenceSystem';
import LanguageMenu from './LanguageMenu';
import HadithCollectionMenu from './HadithCollectionMenu';
import ArticleVideo from './ArticleVideo';
import { AnimatePresence } from 'framer-motion';

/* ------------------------------------------------------------------ *
 * Timeline data
 * ------------------------------------------------------------------
 * Every person lives here, with a real year. The previous version kept
 * five people — Bukhari, Ibn Abu Shaybah, Tirmidhi, Ibn Hatim, Ibn
 * Qayyim, Muhammad Azami — out of these arrays entirely and rendered
 * them as hardcoded JSX blocks pinned under a neighbouring name, which
 * meant they had no year, sat in the wrong place on the axis, and
 * needed two parallel lookup tables to fake a position. They're normal
 * rows now.
 *
 * VERIFY THE YEARS MARKED /* new *\/ — they're the standard CE death
 * years but they were never in your data, so I supplied them.
 * ------------------------------------------------------------------ */

const TIMELINES = {
  Companions: {
    startYear: 632,
    people: [
      { year: 632, name: 'Prophet ﷺ' },
      { year: 634, name: 'Abu Bakr' },
      { year: 644, name: 'Umar' },
      { year: 651, name: 'Abdullah bin Masud' },
      { year: 656, name: 'Uthman' },
      { year: 661, name: 'Ali' },
      { year: 665, name: 'Zayd bin Thabit' },
      { year: 678, name: 'Abu Huraira & Ayesha' },
      { year: 680, name: 'Muawiyah & Hussein' },
      { year: 687, name: 'Abdullah bin Abbas' },
      { year: 692, name: 'Abdullah bin Zubair' },
      { year: 693, name: 'Abdullah bin Umar' },
      { year: 697, name: 'Jabir bin Abdullah' },
      { year: 712, name: 'Anas bin Malik' },
    ],
  },

  'After the Companions': {
    startYear: 702,
    people: [
      { year: 702, name: 'Abban bin Uthman bin Affan' },
      { year: 713, name: 'Urwah bin Zubayr' },
      { year: 715, name: 'Said bin Musayyib' },
      { year: 720, name: 'Umar bin Abdul-Aziz' },
      { year: 728, name: 'Hasan al-Basri' },
      { year: 742, name: 'Ibn Shibab al-Zuhri' },
      { year: 767, name: 'Abu Hanifa' },
      { year: 768, name: 'Ibn Ishaq' },
      { year: 778, name: 'Sufyan al-Thawri' },
    ],
  },

  'Hadith compilers': {
    startYear: 796,
    people: [
      { year: 796, name: 'Malik' },
      { year: 805, name: 'Shaybani' },
      { year: 848, name: 'Yahya bin Yahya' },
      { year: 849, name: 'Ibn Abu Shaybah' },
      { year: 855, name: 'Ahmad' },
      { year: 869, name: 'Darimi' },
      { year: 870, name: 'Bukhari' },
      { year: 875, name: 'Muslim' },
      { year: 887, name: 'Ibn Majah' },
      { year: 889, name: 'Abu Dawud' },
      { year: 890, name: 'Abu Hatim' },
      { year: 892, name: 'Tirmidhi' },
      { year: 905, name: 'Bazzar' },
      { year: 915, name: 'Nasai' },
      { year: 963, name: 'Ibn Khuzaymah' },
      { year: 965, name: 'Ibn Hibban' },
      { year: 971, name: 'Tabarani' },
      { year: 995, name: 'Daraqutni' },
      { year: 1003, name: 'Hakim' },
      { year: 1066, name: 'Bayhaqi' },
    ],
  },

  'Classical scholars': {
    startYear: 1064,
    people: [
      { year: 1064, name: 'Ibn Hazm' },
      { year: 1111, name: 'Ghazali' },
      { year: 1201, name: 'Ibn Jawzi' },
      { year: 1273, name: 'Ibn Qurtubi' },
      { year: 1277, name: 'Nawawi' },
      { year: 1328, name: 'Ibn Taymiyyah' },
      { year: 1341, name: 'Mizzi' },
      { year: 1348, name: 'Dhahabi' },
      { year: 1350, name: 'Ibn Qayyim' },
      { year: 1373, name: 'Ibn Kathir' },
      { year: 1393, name: 'Ibn Rajab' },
      { year: 1449, name: 'Ibn Hajjar' },
      { year: 1505, name: 'Suyuti' },
      { year: 1625, name: 'Ahmad Sirhindi' },
      { year: 1762, name: 'Shah Waliullah' },
      { year: 1836, name: 'Ibn Abidin' },
    ],
  },

  'Contemporary scholars': {
    startYear: 1943,
    people: [
      { year: 1943, name: 'Thanvi' },
      { year: 1958, name: 'Shakir' },
      { year: 1976, name: 'Shafii Usmani' },
      { year: 1979, name: 'Maududi' },
      { year: 1999, name: 'Albani' },
      { year: 1999, name: 'Abdul Hasan Ali Nadvi' },
      { year: 2001, name: 'Ibn Uthaymeen' },
      { year: 2006, name: 'Mubarakpuri' },
      { year: 2013, name: 'Zubair Ali Zai' },
      { year: 2016, name: 'Arnaut' },
      { year: 2017, name: 'Muhammad Sobhi Hullaq' },
      { year: 2017, name: 'Muhammad Azami' },
      { year: 2020, name: 'Ziya-ur-Rahman Azami' },
    ],
  },
};

const CATEGORIES = Object.keys(TIMELINES);

/* Axis geometry. AXIS_X is where the vertical rule sits inside the panel;
   years label to its left, names to its right. */
const AXIS_X = 8;
const NAME_X = AXIS_X + 26;
const NAME_LINE = 26;
const ROW_GAP = 30;

/* Even spacing, one row per year-group.
 *
 * This used to be a proportional axis: y = (year - startYear) * pxPerYear,
 * with decade ticks down the side. It was honest about elapsed time but
 * it made every era 1200–3100px tall, so you scrolled past the timeline
 * instead of seeing it. It also wasn't as honest as it looked — names
 * that collided had to be shoved down, up to ~6 years off true in the
 * dense eras.
 *
 * Rows are evenly spaced now, so each era fits one screen. Elapsed time
 * is no longer readable from the spacing; the exact year is on the name
 * instead, revealed on click. People who share a year still share a dot.
 */
function buildLayout(people) {
  const byYear = new Map();
  for (const p of [...people].sort((a, b) => a.year - b.year)) {
    if (!byYear.has(p.year)) byYear.set(p.year, []);
    byYear.get(p.year).push(p.name);
  }

  const groups = [];
  let y = 0;

  for (const [year, names] of byYear) {
    groups.push({ year, names, y });
    y += (names.length - 1) * NAME_LINE + ROW_GAP;
  }

  return { groups, height: y - ROW_GAP };
}

const Timeline = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('Timelines');
  const [activeCategory, setActiveCategory] = useState('Companions');
  const [openName, setOpenName] = useState(null);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [showBottomMenu, setShowBottomMenu] = useState(false);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [showHadithCollectionMenu, setShowHadithCollectionMenu] = useState(false);

  const config = TIMELINES[activeCategory];
  const { groups, height: spineHeight } = buildLayout(config.people);

  const handleCategoryClick = (name) => {
    setActiveCategory(name);
    setOpenName(null);
  };

  const handleEditClick = () => router.push('/');

  /* ---------------------------------------------------------------- *
   * The spine. One node per person, plus one dot per year-group.
   * ---------------------------------------------------------------- */
  const renderSpine = () => (
    <div className="relative" style={{ height: spineHeight + 48 }}>
      {/* vertical rule */}
      <div
        className="absolute top-0 bg-[#E2DBD6]"
        style={{ left: AXIS_X, width: 1, height: spineHeight + 8 }}
      />

      {/* people, grouped by year: one dot per year, names stacked under it */}
      {groups.map((group) => {
        const isFirst = group.year === config.startYear;

        return (
          <React.Fragment key={`group-${group.year}`}>
            <div
              aria-hidden="true"
              className="absolute rounded-full"
              style={{
                left: AXIS_X - (isFirst ? 5 : 4),
                top: group.y - (isFirst ? 5 : 4),
                width: isFirst ? 11 : 9,
                height: isFirst ? 11 : 9,
                backgroundColor: '#523230',
              }}
            />

            {group.names.map((name, i) => {
              const isOpen = openName === name;
              return (
                <button
                  key={name}
                  type="button"
                  aria-expanded={isOpen}
                  className="absolute text-[15px] text-[#1C1917] text-start cursor-pointer whitespace-nowrap"
                  style={{ left: NAME_X, top: group.y - 11 + i * NAME_LINE }}
                  onClick={() => setOpenName(isOpen ? null : name)}
                >
                  {name}
                  {/* Year appears only on click. The axis is approximate
                      where names bunch together, so this is the only place
                      an exact year of death is stated. */}
                  {isOpen && (
                    <span className="ms-2 text-[13px] text-[#7A4B2B]">d. {group.year}</span>
                  )}
                </button>
              );
            })}
          </React.Fragment>
        );
      })}
    </div>
  );

  /* ---------------------------------------------------------------- *
   * Articles — unchanged from the previous version.
   * ---------------------------------------------------------------- */
  const articlesData = [
    {
      id: 1,
      title: 'Breakdown of Hadith\ngrades in the Sunan\nbooks',
      description:
        'Classification of Hadith in Ibn Majah, Abu Dawood, Tirmidhi, Nasai, and Ahmad',
      date: 'JUNE 10, 2024',
      author: 'MOHAMMED ZAIN',
      videoId: 'QA9ckJYMXbQ',
      videoTitle: 'Surah Al-Ikhlas',
      content: {
        subtitle:
          'Classification of Hadiths in Ibn Majah, Abu Dawud, Tirmidhi, Nasai, and Ahmad',
        sections: [
          {
            title: 'Exercitationem ullam corporis suscipit',
            content:
              'Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur?',
          },
        ],
      },
    },
    ...Array(15)
      .fill(0)
      .map((_, index) => ({
        id: index + 2,
        title: 'Sed ut perspiciatis unde omnis iste natus error sit voluptatem',
        description: 'Eaque ipsa quae ab illo inventore veritatis et quasi',
        date: 'JUNE 10, 2024',
        author: 'MOHAMMED ZAIN',
        videoId: index % 3 === 0 ? 'QA9ckJYMXbQ' : null,
        videoTitle: index % 3 === 0 ? 'Surah Al-Ikhlas' : null,
        content: {
          subtitle: 'Sample article content',
          sections: [
            { title: 'Sample Section', content: 'This is sample content for the article.' },
          ],
        },
      })),
  ];

  return (
    <div className="min-h-screen bg-[#F6F4F1] flex flex-col">
      <Header onEdit={handleEditClick} onMenu={() => setShowBottomMenu(true)} />

      {/* Tabs. Pills replaced with a text underline — the filled grey
          pills were the heaviest element on an otherwise empty page. */}
      <div className="flex gap-7 px-4 sm:px-8 mt-6 border-b border-[#E7E1DC]">
        {['Timelines', 'Articles'].map((tab) => (
          <button
            key={tab}
            className={`text-[15px] pb-3 -mb-px transition-colors ${
              activeTab === tab
                ? 'text-[#1C1917] border-b-2 border-[#523230]'
                : 'text-[#A8A29E] border-b-2 border-transparent hover:text-[#78716C]'
            }`}
            onClick={() => {
              setActiveTab(tab);
              setSelectedArticle(null);
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="flex-1 px-4 sm:px-8 pb-16 pt-8">
        {activeTab === 'Timelines' && (
          <div className="md:flex md:gap-8 lg:gap-10">
            {/* Era nav. On mobile this is a horizontal scrolling row of
                chips rather than a stacked list — five stacked rows ate
                ~230px of a phone screen and pushed the timeline below
                the fold before it started. They wrap onto two or three
                lines rather than scrolling sideways, so every era stays
                visible at once. From md up it's the sidebar. */}
            <div className="w-full md:w-[190px] lg:w-[220px] flex-shrink-0 mb-6 md:mb-0">
              <div className="flex flex-row flex-wrap gap-2 md:flex-col md:flex-nowrap md:gap-0">
                {CATEGORIES.map((name) => {
                  const isActive = activeCategory === name;
                  return (
                    <button
                      key={name}
                      className={`whitespace-nowrap rounded-full border px-4 py-2 text-sm transition-colors
                        md:whitespace-normal md:text-start md:text-[15px] md:rounded-none md:border-0 md:border-s-2 md:px-0 md:ps-4 md:py-3 ${
                          isActive
                            ? 'bg-white border-[#523230] text-[#1C1917] md:bg-white md:border-[#523230]'
                            : 'bg-transparent border-[#E2DBD6] text-[#78716C] md:border-transparent md:hover:text-[#1C1917]'
                        }`}
                      onClick={() => handleCategoryClick(name)}
                    >
                      {name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Spine. No fixed height and no overflow-auto: the old panel
                scrolled inside the page's own scrollbar, so the view had
                two competing scroll contexts. */}
            <div className="flex-1 min-w-0">
              <div className="text-xs text-[#57534E] mb-6">Click a name for year of death</div>
              {renderSpine()}
            </div>
          </div>
        )}

        {activeTab === 'Articles' && !selectedArticle && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {articlesData.map((articleItem) => (
              <div
                key={articleItem.id}
                className="min-h-[176px] p-5 bg-white border border-[#E7E1DC] rounded-[8px] flex flex-col gap-4 cursor-pointer hover:border-[#CFC7C1] transition-colors"
                onClick={() => setSelectedArticle(articleItem)}
              >
                <div className="text-[#1C1917] text-base font-medium leading-tight">
                  {articleItem.title}
                </div>
                <div className="text-[#57534E] text-sm leading-snug">
                  {articleItem.description}
                </div>
                <div className="mt-auto text-[#A8A29E] text-xs">
                  {articleItem.date} — {articleItem.author}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'Articles' && selectedArticle && (
          <ReferenceProvider>
            <div className="flex justify-center">
              <div className="w-full max-w-[900px] bg-white border border-[#E7E1DC] rounded-[8px] p-6 sm:p-8 flex flex-col gap-5">
                <button
                  className="text-sm text-[#A8A29E] hover:text-[#1C1917] text-start"
                  onClick={() => setSelectedArticle(null)}
                >
                  ← Back to articles
                </button>

                <div className="text-[#1C1917] text-2xl font-medium leading-tight">
                  {selectedArticle.title.replace(/\n/g, ' ')}
                </div>

                <div className="text-[#78716C] text-base leading-normal -mt-2">
                  {selectedArticle.content.subtitle}
                </div>

                <div className="flex flex-col gap-1">
                  <div className="text-[#1C1917] text-sm font-medium uppercase">
                    {selectedArticle.author}
                  </div>
                  <div className="text-[#A8A29E] text-sm">{selectedArticle.date}</div>
                </div>

                {selectedArticle.videoId && (
                  <ArticleVideo
                    videoId={selectedArticle.videoId}
                    title={selectedArticle.videoTitle || 'Related Video'}
                  />
                )}

                <div className="text-[#1C1917] text-base leading-relaxed">
                  Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis
                  suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur
                  <Citation id="1">
                    Sahih al-Bukhari, Book 3, Hadith 134: &quot;The Book of Knowledge&quot;
                  </Citation>
                  .
                </div>

                <ReferencesList />
              </div>
            </div>
          </ReferenceProvider>
        )}
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
            onAboutHadithClick={() => {}}
            onAboutUsClick={() => {}}
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
};

export default Timeline;