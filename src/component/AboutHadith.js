'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence } from 'framer-motion';
import Header from './Header';
import BottomPopupMenu from './BottomPopupMenu';
import LanguageMenu from './LanguageMenu';
import HadithCollectionMenu from './HadithCollectionMenu';
import HadithGradeTable from './HadithGradeTable';
import EraTimeline from './EraTimeline';

/* ------------------------------------------------------------------ *
 * About Hadith
 * ------------------------------------------------------------------
 * Currently one section: the grade breakdown across the collections.
 * Structured as a list of sections so more can be added without
 * reshaping the page — each is a heading, an optional lede, and a body.
 * ------------------------------------------------------------------ */

const AboutHadith = () => {
  const router = useRouter();
  const [showBottomMenu, setShowBottomMenu] = useState(false);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [showHadithCollectionMenu, setShowHadithCollectionMenu] = useState(false);

  return (
    <div className="min-h-screen bg-[#F6F4F1] flex flex-col">
      <Header onEdit={() => router.push('/')} onMenu={() => setShowBottomMenu(true)} />

      <div className="flex-1 px-4 sm:px-8 pt-10 pb-16">
        <div className="mx-auto w-full max-w-[900px]">
          <h1 className="text-[26px] sm:text-[30px] font-medium text-[#1C1917] leading-tight">
            About hadith
          </h1>

          <section className="mt-12">
            <h2 className="text-[18px] font-medium text-[#1C1917]">Grades by collection</h2>
            <p className="mt-2 mb-7 text-[15px] leading-relaxed text-[#57534E] max-w-[68ch]">
              Not every narration in a collection carries the same authority. The table below
              breaks each collection down by the grade its narrations were given, so the
              proportions can be compared directly rather than inferred from a total.
            </p>

            {/* Bordered card so the table reads as one object against the
                page, and so the horizontal scroll it needs on narrow
                screens is visibly contained rather than bleeding off the
                edge of the page. */}
            <div className="rounded-[10px] border border-[#E7E1DC] bg-white p-5 sm:p-7">
              <HadithGradeTable />
            </div>
          </section>

          <section className="mt-14">
            <h2 className="text-[18px] font-medium text-[#1C1917]">Who transmitted them</h2>
            <p className="mt-2 mb-7 text-[15px] leading-relaxed text-[#57534E] max-w-[68ch]">
              The collections above did not appear at once. Pick an era to see the figures who
              carried the material through it, ordered by year of death; click a name for the
              exact year.
            </p>

            {/* fillViewport={false} — on /timeline the spine stretches to
                the bottom of the window because it IS the page. Here it's
                one section among several, so it sizes to its own content
                instead of pushing everything below it off-screen. */}
            <EraTimeline fillViewport={false} />
          </section>
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
            onAboutHadithClick={() => setShowBottomMenu(false)}
            onAboutUsClick={() => setShowBottomMenu(false)}
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

export default AboutHadith;