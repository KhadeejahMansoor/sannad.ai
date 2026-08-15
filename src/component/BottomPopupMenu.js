'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { useRef, useState } from 'react';
import { FiBox } from 'react-icons/fi';
import { CiGlobe } from 'react-icons/ci';
import { RiBuilding2Line } from 'react-icons/ri';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import LanguageMenu from './LanguageMenu';
import { useLanguage } from '../lib/LanguageContext';
import { COMPILER_KEYS, compilerLabel } from '../lib/i18n';
import { compilerSlug } from '../lib/compilerSlug';

export default function BottomPopupMenu({
  onClose,
  onCollectionClick,
  onLanguageClick,
  onAboutHadithClick, // This might not be needed anymore
  onAboutUsClick,
}) {
  const popupRef = useRef();
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const router = useRouter();
  const { language, isArabic } = useLanguage();

  // NOTE: We do NOT use a document-level mousedown listener for outside clicks here.
  // Reason: on mobile, when a user taps a PopupItem tile (e.g. "Hadith collection"),
  // mousedown fires BEFORE click. The mousedown listener saw the tap as "outside
  // popupRef" (because popupRef may be attached to the hidden desktop <aside>) and
  // called onClose() — which unmounted the menu before the tile's onClick could fire.
  // Result: bottom sheet closed but the next screen never opened.
  //
  // Instead we rely on the overlay's onClick={onClose} below — tapping outside the
  // bottom sheet hits the overlay, which closes the menu. Tile taps don't hit the
  // overlay (they hit the tile), so they reach their onClick handlers cleanly.

  // ✅ FIXED: now takes the scholar name and passes it as a query param
  // so /desktopcompiler can read ?compiler=Tirmidhi (etc.) and load that
  // scholar's hadith. Previously this navigated to bare /desktopcompiler,
  // which always fell back to the default ("Azami").
  // `scholar` is the English key ('Ahmad'). It stays English in the URL —
  // HadithByCompiler translates it to Arabic on arrival. Only the LABEL changes
  // with the language.
  //
  // These render as real <Link> elements rather than <button onClick>, so the
  // browser owns the navigation: right-click > "Open link in new tab",
  // middle-click, and ctrl/cmd-click all work. A button has no href, so the
  // context menu has nothing to offer.
  // Each collection has its own address now (/Bukhari, /IbnMajah). This used
  // to point at /desktopcompiler?compiler=Bukhari, which still resolves — but
  // by redirect, so the reader saw the old page load and then jump.
  const compilerHref = (scholar) => `/${encodeURIComponent(compilerSlug(scholar))}`;

  // About hadith lives on /grades. Declared once so the <Link href> and the
  // mobile handler can't drift apart.
  const ABOUT_HADITH_HREF = '/grades';

  const handleAboutHadithClick = () => {
    router.push(ABOUT_HADITH_HREF);
    onClose();
  };

  const handleLanguageClickMobile = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowLanguageMenu(true);
  };

  const handleLanguageMenuClose = () => {
    setShowLanguageMenu(false);
  };

  return (
    <>
      {/* Mobile LanguageMenu */}
      <AnimatePresence>
        {showLanguageMenu && (
          <div className="block md:hidden">
            <LanguageMenu onClose={handleLanguageMenuClose} />
          </div>
        )}
      </AnimatePresence>

      {/* Only show main popup if LanguageMenu is not showing */}
      {!showLanguageMenu && (
        <>
             {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40"
            style={{ backgroundColor: window.innerWidth >= 768 ? 'transparent' : '#05050599' }}
            onClick={onClose}
          />
          {/* ───── MOBILE: bottom sheet ───── */}
         <motion.div
  ref={popupRef}
  initial={{ y: '100%' }}
  animate={{ y: 0 }}
  exit={{ y: '100%' }}
  transition={{ duration: 0.3 }}
  className="md:hidden fixed bottom-0 left-0 right-0 z-50 w-full bg-[#F6F4F1] px-5 pt-4 pb-10 rounded-t-[22px]"
>
            {/* Grab handle */}
            <div className="mx-auto mb-5 h-[5px] w-10 rounded-full bg-[#DDD8D0]" />

            <div className="flex flex-col gap-[10px]">
              <PopupRow
                icon={<Image src="/bookIcon.svg" alt="" width={22} height={20} />}
                label="Hadith collections"
                onClick={onCollectionClick}
              />
              <PopupRow
                icon={<CiGlobe size={22} />}
                label="Language"
                onClick={handleLanguageClickMobile}
              />
              <PopupRow
                icon={<FiBox size={22} />}
                label="About hadith"
                href={ABOUT_HADITH_HREF}
                onClick={onClose}
              />
              <PopupRow
                icon={<RiBuilding2Line size={22} />}
                label="About us"
                onClick={onAboutUsClick}
              />
            </div>
          </motion.div>

          {/* ───── DESKTOP: right sidebar ───── */}
          <motion.aside
            ref={popupRef}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="hidden md:flex fixed right-0 top-0 z-50 h-screen w-60 flex-col bg-white shadow-lg overflow-y-auto"
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="self-end mt-4 mr-6 w-6 h-6 flex items-center justify-center text-black"
              aria-label="Close"
            >
              ✕
            </button>

            {/* Scholar list. Names come from COMPILER_KEYS in lib/i18n.js — the
                hardcoded array that used to sit here was the fifth copy of the
                same ten names in this codebase. */}
            <nav className="flex flex-col gap-2 px-5 mt-2 text-black text-base font-medium">
              {COMPILER_KEYS.map((key) => (
                <Link
                  key={key}
                  href={compilerHref(key)}
                  onClick={onClose}
                  dir={isArabic ? 'rtl' : 'ltr'}
                  lang={isArabic ? 'ar' : 'en'}
                  className={`px-2 py-1 rounded-[5px] no-underline text-black hover:bg-[#EDEDED] ${
                    isArabic ? 'text-right' : 'text-left'
                  }`}
                >
                  {compilerLabel(key, language)}
                </Link>
              ))}
            </nav>

            <div className="flex-1" />

            {/* Footer links */}
           <div className="flex flex-col gap-4 px-5 pb-12 text-sm font-medium text-stone-400 underline">
              {/* A <Link>, not a <button>, so the browser owns the navigation:
                  right-click > "Open link in new tab", middle-click and
                  ctrl/cmd-click all work. A button has no href, so the context
                  menu has nothing to offer — same reasoning as the compiler
                  list above. */}
              <Link
                href={ABOUT_HADITH_HREF}
                onClick={onClose}
                className="text-left text-stone-400"
              >
                About hadith
              </Link>
              <button className="text-left" onClick={onAboutUsClick}>
                About us
              </button>
             
            </div>
          </motion.aside>
        </>
      )}
    </>
  );
}

