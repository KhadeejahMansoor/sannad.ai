'use client';
import React, { useState } from 'react';

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

/* The Prophet ﷺ passed away in 632 CE. Clicking a name in the three eras
   below shows how long after that they died — a Companion who died in 634
   is two years after. The later eras are excluded: "1,388 years after the
   Prophet passed away" for a contemporary scholar is a true number but
   not a useful one, and the framing belongs to the generations close to him. */
const PROPHET_DEATH_YEAR = 632;
const ERAS_WITH_OFFSET = new Set([
  'Companions',
  'After the Companions',
  'Hadith compilers',
  'Classical scholars',
]);

function yearsAfterProphet(year) {
  const diff = year - PROPHET_DEATH_YEAR;
  if (diff === 0) return null;
  return `${diff} ${diff === 1 ? 'year' : 'years'} after the Prophet \uFDFA passed away`;
}

/* ------------------------------------------------------------------ *
 * Decade bands
 * ------------------------------------------------------------------
 * People are grouped under the decade they died in, and each band is
 * labelled. This replaces a proportional spine — a vertical rule with a
 * dot per person, positioned by year — which had two problems worth
 * recording: at true scale an era ran to 3000px so you scrolled past it,
 * and compressing it to fit meant a name could sit several years off its
 * real position.
 *
 * Bands sidestep both. A decade with nobody in it takes no vertical
 * space at all, clusters are visible as a matter of course (three deaths
 * in the 650s, one in the 640s), and every year is printed rather than
 * hidden behind a hover or a click.
 * ------------------------------------------------------------------ */
/* Band width is chosen per era rather than fixed at ten years. Decades
   suit Companions, where fourteen people fall inside eighty years — but
   Classical scholars spans 772 years, and at ten-year bands that came out
   as fourteen headers for sixteen people, which is a header per person
   and no grouping at all. The span is divided into roughly eight bands
   and rounded to a sensible unit. */
const BAND_UNITS = [10, 25, 50, 100, 250, 500];

function bandSize(people) {
  const years = people.map((p) => p.year);
  const span = Math.max(...years) - Math.min(...years);
  const target = span / 8;
  return BAND_UNITS.find((u) => u >= target) ?? BAND_UNITS[BAND_UNITS.length - 1];
}

function groupIntoBands(people) {
  const sorted = [...people].sort((a, b) => a.year - b.year);
  const size = bandSize(sorted);
  const bands = [];

  for (const person of sorted) {
    const start = Math.floor(person.year / size) * size;
    const last = bands[bands.length - 1];
    if (last && last.start === start) last.people.push(person);
    else bands.push({ start, size, people: [person] });
  }

  return bands;
}

/* Just the year the band opens on. Wider bands used to print their full
   span ("800–849"), which read as two separate numbers rather than one
   range. The start alone is enough to place the group, and every person
   carries their own year anyway. */
function bandLabel({ start, size }) {
  return size === 10 ? `${start}s` : `${start}`;
}

export default function EraTimeline() {
  const [activeCategory, setActiveCategory] = useState('Companions');
  /* A Set, not a single name: opening one offset used to close whichever
     was already open, so you could never compare two. Each name toggles
     on its own now. */
  const [openNames, setOpenNames] = useState(() => new Set());

  const config = TIMELINES[activeCategory];
  const bands = groupIntoBands(config.people);
  const showsOffset = ERAS_WITH_OFFSET.has(activeCategory);

  const handleCategoryClick = (name) => {
    setActiveCategory(name);
    setOpenNames(new Set());
  };

  return (
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


      <div className="flex-1 min-w-0">
        {bands.map((band) => (
          <div key={band.start} className="mb-6 last:mb-0">
            {/* Band header: label, then a rule running to the edge. */}
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xs tracking-wide text-[#A8A29E] tabular-nums">
                {bandLabel(band)}
              </span>
              <span className="flex-1 h-px bg-[#E2DBD6]" />
            </div>

            <div className="ps-1">
              {band.people.map((person) => (
                <div key={`${person.name}-${person.year}`} className="py-1.5">
                  {showsOffset ? (
                    <button
                      type="button"
                      aria-expanded={openNames.has(person.name)}
                      className="flex items-baseline gap-2 text-start cursor-pointer"
                      onClick={() =>
                        setOpenNames((prev) => {
                          const next = new Set(prev);
                          if (next.has(person.name)) next.delete(person.name);
                          else next.add(person.name);
                          return next;
                        })
                      }
                    >
                      <span className="text-[15px] text-[#1C1917]">
                        {person.name}
                      </span>
                      <span className="text-xs text-[#A8A29E] tabular-nums">
                        {person.year}
                      </span>
                    </button>
                  ) : (
                    <div className="flex items-baseline gap-2">
                      <span className="text-[15px] text-[#1C1917]">
                        {person.name}
                      </span>
                      <span className="text-xs text-[#A8A29E] tabular-nums">
                        {person.year}
                      </span>
                    </div>
                  )}

                  {/* The Prophet ﷺ himself has no offset to show — a zero
                      would read as an error rather than as "this is the
                      reference point". */}
                  {showsOffset &&
                    openNames.has(person.name) &&
                    yearsAfterProphet(person.year) && (
                      <div className="mt-0.5 text-xs text-[#7A4B2B]">
                        {yearsAfterProphet(person.year)}
                      </div>
                    )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}