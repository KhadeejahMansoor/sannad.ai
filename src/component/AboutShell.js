'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { AnimatePresence } from 'framer-motion';
import Header from './Header';
import BottomPopupMenu from './BottomPopupMenu';
import LanguageMenu from './LanguageMenu';
import HadithCollectionMenu from './HadithCollectionMenu';

/* ------------------------------------------------------------------ *
 * AboutShell
 * ------------------------------------------------------------------
 * Header, tab bar and the three popup menus — everything the Grades,
 * Timelines and Articles pages have in common.
 *
 * These three used to be one component switching on a `activeTab`
 * useState, which meant all three shared the single URL /timeline: a tab
 * couldn't be linked to, bookmarked, or reached with the back button.
 * They're separate routes now, and this holds what they share.
 *
 * The active tab is derived from the pathname rather than passed in, so
 * a page can't render with the wrong tab underlined.
 * ------------------------------------------------------------------ */

export const TABS = [
  { label: 'Grades', href: '/grades' },
  { label: 'Timelines', href: '/timelines' },
  { label: 'Articles', href: '/articles' },
];

export default function AboutShell({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [showBottomMenu, setShowBottomMenu] = useState(false);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [showHadithCollectionMenu, setShowHadithCollectionMenu] = useState(false);

  return (
    <div className="min-h-screen bg-[#F6F4F1] flex flex-col">
      <Header onEdit={() => router.push('/')} onMenu={() => setShowBottomMenu(true)} />

      {/* Real links, not buttons, so each tab can be opened in a new tab,
          copied, or bookmarked. */}
      <div className="flex gap-7 px-4 sm:px-8 mt-6 border-b border-[#E7E1DC]">
        {TABS.map(({ label, href }) => {
          const isActive = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              /* Explicit prefetch. Without it the tab fetched its route on
                 click, which showed as a blank beat before the new page
                 appeared — most visible on Timelines, whose content is
                 taller than the others. Prefetching pulls the payload while
                 the tab is merely in view, so the click swaps instantly. */
              prefetch
              className={`text-[15px] pb-3 -mb-px transition-colors no-underline ${
                isActive
                  ? 'text-[#1C1917] border-b-2 border-[#523230]'
                  : 'text-[#A8A29E] border-b-2 border-transparent hover:text-[#78716C]'
              }`}
            >
              {label}
            </Link>
          );
        })}
      </div>

      <div className="flex-1 px-4 sm:px-8 pb-16 pt-8">{children}</div>

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
}