/* ───── PopupRow for Mobile (list-row design) ─────
   Renders as a <Link> when given an href and a <div> otherwise, so rows that
   go somewhere are real links (long-press > "Open in new tab") while rows that
   open a sheet — Language, Hadith collections — stay plain click targets. */
function PopupRow({ icon, label, onClick, href }) {
  const Wrapper = href ? Link : 'div';
  const wrapperProps = href ? { href } : {};

  return (
    <Wrapper
      {...wrapperProps}
      onClick={onClick}
      className={`flex items-center gap-3 bg-white rounded-[16px] border border-[#E4DCD6] px-[14px] py-[13px] cursor-pointer transition-colors hover:bg-[#FAF5F3] active:scale-[0.99] ${href ? 'no-underline' : ''}`}
    >
      <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-[12px] bg-[#ECEAE4] text-[#523230]">
        {icon}
      </div>
      <div className="flex-1 min-w-0 text-[14px] font-medium text-[#523230]">
        {label}
      </div>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="flex-shrink-0" aria-hidden="true">
        <path d="M9 6l6 6-6 6" stroke="#9A8A85" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </Wrapper>
  );
}

/* ───── PopupItem for Mobile (legacy grid tile, no longer used) ───── */
function PopupItem({ icon, label, onClick }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="w-full max-w-[120px] aspect-[6/5] flex flex-col items-center justify-center border border-gray-300 rounded-[5px] cursor-pointer transition"
      style={{
        backgroundColor: isHovered ? '#523230' : 'white',
        color: isHovered ? 'white' : '#000',
      }}
    >
      <div className={`mb-2 ${isHovered ? 'filter invert brightness-0' : ''}`}>{icon}</div>
      <div className="text-sm text-center font-medium px-2 leading-tight">{label}</div>
    </div>
  );
}