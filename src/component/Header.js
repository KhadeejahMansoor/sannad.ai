'use client';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { AnimatePresence } from 'framer-motion';
import FilterPopup from './FilterPopup';
import { useLanguages } from '@/hooks/useData';
import { useLanguage } from '../lib/LanguageContext';

export default function Header({ onEdit, onMenu }) {
  // The desktop language bar lives in THIS file — it is not <LanguageMenu>,
  // which is the mobile bottom-sheet. Both exist. This is the one the globe
  // button opens on desktop.
  const { language, setLanguage } = useLanguage();
  const { data: langRes } = useLanguages();
  // Only render languages that actually have text behind them. The other seven
  // still come back from /api/languages with enabled:false — they're just not
  // shown. Flip `enabled` there to true and they appear here automatically.
  const languages = (langRes?.data || []).filter(l => l.enabled);

  const [showLangBar, setShowLangBar] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedGrades, setSelectedGrades] = useState([]);
  const [selectedCompilers, setSelectedCompilers] = useState([]);
  const barRef = useRef(null);
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  // ─── Sync filter state FROM url on every navigation ──
  // Means the popup chips and search box reflect the URL state when arriving
  // at /results from anywhere (shared link, refresh, browser back).
  useEffect(() => {
    setSearchText(searchParams.get('search') || '');
    try {
      const tags = JSON.parse(searchParams.get('tags') || '[]');
      setSelectedGrades(Array.isArray(tags) ? tags : []);
    } catch {
      setSelectedGrades([]);
    }
    try {
      const scholars = JSON.parse(searchParams.get('scholars') || '[]');
      setSelectedCompilers(Array.isArray(scholars) ? scholars : []);
    } catch {
      setSelectedCompilers([]);
    }
  }, [searchParams]);

  // ─── Submit search → navigate to /results with all params ──
  const submitSearch = () => {
    const params = new URLSearchParams();
    if (searchText.trim()) params.set('search', searchText.trim());
    if (selectedGrades.length) params.set('tags', JSON.stringify(selectedGrades));
    if (selectedCompilers.length) params.set('scholars', JSON.stringify(selectedCompilers));
    router.push(`/results?${params.toString()}`);
    setShowFilter(false); // close popup on submit
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      submitSearch();
    }
  };

  // ─── Filter popup handlers ──
  const toggleGrade = (g) => {
    setSelectedGrades(prev => prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g]);
  };
  const toggleCompiler = (c) => {
    setSelectedCompilers(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]);
  };
  const clearFilters = () => {
    setSelectedGrades([]);
    setSelectedCompilers([]);
  };

  // Check if current page is timeline
  const isTimelinePage = pathname === '/timeline';


  /* close sidebar on outside click */
  useEffect(() => {
    function handle(e) {
      if (showLangBar && barRef.current && !barRef.current.contains(e.target)) {
        // Check if the clicked element is the world icon button or its children
        const worldButton = document.querySelector('[data-world-button]');
        if (worldButton && (worldButton.contains(e.target) || worldButton === e.target)) {
          return; // Don't close if clicking the world button
        }
        setShowLangBar(false);
      }
    }
    window.addEventListener('mousedown', handle);
    return () => window.removeEventListener('mousedown', handle);
  }, [showLangBar]);

  const activeFilterCount = selectedGrades.length + selectedCompilers.length;

  return (
    <>
      <header className="w-full bg-[#523230] sticky top-0 z-40">
        <div className="w-full px-4 py-3 md:px-12
         md:py-13 flex items-center justify-between">

         {/* Logo - Positioned to leftmost */}
          <div className="w-10 h-10 md:w-11 md:h-11 bg-[#F6F4F1] rounded-full flex items-center justify-center overflow-hidden">
            {/* Mobile - Original Image */}
            <Image
              src="/logo.svg"
              alt="Logo"
              width={28}
              height={28}
              className="object-cover md:hidden"
            />

            {/* Desktop - SVG Logo */}
            <svg
              width="41"
              height="41"
              viewBox="0 0 48 48"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="hidden md:block"
            >
              <circle cx="28" cy="28" r="22" fill="#F6F4F1"/>
               <g transform="translate(10, 6) scale(1.2)">
                <svg width="20" height="30" viewBox="0 0 20 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <linearGradient id="hdrFlame" x1="6" y1="12.4" x2="11" y2="24.9" gradientUnits="userSpaceOnUse">
                      <stop offset="0" stopColor="#FFFBE3" />
                      <stop offset="0.3" stopColor="#FFD758" />
                      <stop offset="0.55" stopColor="#FFF3C0" />
                      <stop offset="0.78" stopColor="#EFB63C" />
                      <stop offset="1" stopColor="#D89C2A" />
                    </linearGradient>
                  </defs>
                  <path d="M14.1587 25.8135V25.8954C14.1596 25.953 14.2032 26.0427 14.2573 26.0629C14.2619 26.0638 14.2659 26.0638 14.27 26.0638C14.2787 26.0638 14.2869 26.0624 14.2941 26.0592C14.3164 26.05 14.3314 26.0276 14.3332 25.9956C14.335 25.9599 14.3196 25.921 14.2941 25.8913C14.2796 25.8739 14.2619 25.8597 14.2423 25.851L14.1582 25.8135" fill="#F4E7D4"/>
                  <path fillRule="evenodd" clipRule="evenodd" d="M19.9999 5.85081V22.4755C19.9999 22.8154 19.7694 22.9912 19.4867 22.869L8.63995 18.172C8.35354 18.048 8.12305 17.6727 8.12305 17.3323V0.707651C8.12305 0.367672 8.35354 0.191047 8.63995 0.315051L19.4867 5.01207C19.7694 5.1347 19.9999 5.51037 19.9999 5.85081Z" fill="#523230"/>
                  <mask id="mask0_982_2648" style={{maskType:"luminance"}} maskUnits="userSpaceOnUse" x="8" y="0" width="12" height="23">
                    <path d="M19.9999 5.85081V22.4755C19.9999 22.8154 19.7694 22.9912 19.4867 22.869L8.63995 18.172C8.35354 18.048 8.12305 17.6727 8.12305 17.3323V0.707651C8.12305 0.367672 8.35354 0.191047 8.63995 0.315051L19.4867 5.01207C19.7694 5.1347 19.9999 5.51037 19.9999 5.85081Z" fill="white"/>
                  </mask>
                  <g mask="url(#mask0_982_2648)">
                    <path fillRule="evenodd" clipRule="evenodd" d="M8.33789 1.54297L18.3649 5.86523V28.0009L8.33789 23.6787V1.54297Z" fill="#3A2E2B"/>
                    <path fillRule="evenodd" clipRule="evenodd" d="M8.31479 0.0865433L8.29297 2.44626L8.50482 2.32272L8.48118 0.000976562L8.31479 0.0865433Z" fill="#412725"/>
                  </g>
                  <path fillRule="evenodd" clipRule="evenodd" d="M8.50012 0.391518V3.92629C8.50012 4.01918 8.43648 4.12031 8.35783 4.15279L2.81013 6.41642C2.72966 6.44937 2.66602 6.39995 2.66602 6.30706V2.77229C2.66602 2.6794 2.72966 2.57782 2.81013 2.54487L8.35783 0.281242C8.43693 0.249212 8.50012 0.29863 8.50012 0.391518Z" fill="#523230"/>
                  <mask id="mask1_982_2648" style={{maskType:"luminance"}} maskUnits="userSpaceOnUse" x="2" y="0" width="7" height="7">
                    <path d="M8.50012 0.391518V3.92629C8.50012 4.01918 8.43648 4.12031 8.35783 4.15279L2.81013 6.41642C2.72966 6.44937 2.66602 6.39995 2.66602 6.30706V2.77229C2.66602 2.6794 2.72966 2.57782 2.81013 2.54487L8.35783 0.281242C8.43693 0.249212 8.50012 0.29863 8.50012 0.391518Z" fill="white"/>
                  </mask>
                  <g mask="url(#mask1_982_2648)">
                    <path fillRule="evenodd" clipRule="evenodd" d="M0.136385 5.24294L11.2136 0.444336V22.4826L0 27.0519L0.136385 5.24294Z" fill="#3A2E2B"/>
                    <path fillRule="evenodd" clipRule="evenodd" d="M8.37086 0.0855668L8.32812 2.44483L8.83775 2.32128L8.70137 0L8.37086 0.0855668Z" fill="#3A2E2B"/>
                  </g>
                  <path fillRule="evenodd" clipRule="evenodd" d="M13.6172 7.45294L16.349 5.35449L18.0797 6.0674L14.9238 8.60145L13.6172 7.45294Z" fill="#3A2E2B"/>
                  <path fillRule="evenodd" clipRule="evenodd" d="M18.0815 6.31038L18.1534 22.2125C18.1534 22.267 18.1184 22.3352 18.0756 22.3603L14.631 24.386C14.5874 24.4116 14.5523 24.3846 14.5523 24.3302L14.4746 7.9755C14.4746 7.91876 14.5096 7.85195 14.5523 7.82679L18.0029 6.2541C18.0465 6.22847 18.0815 6.2541 18.0815 6.31038Z" fill="#C08A63"/>
                  <path fillRule="evenodd" clipRule="evenodd" d="M8.48087 1.96289L17.9847 6.02479C18.0169 6.03852 18.0178 6.08474 17.9856 6.09938L13.9208 7.95805L4.33203 3.86L8.48087 1.96289Z" fill="#F4E7D4"/>
                  <path fillRule="evenodd" clipRule="evenodd" d="M15.1606 8.56964V26.1671C15.1606 26.53 14.9183 26.7148 14.6205 26.5808L14.5823 26.5634L14.2946 26.4339L3.60014 21.6138L3.31237 21.4838L3.20462 21.4353C2.57225 21.1502 2.66045 21.2848 2.66045 20.5334V2.93551C2.66045 2.5731 2.90321 2.38824 3.20462 2.52414L14.6205 7.66959C14.9183 7.80366 15.1606 8.20724 15.1606 8.56964Z" fill="#523230"/>
                  <path fillRule="evenodd" clipRule="evenodd" d="M14.5835 9.05322V9.34287C14.5835 9.35065 14.5803 9.35522 14.5735 9.35202L3.32445 4.27659C3.32127 4.27521 3.31445 4.26606 3.31445 4.25828V3.96864C3.31445 3.96086 3.32127 3.95766 3.32445 3.95949L14.5735 9.03538C14.5803 9.03858 14.5835 9.0459 14.5835 9.05368" fill="#3A2E2B"/>
                  <path fillRule="evenodd" clipRule="evenodd" d="M14.5827 9.08692V26.1966L14.2949 26.0671V9.21688C14.2949 9.21184 14.3004 9.20406 14.3077 9.20086L14.5704 9.08235C14.5772 9.07915 14.5827 9.08235 14.5827 9.08692Z" fill="#3A2E2B"/>
                  <path fillRule="evenodd" clipRule="evenodd" d="M3.60071 4.12501V21.2933L3.22656 21.1244L3.31294 4.2545C3.31294 4.24947 3.3184 4.24169 3.32567 4.23849L3.58844 4.12043C3.59526 4.11723 3.60071 4.12043 3.60071 4.12501Z" fill="#3A2E2B"/>
                  <path d="M3.41018 21.0097V21.0779C3.41018 21.0998 3.41109 21.1223 3.40882 21.1438C3.40654 21.1639 3.41064 21.1854 3.42018 21.2037C3.43837 21.238 3.47383 21.2463 3.50656 21.2609L14.2337 26.0554C14.2469 26.0613 14.2596 26.0641 14.2715 26.0641C14.3065 26.0641 14.3324 26.0385 14.3346 25.9959C14.3378 25.9401 14.2969 25.8751 14.2437 25.8513L3.6093 21.098V21.1484C3.60885 21.1927 3.58112 21.2202 3.54338 21.2202C3.53247 21.2202 3.52111 21.2179 3.50929 21.2133C3.45473 21.1918 3.41018 21.1282 3.41064 21.071V21.0088" fill="#F4E7D4"/>
                  <path d="M3.59564 4.39062C3.55791 4.39062 3.53063 4.41808 3.52972 4.46246L3.41016 21.0098L3.51608 21.0569L3.60882 21.0981L3.72839 4.58464C3.72839 4.52744 3.68475 4.46429 3.63019 4.44279C3.61792 4.43821 3.60655 4.43592 3.59564 4.43592" fill="#F4E7D4"/>
                  <path d="M3.41061 21.0098V21.0715C3.41016 21.1287 3.45425 21.1923 3.50881 21.2138C3.52063 21.2184 3.53245 21.2207 3.5429 21.2207C3.58064 21.2207 3.60837 21.1933 3.60837 21.1489V21.0985L3.51608 21.0574L3.41016 21.0102" fill="#F4E7D4"/>
                  <mask id="mask2_982_2648" style={{maskType:"luminance"}} maskUnits="userSpaceOnUse" x="14" y="9" width="1" height="18">
                    <path d="M14.2944 26.0597C14.2871 26.063 14.2789 26.0643 14.2703 26.0643C14.2662 26.0643 14.2616 26.0643 14.2575 26.0634C14.2653 26.0662 14.273 26.0675 14.2803 26.0675C14.2853 26.0675 14.2903 26.0671 14.2948 26.0657V26.0597M14.1152 9.48909L14.1589 25.8145L14.243 25.852C14.2625 25.8607 14.2803 25.8749 14.2948 25.8923V9.58838L14.1152 9.48863" fill="white"/>
                  </mask>
                  <g mask="url(#mask2_982_2648)">
                    <path d="M14.2953 9.37012H14.1152V26.0671H14.2953V9.37012Z" fill="#EFE1CC"/>
                  </g>
                  <path d="M14.2954 9.58789V25.8913C14.3208 25.9211 14.3363 25.96 14.3345 25.9957C14.3331 26.0277 14.3181 26.0501 14.2954 26.0593V26.0652C14.3322 26.0561 14.3586 26.0126 14.3577 25.9687L14.314 9.59887L14.2949 9.58835" fill="#EFE1CC"/>
                  <path d="M3.58371 4.3799C3.54688 4.37899 3.53415 4.4101 3.53143 4.44396C3.52688 4.49933 3.61144 4.58261 3.6669 4.60869L14.1154 9.3231L14.2254 9.37206C14.2404 9.37892 14.255 9.38258 14.2681 9.38258C14.2886 9.38258 14.3059 9.3748 14.3181 9.36016L14.3204 9.25172C14.3045 9.2174 14.2759 9.18674 14.2422 9.17118L14.0263 9.07463L3.68327 4.40781C3.68327 4.40781 3.62826 4.38082 3.58325 4.3799" fill="#F4E7D4"/>
                  <path fillRule="evenodd" clipRule="evenodd" d="M5.95691 22.673V17.0732C5.95691 16.6577 6.53337 16.4536 6.53337 16.4536C6.53337 16.4536 5.86781 15.6327 5.88918 15.1807C6.0192 12.4238 8.35866 12.5249 8.35866 12.5249C8.35866 12.5249 10.6995 14.5332 10.8295 17.4072C10.8509 17.879 10.1853 18.0995 10.1853 18.0995C10.1853 18.0995 10.7618 18.823 10.7618 19.2384V24.8383L5.95737 22.6726H5.95691V22.673Z" fill="url(#hdrFlame)"/>
                  <mask id="mask3_982_2648" style={{maskType:"luminance"}} maskUnits="userSpaceOnUse" x="5" y="12" width="8" height="15">
                    <path d="M5.95691 22.673V17.0732C5.95691 16.6577 6.53337 16.4536 6.53337 16.4536C6.53337 16.4536 5.86781 15.6327 5.88918 15.1807C6.0192 12.4238 8.35866 12.5249 8.35866 12.5249C8.35866 12.5249 10.6995 14.5332 10.8295 17.4072C10.8509 17.879 10.1853 18.0995 10.1853 18.0995C10.1853 18.0995 10.7618 18.823 10.7618 19.2384V24.8405L5.95737 22.6726" fill="white"/>
                  </mask>
                  <g mask="url(#mask3_982_2648)">
                    <path fillRule="evenodd" clipRule="evenodd" d="M6.80457 23.4492V17.3616C6.80457 16.91 7.38103 16.6656 7.38103 16.6656C7.38103 16.6656 6.71546 15.7995 6.73683 15.3071C6.86685 12.3049 9.20632 12.3232 9.20632 12.3232C9.20632 12.3232 11.5471 14.4148 11.6772 17.5341C11.6985 18.0462 11.033 18.312 11.033 18.312C11.033 18.312 11.6094 19.0762 11.6094 19.5278V25.6154L6.80502 23.4497H6.80457V23.4492Z" fill="url(#hdrFlame)"/>
                  </g>
                  <path d="M14.0254 9.0752L14.2413 9.17174C14.2613 9.18089 14.28 9.196 14.295 9.21384C14.2968 9.20927 14.3013 9.20423 14.3068 9.20149C14.2995 9.19096 14.2891 9.18273 14.2768 9.17769L14.0254 9.0752Z" fill="#EFE1CC"/>
                  <path d="M14.3087 9.20117C14.3032 9.20346 14.2987 9.20895 14.2969 9.21353C14.3069 9.22542 14.3151 9.23824 14.3214 9.25196V9.24235C14.3214 9.22725 14.3169 9.21307 14.3087 9.20117Z" fill="#EFE1CC"/>
                  <path d="M14.2942 9.37793C14.2942 9.37793 14.2919 9.37885 14.291 9.37932C14.2924 9.38117 14.2933 9.38348 14.2942 9.38533V9.37793Z" fill="#EFE1CC"/>
                  <path d="M14.3181 9.3604C14.3117 9.36818 14.304 9.37367 14.2949 9.37779V9.38511C14.3063 9.40616 14.3131 9.42949 14.3136 9.45146V9.5988H14.314L14.3181 9.3604Z" fill="#EFE1CC"/>
                  <path d="M14.1152 9.32324V9.36992C14.1161 9.3539 14.1211 9.34017 14.1289 9.32919L14.1152 9.32324Z" fill="#EFE1CC"/>
                  <path d="M14.1289 9.3291C14.1211 9.33963 14.1166 9.35335 14.1152 9.36983V9.48834L14.2948 9.58809V9.38493C14.2948 9.38493 14.2925 9.38081 14.2916 9.37898C14.2844 9.38127 14.2766 9.38264 14.2684 9.38264C14.2553 9.38264 14.2407 9.37944 14.2257 9.37211L14.1293 9.3291" fill="#F4E7D4"/>
                  <path d="M14.2949 9.38477V9.58793L14.314 9.59845V9.45111C14.3136 9.42869 14.3067 9.40581 14.2949 9.38477Z" fill="#F4E7D4"/>
                  <path d="M14.0258 9.0752L14.1304 9.29483L14.115 9.3168V9.32366L14.1286 9.32961L14.225 9.37262C14.24 9.37948 14.2545 9.38314 14.2677 9.38314C14.2759 9.38314 14.2836 9.38177 14.2909 9.37948C14.2923 9.37948 14.2932 9.37857 14.2941 9.37811C14.3032 9.37445 14.3109 9.3685 14.3173 9.36072L14.3195 9.25228C14.3132 9.23855 14.305 9.22528 14.295 9.21384C14.28 9.196 14.2618 9.18135 14.2413 9.17174L14.0254 9.0752Z" fill="#F4E7D4"/>
                </svg>
              </g>
            </svg>
          </div>

          {/* Right side with search bar and buttons */}
          <div className="flex items-center gap-3 md:gap-14  " >
            {/* Desktop Search Bar - Hide on timeline page */}
            {!isTimelinePage && (
              <div className="hidden md:block relative">
              <div className="w-[307px] h-10 bg-white flex items-center px-3 border rounded-[5px] border-[#523230]">
                {/* Magnifying glass — clickable to submit */}
                <button
                  onClick={submitSearch}
                  aria-label="Search"
                  className="mr-2 inline-flex items-center justify-center hover:opacity-75 transition-opacity"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect width="16" height="16" fill="white" fillOpacity="0.01" />
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M10.6661 6.93379C10.6661 8.99566 8.99468 10.6671 6.93281 10.6671C4.87095 10.6671 3.19948 8.99566 3.19948 6.93379C3.19948 4.87192 4.87095 3.20046 6.93281 3.20046C8.99468 3.20046 10.6661 4.87192 10.6661 6.93379ZM9.92891 10.6841C9.10776 11.341 8.06616 11.7338 6.93281 11.7338C4.28185 11.7338 2.13281 9.58475 2.13281 6.93379C2.13281 4.28282 4.28185 2.13379 6.93281 2.13379C9.58378 2.13379 11.7328 4.28282 11.7328 6.93379C11.7328 8.06713 11.3401 9.10873 10.6831 9.92989L13.71 12.9566C13.9182 13.1649 13.9182 13.5026 13.71 13.711C13.5017 13.9192 13.164 13.9192 12.9556 13.711L9.92891 10.6841Z"
                      fill="#000714"
                      fillOpacity="0.623529"
                    />
                  </svg>
                </button>

                <input
                  type="text"
                  placeholder="Search here..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                  className="flex-grow outline-none text-sm text-black bg-transparent"
                />

                {/* Filter funnel — clickable button, opens FilterPopup */}
                <button
                  data-funnel-button
                  onClick={() => setShowFilter(p => !p)}
                  aria-label="Filter"
                  className={`ml-2 w-6 h-6 inline-flex items-center justify-center rounded transition-colors relative ${
                    activeFilterCount > 0 ? 'bg-[#EDE4E1]' : 'hover:bg-gray-100'
                  }`}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M14 2.66699V4.00033H13.3333L10 9.00033V14.667H6V9.00033L2.66667 4.00033H2V2.66699H14ZM4.26933 4.00033L7.33333 8.59633V13.3337H8.66667V8.59633L11.7307 4.00033H4.26933Z"
                      fill={activeFilterCount > 0 ? '#523230' : '#686868'}
                    />
                  </svg>
                </button>
              </div>

              <AnimatePresence>
                {showFilter && (
                  <FilterPopup
                    selectedGrades={selectedGrades}
                    selectedCompilers={selectedCompilers}
                    onToggleGrade={toggleGrade}
                    onToggleCompiler={toggleCompiler}
                    onClear={clearFilters}
                    onSubmit={submitSearch}
                    onClose={() => setShowFilter(false)}
                  />
                )}
              </AnimatePresence>
            </div>
            )}

            {/* Buttons */}
            <div className="flex gap-4 md:gap-3">
            {/* 🌐 World Icon (Desktop) | Edit (Mobile) */}
            <button
              data-world-button
              onClick={() => {
                // Desktop: Toggle language bar, Mobile: Call onEdit
                if (window.innerWidth >= 768) {
                  setShowLangBar((prev) => !prev);
                } else {
                  onEdit && onEdit();
                }
              }}
              className="w-9 h-9 md:w-10 md:h-10 bg-white rounded-md flex items-center justify-center cursor-pointer"
            >
              {/* World icon for desktop */}
              <svg width="21" height="21" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" className="hidden md:block">
                <path d="M1.43359 8.59938C1.43359 12.557 4.64171 15.7652 8.59938 15.7652C12.557 15.7652 15.7652 12.557 15.7652 8.59938C15.7652 4.64171 12.557 1.43359 8.59938 1.43359C4.64171 1.43359 1.43359 4.64171 1.43359 8.59938Z" stroke="black" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M9.31568 1.46973C9.31568 1.46973 11.4654 4.30021 11.4654 8.59968C11.4654 12.8991 9.31568 15.7296 9.31568 15.7296M7.88253 15.7296C7.88253 15.7296 5.73279 12.8991 5.73279 8.59968C5.73279 4.30021 7.88253 1.46973 7.88253 1.46973M1.88477 11.1077H15.3134M1.88477 6.09166H15.3134" stroke="black" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>

              {/* Edit for mobile */}
              <svg
                className="md:hidden"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M11.4286 5.14258H6.28571C5.67951 5.14258 5.09812 5.38339 4.66947 5.81205C4.24082 6.2407 4 6.82208 4 7.42829V17.714C4 18.3202 4.24082 18.9016 4.66947 19.3302C5.09812 19.7589 5.67951 19.9997 6.28571 19.9997H17.7143C18.3205 19.9997 18.9019 19.7589 19.3305 19.3302C19.7592 18.9016 20 18.3202 20 17.714V12.5711"
                  stroke="black"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M17.7141 6.28559L18.8033 7.42845M19.9999 3.96216C20.3051 4.27691 20.4741 4.69915 20.4705 5.13757C20.4669 5.576 20.2908 5.99537 19.9804 6.30502L11.9999 14.2856L8.57129 15.4284L9.71415 11.9999L17.6993 3.9473C17.9801 3.66465 18.3558 3.49608 18.7536 3.47413C19.1515 3.45218 19.5433 3.57841 19.8536 3.82845L19.9999 3.96216Z"
                  stroke="black"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            {/* Menu Button */}
            <button
              onClick={onMenu}
              className="w-9 h-9 md:w-10 md:h-10 bg-white rounded-md flex items-center justify-center cursor-pointer"
            >
              {/* Menu icon for desktop */}
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="hidden md:block">
                <path d="M4 18C3.71667 18 3.47934 17.904 3.288 17.712C3.09667 17.52 3.00067 17.2827 3 17C2.99934 16.7173 3.09534 16.48 3.288 16.288C3.48067 16.096 3.718 16 4 16H20C20.2833 16 20.521 16.096 20.713 16.288C20.905 16.48 21.0007 16.7173 21 17C20.9993 17.2827 20.9033 17.5203 20.712 17.713C20.5207 17.9057 20.2833 18.0013 20 18H4ZM4 13C3.71667 13 3.47934 12.904 3.288 12.712C3.09667 12.52 3.00067 12.2827 3 12C2.99934 11.7173 3.09534 11.48 3.288 11.288C3.48067 11.096 3.718 11 4 11H20C20.2833 11 20.521 11.096 20.713 11.288C20.905 11.48 21.0007 11.7173 21 12C20.9993 12.2827 20.9033 12.5203 20.712 12.713C20.5207 12.9057 20.2833 13.0013 20 13H4ZM4 8C3.71667 8 3.47934 7.904 3.288 7.712C3.09667 7.52 3.00067 7.28267 3 7C2.99934 6.71733 3.09534 6.48 3.288 6.288C3.48067 6.096 3.718 6 4 6H20C20.2833 6 20.521 6.096 20.713 6.288C20.905 6.48 21.0007 6.71733 21 7C20.9993 7.28267 20.9033 7.52033 20.712 7.713C20.5207 7.90567 20.2833 8.00133 20 8H4Z" fill="black"/>
              </svg>

              {/* Menu icon for mobile */}
              <svg
                className="md:hidden"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M4 18C3.71667 18 3.47934 17.904 3.288 17.712C3.09667 17.52 3.00067 17.2827 3 17C2.99934 16.7173 3.09534 16.48 3.288 16.288C3.48067 16.096 3.718 16 4 16H20C20.2833 16 20.521 16.096 20.713 16.288C20.905 16.48 21.0007 16.7173 21 17C20.9993 17.2827 20.9033 17.5203 20.712 17.713C20.5207 17.9057 20.2833 18.0013 20 18H4ZM4 13C3.71667 13 3.47934 12.904 3.288 12.712C3.09667 12.52 3.00067 12.2827 3 12C2.99934 11.7173 3.09534 11.48 3.288 11.288C3.48067 11.096 3.718 11 4 11H20C20.2833 11 20.521 11.096 20.713 11.288C20.905 11.48 21.0007 11.7173 21 12C20.9993 12.2827 20.9033 12.5203 20.712 12.713C20.5207 12.9057 20.2833 13.0013 20 13H4ZM4 8C3.71667 8 3.47934 7.904 3.288 7.712C3.09667 7.52 3.00067 7.28267 3 7C2.99934 6.71733 3.09534 6.48 3.288 6.288C3.48067 6.096 3.718 6 4 6H20C20.2833 6 20.521 6.096 20.713 6.288C20.905 6.48 21.0007 6.71733 21 7C20.9993 7.28267 20.9033 7.52033 20.712 7.713C20.5207 7.90567 20.2833 8.00133 20 8H4Z"
                  fill="black"
                />
              </svg>
            </button>
          </div>
          </div>
        </div>
      </header>

      {/* Language sidebar - only show on desktop */}
      {showLangBar && (
        <div
          ref={barRef}
          className="hidden md:block fixed right-[18px] top-[83px] z-50 w-40 max-h-96 bg-white shadow-lg overflow-y-auto rounded-[5px]"
        >
          <div className="flex flex-col gap-2 px-2 py-2">
            {/* Was: onClick={() => console.log('Selected language:', lang)}
                It logged to the console and closed the bar. That is why picking
                a language did nothing — it genuinely did nothing.

                Now it writes to the LanguageProvider, which every component
                reads. Only English and Arabic are `enabled`; the other seven
                have no translated text in the database, so they render as
                disabled rather than looking live and failing silently. */}
            {languages.map((lang) => {
              const active = language === lang.code;
              const disabled = !lang.enabled;
              return (
                <button
                  key={lang.code}
                  disabled={disabled}
                  aria-disabled={disabled}
                  title={disabled ? 'No translation available yet' : undefined}
                  className={`h-8 w-full rounded-[5px] flex items-center px-2 text-base font-medium font-['Inter'] transition-colors ${
                    disabled
                      ? 'text-gray-300 cursor-not-allowed'
                      : active
                        ? 'bg-[#523230] text-white'
                        : 'text-black hover:bg-gray-200'
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (disabled) return;
                    setLanguage(lang.code);
                    setShowLangBar(false);
                  }}
                >
                  {lang.native_name}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}