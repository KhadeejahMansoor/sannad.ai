'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { useRef, useState } from 'react';
import { FiBox } from 'react-icons/fi';
import { CiGlobe } from 'react-icons/ci';
import { RiBuilding2Line } from 'react-icons/ri';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import LanguageMenu from './LanguageMenu';
import { useLanguage } from '../lib/LanguageContext';
import { COMPILER_KEYS, compilerLabel } from '../lib/i18n';

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
  const handleScholarClick = (scholar) => {
    // `scholar` is the English key ('Ahmad'). It stays English in the URL —
    // HadithByCompiler translates it to Arabic on arrival. Only the LABEL below
    // changes with the language.
    router.push(`/desktopcompiler?compiler=${encodeURIComponent(scholar)}`);
    onClose();
  };

  // ✅ NEW: Handle About Hadith click to navigate to Timeline
  const handleAboutHadithClick = () => {
    router.push('/timeline'); // Navigate to Timeline page
    onClose(); // Close the popup
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
  className="md:hidden fixed bottom-0 left-0 right-0 z-50 w-full bg-white px-8 pt-20 pb-16 rounded-t-[12px]"
>

            <div className="grid grid-cols-2 gap-x-8 gap-y-8 justify-items-center">
              <PopupItem
                icon={<Image src="/bookIcon.svg" alt="Hadith Icon" width={26} height={24} />}
                label="Hadith collections"
                onClick={onCollectionClick}
              />
              <PopupItem
                icon={<CiGlobe size={27} />}
                label="Language"
                onClick={handleLanguageClickMobile}
              />
              <PopupItem
                icon={<FiBox size={27} />}
                label="About hadith"
                onClick={handleAboutHadithClick}
              />
              <PopupItem
                icon={<RiBuilding2Line size={26} />}
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
                <button
                  key={key}
                  onClick={() => handleScholarClick(key)}
                  dir={isArabic ? 'rtl' : 'ltr'}
                  lang={isArabic ? 'ar' : 'en'}
                  className={`px-2 py-1 rounded-[5px] hover:bg-[#EDEDED] ${
                    isArabic ? 'text-right' : 'text-left'
                  }`}
                >
                  {compilerLabel(key, language)}
                </button>
              ))}
            </nav>

            <div className="flex-1" />

            {/* Footer links */}
           <div className="flex flex-col gap-4 px-5 pb-12 text-sm font-medium text-stone-400 underline">
              <button 
                className="text-left" 
                onClick={handleAboutHadithClick} // ✅ Updated to use new handler
              >
                About hadith
              </button>
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

/* ───── PopupItem for Mobile ───── */
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