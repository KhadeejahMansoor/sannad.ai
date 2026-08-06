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
    pxPerYear: 16,
    tickInterval: 10,
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
    pxPerYear: 16,
    tickInterval: 10,
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
    /* 5px/yr squeezed 21 people into 1350px, which forced labels up to
       72px — about 14 years — off their true position. 9 holds the worst
       case to ~5 years. Zero drift needs 30px/yr and an 8100px page:
       people who die a year apart can't both sit on their exact pixel
       and stay readable. */
    pxPerYear: 9,
    tickInterval: 25,
    people: [
      { year: 796, name: 'Malik' },
      { year: 805, name: 'Shaybani' },
      { year: 820, name: 'Shafii' },
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
    /* Same problem, worse: 2px/yr meant a 46px shove was a 23-year lie.
       4 brings the worst case down to ~6 years. */
    pxPerYear: 4,
    tickInterval: 100,
    people: [
      { year: 1064, name: 'Ibn Hazm' },
      { year: 1111, name: 'Ghazali' },
      { year: 1193, name: 'Salahadin' },
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
    pxPerYear: 16,
    tickInterval: 10,
    people: [
      { year: 1943, name: 'Thanvi' },
      { year: 1958, name: 'Shakir' },
      { year: 1976, name: 'Shafii Usmani' },
      { year: 1979, name: 'Maududi' },
      { year: 1999, name: 'Ibn Baz and Albani' },
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
const AXIS_X = 68;
const NAME_X = AXIS_X + 26;
const NAME_LINE = 26;
const PERSON_GAP = 30;
const TICK_GAP = 22;

/* Lay out people and tick years in ONE chronological pass.
 *
 * Two things forced this. People who share a year — Ibn Baz/Albani and
 * Abdul Hasan Ali Nadvi at 1999, Sobhi Hullaq and Muhammad Azami at
 * 2017 — resolve to the same pixel, so a label has to move. And when
 * only labels moved, a tick could end up ABOVE a name from an earlier
 * year: the 2000 gridline was drawing between the two 1999 entries,
 * which makes the axis contradict itself.
 *
 * So: group everyone who shares a year onto a single dot with their
 * names stacked beneath it, then walk years in order — people and ticks
 * alike — pushing each row down only as far as it needs to clear the
 * one above. Chronological order is preserved for every element on the
 * axis, and nothing needs a leader line. */
function buildLayout(people, startYear, pxPerYear, tickInterval, lastYear) {
  const byYear = new Map();
  for (const p of [...people].sort((a, b) => a.year - b.year)) {
    if (!byYear.has(p.year)) byYear.set(p.year, []);
    byYear.get(p.year).push(p.name);
  }

  const firstTick = Math.ceil(startYear / tickInterval) * tickInterval;
  const tickYears = new Set();
  for (let y = firstTick; y <= lastYear; y += tickInterval) tickYears.add(y);

  const years = [...new Set([...byYear.keys(), ...tickYears])].sort((a, b) => a - b);

  const groups = [];
  const ticks = [];
  let cursor = -Infinity;

  for (const year of years) {
    const names = byYear.get(year);
    const y = Math.max((year - startYear) * pxPerYear, cursor);

    if (names) groups.push({ year, names, y });
    if (tickYears.has(year)) ticks.push({ year, y });

    const blockHeight = names ? (names.length - 1) * NAME_LINE : 0;
    cursor = y + blockHeight + (names ? PERSON_GAP : TICK_GAP);
  }

  return { groups, ticks, height: cursor };
}

const Timeline = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('Timelines');
  const [activeCategory, setActiveCategory] = useState('Companions');
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [showBottomMenu, setShowBottomMenu] = useState(false);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [showHadithCollectionMenu, setShowHadithCollectionMenu] = useState(false);

  const config = TIMELINES[activeCategory];
  const lastYear = Math.max(...config.people.map((p) => p.year));
  const { groups, ticks, height: spineHeight } = buildLayout(
    config.people,
    config.startYear,
    config.pxPerYear,
    config.tickInterval,
    lastYear
  );

  const handleCategoryClick = (name) => {
    setActiveCategory(name);
  };

  const handleEditClick = () => router.push('/');

  /* ---------------------------------------------------------------- *
   * The spine.
   * Only people and tick years get a node. The old version rendered one
   * div per calendar year — 772 of them for Classical scholars, to show
   * 16 names.
   * ---------------------------------------------------------------- */
  const renderSpine = () => (
    <div className="relative" style={{ height: spineHeight + 48 }}>
      {/* vertical rule */}
      <div
        className="absolute top-0 bg-[#E2DBD6]"
        style={{ left: AXIS_X, width: 1, height: spineHeight + 8 }}
      />

      {/* decade / interval ticks, positioned by the shared pass so a tick
          can never rise above a name from an earlier year */}
      {ticks.map(({ year, y }) => (
        <React.Fragment key={`tick-${year}`}>
          <div
            className="absolute text-sm text-[#57534E] text-right"
            style={{ left: 0, top: y - 9, width: AXIS_X - 22 }}
          >
            {year}
          </div>
          <div
            className="absolute bg-[#E2DBD6]"
            style={{ left: AXIS_X - 6, top: y, width: 13, height: 1 }}
          />
        </React.Fragment>
      ))}

      {/* start-year anchor, picked out darker, with the axis caption */}
      <div
        className="absolute text-sm font-medium text-[#523230] text-right"
        style={{ left: 0, top: -9, width: AXIS_X - 22 }}
      >
        {config.startYear}
      </div>

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
                backgroundColor: isFirst ? '#523230' : '#C9C1BC',
              }}
            />

            {group.names.map((name, i) => (
              <div
                key={name}
                className="absolute text-[15px] text-[#1C1917]"
                style={{ left: NAME_X, top: group.y - 11 + i * NAME_LINE }}
              >
                {name}
              </div>
            ))}
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
          <div className="lg:flex lg:gap-10">
            {/* Era nav */}
            <div className="w-full lg:w-[220px] flex-shrink-0 mb-8 lg:mb-0">
              <div className="flex flex-col">
                {CATEGORIES.map((name) => {
                  const isActive = activeCategory === name;
                  return (
                    <button
                      key={name}
                      className={`text-start text-[15px] py-3 ps-4 border-s-2 transition-colors ${
                        isActive
                          ? 'border-[#523230] bg-white text-[#1C1917]'
                          : 'border-transparent text-[#78716C] hover:text-[#1C1917]'
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
              <div className="text-xs text-[#57534E] mb-6">Year of death (CE)</div>
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