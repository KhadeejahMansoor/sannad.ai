'use client';
import React, { useState } from 'react';
import Header from './Header';
import { useRouter } from 'next/navigation';
import BottomPopupMenu from "./BottomPopupMenu";
import { ReferenceProvider, Citation, ReferencesList } from './ReferenceSystem';
import LanguageMenu from "./LanguageMenu";
import HadithCollectionMenu from "./HadithCollectionMenu";
import ArticleVideo from "./ArticleVideo";
import { AnimatePresence } from 'framer-motion';


const Timeline = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('Timelines');
  const [showTimeline, setShowTimeline] = useState(false);
  const [activeCategory, setActiveCategory] = useState('');
  const [activeYear, setActiveYear] = useState(632);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [hoveredName, setHoveredName] = useState(null);
  const [clickedName, setClickedName] = useState(null);
  const [showBottomMenu, setShowBottomMenu] = useState(false);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [showHadithCollectionMenu, setShowHadithCollectionMenu] = useState(false);

  const formatTimelineNames = (text, isMobile = false) => {
    if (text === 'Abban bin Uthman bin Affan') {
      return <span>{text}</span>;
    }

    const parts = text.split('-');
    return (
      <div className={isMobile ? "flex flex-col items-start" : ""}>
        {parts.map((part, index) => (
          <React.Fragment key={index}>
            <span style={{ display: 'block' }}>{part}</span>
            {index < parts.length - 1 && (
              <span
                style={{
                  display: 'block',
                  textAlign: isMobile ? 'left' : 'center',
                  margin: isMobile ? '8px 0' : '16px 0',
                  marginLeft: isMobile ? '20px' : '0',
                  lineHeight: '1',
                  backgroundColor: 'transparent'
                }}
              >
                -
              </span>
            )}
          </React.Fragment>
        ))}
      </div>
    );
  };

  const sidebarCategories = [
    { name: 'Companions' },
    { name: 'After the Companions' },
    { name: 'Hadith compilers' },
    { name: 'Classical scholars' },
    { name: 'Contemporary scholars' }
  ];

  const companionsTimelineData = [
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
    { year: 697, name: 'Jabir bin Abdullah' },
    { year: 712, name: 'Anas bin Malik' }
  ];

  const afterCompanionsTimelineData = [
    { year: 702, name: 'Abban bin Uthman bin Affan' },
    { year: 713, name: 'Urwah bin Zubayr' },
     { year: 715, name: 'Said bin Musayyib' },
    { year: 720, name: 'Umar bin Abdul Aziz' },
    { year: 728, name: 'Hasan al Basri' },
    { year: 742, name: 'Ibn Shibab al Zuhri' },
    { year: 767, name: 'Abu Hanifa' },
    { year: 768, name: 'Ibn Ishaq' },
    { year: 778, name: 'Sufyan al Thawri' }
  ];

  const hadithCompilersTimelineData = [
    { year: 796, name: 'Malik' },
    { year: 805, name: 'Shaybani' },
    { year: 820, name: 'Shafii' },
    { year: 848, name: 'Yahya bin Yahya' },
   
    { year: 855, name: 'Ahmad' },
    { year: 869, name: 'Darimi' },
    { year: 875, name: 'Muslim' },
    { year: 889, name: 'Ibn Majah' },
    { year: 848, name: 'Abu Dawud' },
    { year: 905, name: 'Bazzar' },
    { year: 915, name: 'Nasai' },
    { year: 963, name: 'Ibn Khuzaymah' },
    { year: 965, name: 'Ibn Hibban' },
    { year: 971, name: 'Tabarani' },
    { year: 995, name: 'Daraqutni' },
    { year: 1003, name: 'Hakim' },
    { year: 1066, name: 'Bayhaqi' }
  ];

  const classicalScholarsTimelineData = [
    { year: 1064, name: 'Ibn Hazm' },
    { year: 1111, name: 'Ghazali' },
    { year: 1193, name: 'Salahadin' },
    { year: 1201, name: 'Ibn Jawzi' },
    { year: 1273, name: 'Ibn Qurtubi' },
    { year: 1277, name: 'Nawawi' },
    { year: 1328, name: 'Ibn Taymiyyah' },
    { year: 1341, name: 'Al Mizzi' },
    { year: 1348, name: 'Ad Dhahabi' },
    { year: 1373, name: 'Ibn Kathir' },
    { year: 1393, name: 'Ibn Rajab' },
    { year: 1449, name: 'Ibn Hajjar' },
    { year: 1505, name: 'Suyuti' },
    { year: 1625, name: 'Ahmad Sirhindi' },
     { year: 1762, name: 'Shah Waliullah' },
    { year: 1836, name: 'Ibn Abidin' },
  ];

  const contemporaryScholarsTimelineData = [
   
    { year: 1943, name: 'Thanvi' },
    { year: 1958, name: 'Shakir' },
    { year: 1976, name: 'Shafii Usmani' },
    { year: 1999, name: 'Ibn Baz and Albani' },
    { year: 1999, name: 'Abdul Hasan Ali Nadvi' },
    { year: 2001, name: 'Ibn Uthaymeen' },
    { year: 2006, name: 'Mubarakpuri' },
    { year: 2013, name: 'Zubair Ali Zai' },
    { year: 2016, name: 'Arnaut' },
    { year: 2017, name: 'Muhammad Sobhi Hullaq ' },
  //  { year: 2017, name: 'Muhammad Azami ' },
    { year: 2020, name: 'Ziya ur Rahman Azami ' },
  ];

  const getCurrentTimelineData = () => {
    switch (activeCategory) {
      case 'Companions':
        return companionsTimelineData;
      case 'After the Companions':
        return afterCompanionsTimelineData;
      case 'Hadith compilers':
        return hadithCompilersTimelineData;
      case 'Classical scholars':
        return classicalScholarsTimelineData;
      case 'Contemporary scholars':
        return contemporaryScholarsTimelineData;
      default:
        return [];
    }
  };

  const getTimelineParams = () => {
    switch (activeCategory) {
      case 'Companions':
        return {
          startYear: 632,
          endYear: 712,
          pxPerYear: 18,
          decadeInterval: 10,
          showCenturyMarkers: false
        };
      case 'After the Companions':
        return {
          startYear: 702,
          endYear: 778,
          pxPerYear: 14,
          decadeInterval: 20,
          showCenturyMarkers: false
        };
      case 'Hadith compilers':
        return {
          startYear: 796,
          endYear: 1100,
          pxPerYear: 9,
          decadeInterval: 150,
          showCenturyMarkers: false
        };
      case 'Classical scholars':
        return {
          startYear: 1064,
          endYear: 1700,
          pxPerYear: 6,
          decadeInterval: 350,
          showCenturyMarkers: false
        };
      case 'Contemporary scholars':
        return {
          startYear: 1943,
          endYear: 2100,
          pxPerYear: 18,
          decadeInterval: 50,
          showCenturyMarkers: false
        };
      default:
        return {
          startYear: 632,
          endYear: 712,
          pxPerYear: 14,
          decadeInterval: 10,
          showCenturyMarkers: false
        };
    }
  };

  const handleNameHover = (name) => {
    setHoveredName(name);
  };

  const handleNameLeave = () => {
    setHoveredName(null);
  };

  const handleNameClick = (name) => {
    if (clickedName === name) {
      setClickedName(null);
    } else {
      setClickedName(name);
    }
  };

  const articlesData = [
    {
      id: 1,
      title: "Breakdown of Hadith\ngrades in the Sunan\nbooks",
      description: "Classification of Hadith in Ibn Majah, Abu Dawood, Tirmidhi, Nasai, and Ahmad",
      date: "JUNE 10, 2024",
      author: "MOHAMMED ZAIN",
      videoId: "QA9ckJYMXbQ" , // Surah Ikhlas with English translation
      videoTitle: "Surah Al-Ikhlas ",
      content: {
        subtitle: "Classification of Hadiths in Ibn Majah, Abu Dawud, Tirmidhi, Nasai, and Ahmad",
        sections: [
          {
            title: "Exercitationem ullam corporis suscipit",
            content: "Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestae consequatur."
          }
        ]
      }
    },
    ...Array(15).fill(0).map((_, index) => ({
      id: index + 2,
      title: "Sed ut perspiciatis unde omnis iste natus error sit voluptatem",
      description: "Eaque ipsa quae ab illo inventore veritatis et quasi",
      date: "JUNE 10, 2024",
      author: "MOHAMMED ZAIN",
      videoId: index % 3 === 0 ? "QA9ckJYMXbQ"  : null, // Surah Ikhlas for some articles
      videoTitle: index % 3 === 0 ? "Surah Al-Ikhlas " : null,
      content: {
        subtitle: "Sample article content",
        sections: [
          {
            title: "Sample Section",
            content: "This is sample content for the article."
          }
        ]
      }
    }))
  ];

  const timelineParams = getTimelineParams();
  const timelineData = getCurrentTimelineData();

  const lastDataYear = timelineData.length > 0 ? Math.max(...timelineData.map(d => d.year)) : timelineParams.endYear;
  const totalYears = lastDataYear - timelineParams.startYear;

  const offsetTop = typeof window !== 'undefined' && window.innerWidth < 640 ? 24 : 40;

  const calculateTooltipHeight = () => {
    if (!clickedName) return 0;

    const clickedItemIndex = timelineData.findIndex(item => item.name === clickedName);

   const hardcodedNames = ['Ibn Abu Shaybah', 'Bukhari', 'Muhammad Azami', 'Muhammad Sobhi Hullaq', 'Zia ur Rahman', 'Abdullah bin Umar', 'Ibn Ishaq', 'Ahmad', 'Muslim', 'Ibn Qayyim', 'Ibn Hatim','Tirmidhi']
    const isHardcodedName = hardcodedNames.includes(clickedName);

    if (clickedItemIndex === -1 && !isHardcodedName) return 0;

    if (clickedName === 'Prophet ﷺ') return 0;

    const baseTooltipHeight = 138;  // Reduced from 200
  const additionalBuffer = 38;     // Reduced from 100
  const tooltipHeight = baseTooltipHeight + additionalBuffer;
  const marginBetweenTooltipAndNextItem = 18;  // Reduced from 50

    return tooltipHeight + marginBetweenTooltipAndNextItem;
  };

  const calculatePositionWithTooltip = (currentIndex, baseTop) => {
    if (!clickedName) return baseTop;

    const clickedItemIndex = timelineData.findIndex(item => item.name === clickedName);

    const getHardcodedNamePosition = (name) => {
      switch (name) {
case 'Ibn Abu Shaybah':
  const yahyaIndex = timelineData.findIndex(item => item.name === 'Yahya bin Yahya');
  return yahyaIndex !== -1 ? yahyaIndex : -1;
        case 'Bukhari':
          const darimiIndex = timelineData.findIndex(item => item.name === 'Darimi');
          return darimiIndex !== -1 ? darimiIndex : -1;
       case 'Muhammad Azami':
      const sobhiIndex = timelineData.findIndex(item => item.name === 'Muhammad Sobhi Hullaq ');
      return sobhiIndex !== -1 ? sobhiIndex : -1;
    case 'Muhammad Sobhi Hullaq':
      const arnautIndex = timelineData.findIndex(item => item.name === 'Arnaut');
      return arnautIndex !== -1 ? arnautIndex : -1;
        case 'Abdullah bin Umar':
          const zubairIndex = timelineData.findIndex(item => item.name === 'Abdullah bin Zubair');
          return zubairIndex !== -1 ? zubairIndex : -1;
        case 'Ibn Ishaq':
          const hanifaIndex = timelineData.findIndex(item => item.name === 'Abu Hanifa');
          return hanifaIndex !== -1 ? hanifaIndex : -1;
        case 'Ahmad':
          const yahyaIndexForAhmad = timelineData.findIndex(item => item.name === 'Yahya');
          return yahyaIndexForAhmad !== -1 ? yahyaIndexForAhmad : -1;
        case 'Muslim':
          const darimiIndexForMuslim = timelineData.findIndex(item => item.name === 'Darimi');
          return darimiIndexForMuslim !== -1 ? darimiIndexForMuslim : -1;
        case 'Zia ur Rahman':
          const arnautIndexForZia = timelineData.findIndex(item => item.name === 'Arnaut');
          return arnautIndexForZia !== -1 ? arnautIndexForZia : -1;
        case 'Ibn Qayyim':
          const dhahabiIndex = timelineData.findIndex(item => item.name === 'Ad Dhahabi');
          return dhahabiIndex !== -1 ? dhahabiIndex : -1;
          case 'Ibn Hatim':
  const ibnMajahIndex = timelineData.findIndex(item => item.name === 'Ibn Majah');
  return ibnMajahIndex !== -1 ? ibnMajahIndex : -1;
        default:
          case 'Tirmidhi':
  const ibnMajahIndexForTirmidhi = timelineData.findIndex(item => item.name === 'Ibn Majah');
  return ibnMajahIndexForTirmidhi !== -1 ? ibnMajahIndexForTirmidhi : -1;
          return -1;
      }
    };

    let effectiveClickedIndex = clickedItemIndex;

    if (clickedItemIndex === -1) {
     const hardcodedNames = ['Ibn Abu Shaybah', 'Bukhari', 'Muhammad Azami', 'Muhammad Sobhi Hullaq', 'Zia ur Rahman', 'Abdullah bin Umar', 'Ibn Ishaq', 'Ahmad', 'Muslim', 'Ibn Qayyim', 'Ibn Hatim','Tirmidhi'];
      if (hardcodedNames.includes(clickedName)) {
        effectiveClickedIndex = getHardcodedNamePosition(clickedName);
      }
    }

    if (effectiveClickedIndex === -1) return baseTop;

    const clickedYear = timelineData[effectiveClickedIndex].year;
    const clickedYearIndex = clickedYear - timelineParams.startYear;

    if (currentIndex > clickedYearIndex) {
      const tooltipHeight = calculateTooltipHeight();
      return baseTop + tooltipHeight;
    }

    return baseTop;
  };

  const getTooltipConnectorLine = () => {
    if (!clickedName) return null;

    const clickedItemIndex = timelineData.findIndex(item => item.name === clickedName);

    const getHardcodedNamePosition = (name) => {
      switch (name) {
        case 'Ibn Abu Shaybah':
          return timelineData.findIndex(item => item.name === 'Yahya bin Yahya');
        case 'Bukhari':
          return timelineData.findIndex(item => item.name === 'Darimi');
       case 'Muhammad Azami':
      return timelineData.findIndex(item => item.name === 'Muhammad Sobhi Hullaq ');
    case 'Muhammad Sobhi Hullaq':
      return timelineData.findIndex(item => item.name === 'Arnaut');
          return timelineData.findIndex(item => item.name === 'Arnaut');
        case 'Abdullah bin Umar':
          return timelineData.findIndex(item => item.name === 'Abdullah bin Zubair');
        case 'Ibn Ishaq':
          return timelineData.findIndex(item => item.name === 'Abu Hanifa');
        case 'Ahmad':
          return timelineData.findIndex(item => item.name === 'Yahya');
        case 'Muslim':
          return timelineData.findIndex(item => item.name === 'Darimi');
        case 'Zia ur Rahman':
          return timelineData.findIndex(item => item.name === 'Arnaut');
        case 'Ibn Qayyim':
          return timelineData.findIndex(item => item.name === 'Ad Dhahabi');
          case 'Ibn Hatim':
  return timelineData.findIndex(item => item.name === 'Ibn Majah');
  case 'Tirmidhi':
  return timelineData.findIndex(item => item.name === 'Ibn Majah');
        default:
          return -1;
      }
    };

    let effectiveClickedIndex = clickedItemIndex;

    if (clickedItemIndex === -1) {
     const hardcodedNames = ['Ibn Abu Shaybah', 'Bukhari', 'Muhammad Azami', 'Muhammad Sobhi Hullaq', 'Zia ur Rahman', 'Abdullah bin Umar', 'Ibn Ishaq', 'Ahmad', 'Muslim', 'Ibn Qayyim', 'Ibn Hatim','Tirmidhi'];
      if (hardcodedNames.includes(clickedName)) {
        effectiveClickedIndex = getHardcodedNamePosition(clickedName);
      }
    }

  if (effectiveClickedIndex === -1 || clickedName === 'Prophet ﷺ') return null;

    const clickedYear = timelineData[effectiveClickedIndex].year;
    const yearIndex = clickedYear - timelineParams.startYear;
    const tooltipHeight = calculateTooltipHeight();

    const tooltipOffset = 50;

  return {
    top: offsetTop + (yearIndex + 1) * timelineParams.pxPerYear + tooltipOffset,
    height: tooltipHeight - tooltipOffset
  };

  };

  const handleEditClick = () => {
    router.push(`/`);
  };
  const additionalTooltipHeight = calculateTooltipHeight();
  const contentHeight = totalYears * timelineParams.pxPerYear;
  const paddingAndOffset = offsetTop + 100;
  const dynamicTimelineHeight = contentHeight + paddingAndOffset + additionalTooltipHeight;

  const handleCategoryClick = (categoryName) => {
    if (activeCategory === categoryName && showTimeline) {
      setShowTimeline(false);
      setActiveCategory('');
      setClickedName(null);
    } else {
      setActiveCategory(categoryName);
      setClickedName(null);
      setShowTimeline(true);

      if (categoryName === 'Companions') {
        setActiveYear(632);
      } else if (categoryName === 'After the Companions') {
        setActiveYear(702);
      } else if (categoryName === 'Hadith compilers') {
        setActiveYear(796);
      } else if (categoryName === 'Classical scholars') {
        setActiveYear(1064);
      } else if (categoryName === 'Contemporary scholars') {
        setActiveYear(1943);
      }
    }
  };

  const handleTimelineTabClick = () => {
    setActiveTab('Timelines');
    setSelectedArticle(null);
  };

  const handleArticleClick = (article) => {
    setSelectedArticle(article);
  };

  const handleBackToArticles = () => {
    setSelectedArticle(null);
  };

  const renderTimelineContent = (isMobile = false) => {
    const leftOffset = isMobile ? 'left-16 sm:left-20' : 'left-20';
    const leftOffsetValue = isMobile ? (typeof window !== 'undefined' && window.innerWidth < 640 ? 'left-16' : 'left-20') : 'left-20';
    
    return (
      <>
        {/* Single continuous vertical line */}
        <div
          className={`absolute mt-4 ${leftOffset} w-0.5 bg-gray-300`}
          style={{
            top: offsetTop,
            height: totalYears * timelineParams.pxPerYear + additionalTooltipHeight
          }}
        />

        {/* Tooltip connector line */}
        {(() => {
          const connectorLine = getTooltipConnectorLine();
          if (!connectorLine) return null;
          return (
            <div
              className={`absolute ${leftOffset} w-0.5 bg-gray-300 z-10`}
              style={{
                top: connectorLine.top,
                height: connectorLine.height
              }}
            />
          );
        })()}

        {/* Timeline Events and Markers */}
        {Array.from({ length: totalYears + 1 }, (_, i) => {
          const year = timelineParams.startYear + i;
          const isMajor = timelineData.find(d => d.year === year);
          const isDecadeTick = year % timelineParams.decadeInterval === 0;
          const isCenturyTick = timelineParams.showCenturyMarkers && year % timelineParams.centuryInterval === 0;
          const baseTop = offsetTop + i * timelineParams.pxPerYear;
          const adjustedTop = calculatePositionWithTooltip(i, baseTop);

          return (
            <div
              key={year}
              className={`absolute ${leftOffset} flex items-center`}
              style={{ top: adjustedTop }}
            >
              {isMajor ? (
                <>
                  <div
                    className={`-mt-2 ${isMobile ? 'w-3 h-3 sm:w-4 sm:h-4 -ml-[5px] sm:-ml-[7px]' : 'w-4 h-4 -ml-[7px]'} rounded-full cursor-pointer transition-colors`}
                    style={{ backgroundColor: clickedName === isMajor.name ? '#523230' : (activeYear === year && !clickedName) ? '#523230' : '#9ca3af' }}
                    onClick={() => {
                      setActiveYear(year);
                      if (isMajor.name !== 'Prophet ﷺ') {
                        handleNameClick(isMajor.name);
                      } else {
                        setClickedName(clickedName === isMajor.name ? null : isMajor.name);
                      }
                    }}
                  />


                  {/* First person year labels */}
                  {((activeCategory === 'Companions' && year === 632) ||
                    (activeCategory === 'After the Companions' && year === 702) ||
                    (activeCategory === 'Hadith compilers' && year === 796) ||
                    (activeCategory === 'Classical scholars' && year === 1064) ||
                    (activeCategory === 'Contemporary scholars' && year === 1943)) && (
                      <div className={`${isMobile ? 'text-xs sm:text-sm -left-12 sm:-left-14' : 'text-sm -left-14'} font-medium text-gray-700 absolute w-8 text-right z-20 -mt-2 flex items-center justify-end h-4`}>
                        {year}
                      </div>
                    )}

                {/* Year labels */}
{clickedName === isMajor.name && 
 !isDecadeTick && 
 isMajor.name !== 'Prophet ﷺ' && 
 !(activeCategory === 'After the Companions' && year === 702) &&
 !(activeCategory === 'Hadith compilers' && year === 796) &&
 !(activeCategory === 'Classical scholars' && year === 1064) &&(
  <div className={`${isMobile ? 'text-[12px] sm:text-sm -left-12 sm:-left-14' : 'text-sm -left-14'} font-medium text-gray-700 absolute w-8 text-right z-20 -mt-1.5 flex items-center justify-end h-4`}>
    {year}
  </div>
)}

{(isDecadeTick || isCenturyTick) && !((activeCategory === 'Companions' && year === 632) || (activeCategory === 'After the Companions' && year === 702) || (activeCategory === 'Hadith compilers' && year === 820) || (activeCategory === 'Classical scholars' && year === 1064) || (activeCategory === 'Contemporary scholars' && year === 1762)) && (
  <div className={`${
    activeCategory === 'Contemporary scholars'
      ? (isMobile ? 'text-[12px] sm:text-base -left-14 sm:-left-12' : 'text-base -left-12')
      : (year === 680 || year === 720)
      ? (isMobile ? 'text-xs sm:text-sm -left-12 sm:-left-10' : 'text-sm -left-14')
      : (isMobile ? 'text-xs sm:text-sm -left-14 sm:-left-10' : 'text-sm -left-12')
  } -top-1 sm:top-0.4 font-medium text-gray-700 absolute w-8 text-right flex items-center justify-end h-4`}>
    {year}
  </div>
)}
                </>
              ) : (isDecadeTick || isCenturyTick || (activeCategory === 'Hadith compilers' && year === 800)) ? (
                <div className="flex items-center gap-2">
                  <div className={`${
  (year === 680 || year === 720) 
    ? (isMobile ? 'text-xs sm:text-sm -left-8 sm:-left-10' : 'text-sm -left-10')
    : (isMobile ? 'text-xs sm:text-sm -left-12 sm:-left-14' : 'text-sm -left-14')
} font-medium text-gray-700 absolute w-8 text-right flex items-center justify-end h-4`}>
  {year}
</div>
                  <div className="w-8 h-4 bg-white mb-1 -ml-[4px] flex items-center justify-start">
                    <div className="bg-gray-300 w-4 h-0.5 -translate-x-0.75" />
                  </div>
                 
                </div>
              ) : null}

              {/* Special year of death labels */}
              {activeCategory === 'Companions' && isMajor && year === 634 && clickedName === 'Abu Bakr' && (
                <div className={`text-[10px] font-light font-['Inter'] text-neutral-900 absolute ${isMobile ? '-left-17 sm:-left-24' : '-left-19'} top-4 w-20 text-center leading-none`}>
                  <div>Year of</div>
                  <div>death</div>
                </div>
              )}

              {activeCategory === 'Companions' && isMajor && year === 632 && clickedName !== 'Abu Bakr' && (
                <div className={`text-[10px] font-light font-['Inter'] text-neutral-900 absolute ${isMobile ? '-left-17 sm:-left-24' : '-left-19'} top-4 w-20 text-center leading-none`}>
                  <div>Year of</div>
                  <div>death</div>
                </div>
              )}
              {isMajor && (
  
  (activeCategory === 'After the Companions' && year === 702) ||
  (activeCategory === 'Hadith compilers' && year === 796) ||
  (activeCategory === 'Classical scholars' && year === 1064) ||
  (activeCategory === 'Contemporary scholars' && year === 1943)
) && (
  <div className={`text-[10px] font-light font-['Inter'] text-neutral-900 absolute ${isMobile ? '-left-17 sm:-left-24' : '-left-19'} top-4 w-20 text-center leading-none`}>
    <div>Year of</div>
    <div>death</div>
  </div>
)}

              {isMajor && (
                <>
                  {(() => {
                    const currentIndex = timelineData.findIndex(d => d.year === year);
                    const isHovered = hoveredName === isMajor.name;
                    const isClicked = clickedName === isMajor.name;

                    return (
                      <div className="relative">
                        {/* Name container */}
                        <div
                          className={`-mt-2 ${isMobile ? 'text-xs sm:text-sm' : 'text-sm'} font-normal ${isMajor.name === 'Abban bin Uthman bin Affan' ? 'max-w-[280px]' : 'max-w-[200px]'} cursor-pointer px-2 py-1 rounded transition-all duration-200 ${isMajor.name === 'Prophet ﷺ'
                            ? (isClicked ? 'bg-[#523230] text-white' : 'text-gray-900')
                            : (isHovered || isClicked
                              ? 'bg-[#523230] text-white'
                              : 'text-gray-900 hover:bg-[#523230] hover:text-white')
                            }`}
                          style={{
                            marginLeft: (() => {
                              if (isMobile) {
                                if (activeCategory === 'Companions' || activeCategory === 'After the Companions' || activeCategory === 'Classical scholars' || activeCategory === 'Hadith compilers' || activeCategory === 'Contemporary scholars') {
                                  return window.innerWidth < 640 ? '1rem' : '1.5rem';
                                }
                                if (activeCategory === 'Contemporary scholars') {
                                  const currentYear = timelineData[currentIndex].year;
                                  const currentName = timelineData[currentIndex].name;
                                  if (currentYear === 2016 || currentName === 'Muhammad Sobhi Hullaq') {
                                    return window.innerWidth < 640 ? '1rem' : '1.5rem';
                                  }
                                }
                                return currentIndex % 2 === 0 ? (window.innerWidth < 640 ? '2.5rem' : '3.5rem') : (window.innerWidth < 640 ? '1rem' : '1.5rem');
                              } else {
                                return '1.5rem';
                              }
                            })()
                          }}
                          onMouseEnter={() => handleNameHover(isMajor.name)}
                          onMouseLeave={handleNameLeave}
                          onClick={() => handleNameClick(isMajor.name)}
                        >
                          {formatTimelineNames(isMajor.name)}
                        </div>

                     {activeCategory === 'Hadith compilers' && isMajor.name === 'Yahya bin Yahya' && (
  <div
    className={`${isMobile ? 'text-xs sm:text-sm' : 'text-sm'} font-normal max-w-[200px] cursor-pointer px-2 rounded transition-all duration-200 ${hoveredName === 'Ibn Abu Shaybah' || clickedName === 'Ibn Abu Shaybah'
      ? 'bg-[#523230] text-white'
      : 'text-gray-900 hover:bg-[#523230] hover:text-white'
      }`}
    style={{ marginLeft: isMobile ? (typeof window !== 'undefined' && window.innerWidth < 640 ? '1rem' : '1.5rem') : '1.5rem' }}
    onMouseEnter={() => handleNameHover('Ibn Abu Shaybah')}
    onMouseLeave={handleNameLeave}
    onClick={() => handleNameClick('Ibn Abu Shaybah')}
  >
    Ibn Abu Shaybah
  </div>
)}
{/* Ibn Hatim - appears below Ibn Majah */}
{activeCategory === 'Hadith compilers' && isMajor.name === 'Ibn Majah' && (
  <div
    className={`${isMobile ? 'text-xs sm:text-sm' : 'text-sm'} font-normal max-w-[200px] cursor-pointer px-2 rounded transition-all duration-200 ${hoveredName === 'Ibn Hatim' || clickedName === 'Ibn Hatim'
      ? 'bg-[#523230] text-white'
      : 'text-gray-900 hover:bg-[#523230] hover:text-white'
      }`}
    style={{ marginLeft: isMobile ? (typeof window !== 'undefined' && window.innerWidth < 640 ? '1rem' : '1.5rem') : '1.5rem' }}
    onMouseEnter={() => handleNameHover('Ibn Hatim')}
    onMouseLeave={handleNameLeave}
    onClick={() => handleNameClick('Ibn Hatim')}
  >
    Ibn Hatim
  </div>
)}
{/* Tirmidhi - appears below Ibn Hatim */}
{activeCategory === 'Hadith compilers' && isMajor.name === 'Ibn Majah' && (
  <div
    className={`${isMobile ? 'text-xs sm:text-sm' : 'text-sm'} font-normal max-w-[200px] cursor-pointer px-2 rounded transition-all duration-200 ${hoveredName === 'Tirmidhi' || clickedName === 'Tirmidhi'
      ? 'bg-[#523230] text-white'
      : 'text-gray-900 hover:bg-[#523230] hover:text-white'
      }`}
    style={{ marginLeft: isMobile ? (typeof window !== 'undefined' && window.innerWidth < 640 ? '1rem' : '1.5rem') : '1.5rem' }}
    onMouseEnter={() => handleNameHover('Tirmidhi')}
    onMouseLeave={handleNameLeave}
    onClick={() => handleNameClick('Tirmidhi')}
  >
    Tirmidhi
  </div>
)}

                        {activeCategory === 'Hadith compilers' && isMajor.name === 'Darimi' && (
                          <div
                            className={`${isMobile ? 'text-xs sm:text-sm' : 'text-sm'} font-normal max-w-[200px] cursor-pointer px-2 rounded transition-all duration-200 ${hoveredName === 'Bukhari' || clickedName === 'Bukhari'
                              ? 'bg-[#523230] text-white'
                              : 'text-gray-900 hover:bg-[#523230] hover:text-white'
                              }`}
                            style={{ marginLeft: isMobile ? (typeof window !== 'undefined' && window.innerWidth < 640 ? '1rem' : '1.5rem') : '1.5rem' }}
                            onMouseEnter={() => handleNameHover('Bukhari')}
                            onMouseLeave={handleNameLeave}
                            onClick={() => handleNameClick('Bukhari')}
                          >
                            Bukhari
                          </div>
                        )}

                        {activeCategory === 'Classical scholars' && isMajor.name === 'Ad Dhahabi' && (
                          <div
                            className={`${isMobile ? 'text-xs sm:text-sm' : 'text-sm'} font-normal max-w-[200px] cursor-pointer px-2 rounded transition-all duration-200 ${hoveredName === 'Ibn Qayyim' || clickedName === 'Ibn Qayyim'
                              ? 'bg-[#523230] text-white'
                              : 'text-gray-900 hover:bg-[#523230] hover:text-white'
                              }`}
                            style={{ marginLeft: isMobile ? (typeof window !== 'undefined' && window.innerWidth < 640 ? '1rem' : '1.5rem') : '1.5rem' }}
                            onMouseEnter={() => handleNameHover('Ibn Qayyim')}
                            onMouseLeave={handleNameLeave}
                            onClick={() => handleNameClick('Ibn Qayyim')}
                          >
                            Ibn Qayyim
                          </div>
                        )}
                        {activeCategory === 'Contemporary scholars' && isMajor.name === 'Muhammad Sobhi Hullaq ' && (
  <div
    className={`${isMobile ? 'text-xs sm:text-sm' : 'text-sm'} font-normal max-w-[200px] cursor-pointer px-2 rounded transition-all duration-200 ${hoveredName === 'Muhammad Azami' || clickedName === 'Muhammad Azami'
      ? 'bg-[#523230] text-white'
      : 'text-gray-900 hover:bg-[#523230] hover:text-white'
      }`}
    style={{ marginLeft: isMobile ? (typeof window !== 'undefined' && window.innerWidth < 640 ? '1rem' : '1.5rem') : '1.5rem' }}
    onMouseEnter={() => handleNameHover('Muhammad Azami')}
    onMouseLeave={handleNameLeave}
    onClick={() => handleNameClick('Muhammad Azami')}
  >
    Muhammad Azami
  </div>
)}

         {/* Tooltips */}
{isClicked && isMajor.name !== 'Prophet ﷺ' && (
  <div className="bg-neutral-100 rounded-[5px] absolute top-full mt-2 p-3 z-20 min-h-[120px] w-[250px]" style={{ left: '13px' }}>
    <div className="text-black text-sm font-normal font-['Inter'] leading-relaxed">
      Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.
    </div>
  </div>
)}
                        {/* Ibn Abu Shaybah Tooltip */}
                     {/* Ibn Abu Shaybah Tooltip */}
{activeCategory === 'Hadith compilers' && isMajor.name === 'Yahya bin Yahya' && clickedName === 'Ibn Abu Shaybah' && (
  <div className="bg-neutral-100 rounded-[5px] absolute top-full mt-3 p-3 z-15 min-h-[120px] w-[250px]" style={{ left: '13px' }}>
    <div className="text-black text-sm font-normal font-['Inter'] leading-relaxed">
      Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.
    </div>
  </div>
)}

                        {/* Bukhari Tooltip */}
                        {activeCategory === 'Hadith compilers' && isMajor.name === 'Darimi' && clickedName === 'Bukhari' && (
                          <div className="bg-neutral-100 rounded-[5px] absolute top-full mt-3  p-3 z-15 min-h-[120px] w-[250px]" style={{ left: '13px' }}>
                            <div className="text-black text-sm font-normal font-['Inter'] leading-relaxed">
                              Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.
                            </div>
                          </div>
                        )}

                        {/* Ibn Qayyim Tooltip */}
                        {activeCategory === 'Classical scholars' && isMajor.name === 'Ad Dhahabi' && clickedName === 'Ibn Qayyim' && (
                          <div className="bg-neutral-100 rounded-[5px] absolute top-full mt-3 p-3 z-15 min-h-[120px] w-[250px]" style={{ left: '13px' }}>
                            <div className="text-black text-sm font-normal font-['Inter'] leading-relaxed">
                              Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.
                            </div>
                          </div>
                        )}
                        {/* Muhammad Azami Tooltip */}
{activeCategory === 'Contemporary scholars' && isMajor.name === 'Muhammad Sobhi Hullaq ' && clickedName === 'Muhammad Azami' && (
  <div className="bg-neutral-100 rounded-[5px] absolute top-full mt-3 p-3 z-15 min-h-[120px] w-[250px]" style={{ left: '13px' }}>
    <div className="text-black text-sm font-normal font-['Inter'] leading-relaxed">
      Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.
    </div>
  </div>

)}
{/* Ibn Hatim Tooltip */}
{activeCategory === 'Hadith compilers' && isMajor.name === 'Ibn Majah' && clickedName === 'Ibn Hatim' && (
  <div className="bg-neutral-100 rounded-[5px] absolute top-full mt-3 p-3 z-15 min-h-[120px] w-[250px]" style={{ left: '13px' }}>
    <div className="text-black text-sm font-normal font-['Inter'] leading-relaxed">
      Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.
    </div>
  </div>
)}
{/* Tirmidhi Tooltip */}
{activeCategory === 'Hadith compilers' && isMajor.name === 'Ibn Majah' && clickedName === 'Tirmidhi' && (
  <div className="bg-neutral-100 rounded-[5px] absolute top-full mt-3 p-3 z-15 min-h-[120px] w-[250px]" style={{ left: '13px' }}>
    <div className="text-black text-sm font-normal font-['Inter'] leading-relaxed">
      Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.
    </div>
  </div>
)}
                      </div>
                    );
                  })()}
                </>
              )}
            </div>
          );
        })}
      </>
    );
  };

  return (
    <div className="min-h-screen bg-[#F4F5FA] flex flex-col">
      <Header onEdit={handleEditClick} onMenu={() => setShowBottomMenu(true)} />

      {/* Tabs */}
      <div className="flex gap-2 sm:gap-3 px-3 sm:px-6 mt-4 sm:mt-6 mb-1 lg:mb-0">
        <button
          className={`w-[116px] h-9 sm:w-28 sm:h-9 rounded-[20px] flex items-center justify-center gap-1 sm:gap-1 transition-colors ${activeTab === 'Timelines' ? 'bg-white' : 'bg-[#EEEEEE]'}`}
          onClick={handleTimelineTabClick}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10.1661 8.66667C10.8107 8.66667 11.3327 9.18933 11.3327 9.83333V12.8333C11.3327 13.1428 11.2098 13.4395 10.991 13.6583C10.7722 13.8771 10.4755 14 10.1661 14H2.49941C2.18999 14 1.89325 13.8771 1.67445 13.6583C1.45566 13.4395 1.33274 13.1428 1.33274 12.8333V9.83333C1.33274 9.18933 1.85541 8.66667 2.49941 8.66667H10.1661ZM13.9994 9.93267V13.5C13.9994 13.6267 13.9512 13.7486 13.8648 13.8412C13.7783 13.9338 13.6599 13.99 13.5335 13.9987C13.4071 14.0073 13.2822 13.9677 13.1839 13.8877C13.0856 13.8078 13.0213 13.6935 13.0041 13.568L12.9994 13.5V9.94133C13.3281 10.0232 13.6722 10.0202 13.9994 9.93267ZM10.1661 9.66667H2.49941C2.45521 9.66667 2.41282 9.68423 2.38156 9.71548C2.3503 9.74674 2.33274 9.78913 2.33274 9.83333V12.8333C2.33274 12.9253 2.40741 13 2.49941 13H10.1661C10.2103 13 10.2527 12.9824 10.2839 12.9512C10.3152 12.9199 10.3327 12.8775 10.3327 12.8333V9.83333C10.3327 9.78913 10.3152 9.74674 10.2839 9.71548C10.2527 9.68423 10.2103 9.66667 10.1661 9.66667ZM13.4994 6.728C13.8368 6.728 14.1603 6.86201 14.3989 7.10056C14.6374 7.33911 14.7714 7.66265 14.7714 8C14.7714 8.33736 14.6374 8.66089 14.3989 8.89944C14.1603 9.13799 13.8368 9.272 13.4994 9.272C13.1621 9.272 12.8385 9.13799 12.6 8.89944C12.3614 8.66089 12.2274 8.33736 12.2274 8C12.2274 7.66265 12.3614 7.33911 12.6 7.10056C12.8385 6.86201 13.1621 6.728 13.4994 6.728ZM10.1634 2C10.8081 2 11.3301 2.52267 11.3301 3.16667V6.16667C11.3301 6.47609 11.2072 6.77283 10.9884 6.99163C10.7696 7.21042 10.4728 7.33333 10.1634 7.33333H2.49674C2.18733 7.33333 1.89058 7.21042 1.67179 6.99163C1.45299 6.77283 1.33008 6.47609 1.33008 6.16667V3.16667C1.3301 2.87377 1.4403 2.59159 1.63878 2.3762C1.83725 2.1608 2.10949 2.02793 2.40141 2.004L2.49674 2H10.1634ZM10.1634 3H2.49674L2.45874 3.00467C2.42218 3.01323 2.38959 3.03388 2.36623 3.06329C2.34288 3.09269 2.33014 3.12912 2.33008 3.16667V6.16667C2.33008 6.25867 2.40474 6.33333 2.49674 6.33333H10.1634C10.2076 6.33333 10.25 6.31577 10.2813 6.28452C10.3125 6.25326 10.3301 6.21087 10.3301 6.16667V3.16667C10.3301 3.12246 10.3125 3.08007 10.2813 3.04882C10.25 3.01756 10.2076 3 10.1634 3ZM13.4994 2C13.6204 1.99984 13.7372 2.04353 13.8284 2.12296C13.9196 2.20239 13.979 2.31218 13.9954 2.432L13.9994 2.5V6.06733C13.6722 5.97981 13.3281 5.97683 12.9994 6.05867V2.5C12.9994 2.36739 13.0521 2.24022 13.1459 2.14645C13.2396 2.05268 13.3668 2 13.4994 2Z" fill="currentColor" />
          </svg>
          <span className="text-sm sm:text-base font-normal font-['Inter'] text-black">Timelines</span>
        </button>

        <button
          className={`w-[116px] h-9 sm:w-28 sm:h-9 rounded-[20px] flex justify-center items-center gap-1 sm:gap-2 transition-colors ${activeTab === 'Articles' ? 'bg-white' : 'bg-[#EEEEEE]'}`}
          onClick={() => {
            setActiveTab('Articles');
            setSelectedArticle(null);
          }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M11.8867 1.5H4.11333C3.75667 1.5 3.46 1.5 3.21667 1.52C2.96333 1.54 2.726 1.58533 2.50133 1.7C2.1563 1.87578 1.87578 2.1563 1.7 2.50133C1.58533 2.726 1.54 2.96333 1.52 3.21667C1.5 3.46 1.5 3.75667 1.5 4.11333V14C1.5 14.1326 1.55268 14.2598 1.64645 14.3536C1.74021 14.4473 1.86739 14.5 2 14.5C2.13261 14.5 2.25979 14.4473 2.35355 14.3536C2.44732 14.2598 2.5 14.1326 2.5 14V4.13333C2.5 3.752 2.5 3.49533 2.51667 3.298C2.532 3.10667 2.56 3.01533 2.59067 2.95533C2.67061 2.79828 2.79828 2.67061 2.95533 2.59067C3.01533 2.56 3.10667 2.532 3.298 2.51667C3.49533 2.50067 3.75133 2.5 4.13333 2.5H11.8667C12.248 2.5 12.5047 2.5 12.7013 2.51667C12.8933 2.532 12.9847 2.56 13.0447 2.59067C13.202 2.67067 13.3293 2.798 13.4093 2.95533C13.44 3.01533 13.468 3.10667 13.4833 3.298C13.4993 3.49533 13.5 3.75133 13.5 4.13333V14C13.5 14.1326 13.5527 14.2598 13.6464 14.3536C13.7402 14.4473 13.8674 14.5 14 14.5C14.1326 14.5 14.2598 14.4473 14.3536 14.3536C14.4473 14.2598 14.5 14.1326 14.5 14V4.11333C14.5 3.75667 14.5 3.46 14.48 3.21667C14.46 2.96333 14.4147 2.726 14.3 2.50133C14.1246 2.1565 13.8445 1.87601 13.5 1.7C13.2747 1.58533 13.0373 1.54 12.784 1.52C12.5407 1.5 12.2433 1.5 11.8867 1.5Z" fill="currentColor" />
            <path d="M4.33398 4.99992C4.33398 4.82311 4.40422 4.65354 4.52925 4.52851C4.65427 4.40349 4.82384 4.33325 5.00065 4.33325H11.0007C11.1775 4.33325 11.347 4.40349 11.4721 4.52851C11.5971 4.65354 11.6673 4.82311 11.6673 4.99992C11.6673 5.17673 11.5971 5.3463 11.4721 5.47132C11.347 5.59635 11.1775 5.66659 11.0007 5.66659H5.00065C4.82384 5.66659 4.65427 5.59635 4.52925 5.47132C4.40422 5.3463 4.33398 5.17673 4.33398 4.99992Z" fill="currentColor" />
            <path fillRule="evenodd" clipRule="evenodd" d="M8.43937 6.67341C8.51603 6.66675 8.6047 6.66675 8.68603 6.66675H9.97937C10.0607 6.66675 10.1494 6.66675 10.226 6.67341C10.3127 6.68008 10.426 6.69741 10.5447 6.75741C10.7014 6.83741 10.8287 6.96475 10.9087 7.12208C10.9687 7.23941 10.986 7.35408 10.9934 7.44075C11 7.51675 10.9994 7.60541 10.9994 7.68675V8.48008C10.9994 8.56141 10.9994 8.65008 10.9927 8.72675C10.986 8.81341 10.9687 8.92675 10.9087 9.04541C10.8288 9.20212 10.7014 9.32954 10.5447 9.40942C10.4267 9.46941 10.312 9.48675 10.2254 9.49408C10.1494 9.50075 10.0607 9.50008 9.97937 9.50008H8.68603C8.6047 9.50008 8.51603 9.50008 8.43937 9.49341C8.32875 9.48605 8.22057 9.45754 8.1207 9.40942C7.96399 9.32954 7.83658 9.20212 7.7567 9.04541C7.70826 8.94538 7.67952 8.83697 7.67203 8.72608C7.66537 8.65008 7.66603 8.56141 7.66603 8.48008V7.68675C7.66603 7.60541 7.66603 7.51675 7.6727 7.44008C7.67937 7.35341 7.6967 7.24008 7.7567 7.12141C7.83675 6.96461 7.96441 6.83718 8.12137 6.75741C8.2387 6.69741 8.35337 6.68008 8.44003 6.67275M9.99937 7.66675H8.66603V8.50008H9.99937V7.66675Z" fill="currentColor" />
            <path d="M5.5 6.83325C5.36739 6.83325 5.24021 6.88593 5.14645 6.9797C5.05268 7.07347 5 7.20064 5 7.33325C5 7.46586 5.05268 7.59304 5.14645 7.68681C5.24021 7.78057 5.36739 7.83325 5.5 7.83325H6.5C6.63261 7.83325 6.75979 7.78057 6.85355 7.68681C6.94732 7.59304 7 7.46586 7 7.33325C7 7.20064 6.94732 7.07347 6.85355 6.9797C6.75979 6.88593 6.63261 6.83325 6.5 6.83325H5.5ZM5 8.83325C5 8.70064 5.05268 8.57347 5.14645 8.4797C5.24021 8.38593 5.36739 8.33325 5.5 8.33325H6.5C6.63261 8.33325 6.75979 8.38593 6.85355 8.4797C6.94732 8.57347 7 8.70064 7 8.83325C7 8.96586 6.94732 9.09304 6.85355 9.18681C6.75979 9.28057 6.63261 9.33325 6.5 9.33325H5.5C5.36739 9.33325 5.24021 9.28057 5.14645 9.18681C5.05268 9.09304 5 8.96586 5 8.83325ZM5.5 10.1666C5.36739 10.1666 5.24021 10.2193 5.14645 10.313C5.05268 10.4068 5 10.534 5 10.6666C5 10.7992 5.05268 10.9264 5.14645 11.0201C5.24021 11.1139 5.36739 11.1666 5.5 11.1666H10.5C10.6326 11.1666 10.7598 11.1139 10.8536 11.0201C10.9473 10.9264 11 10.7992 11 10.6666C11 10.534 10.9473 10.4068 10.8536 10.313C10.7598 10.2193 10.6326 10.1666 10.5 10.1666H5.5ZM5 12.3333C5 12.2006 5.05268 12.0735 5.14645 11.9797C5.24021 11.8859 5.36739 11.8333 5.5 11.8333H10.5C10.6326 11.8333 10.7598 11.8859 10.8536 11.9797C10.9473 12.0735 11 12.2006 11 12.3333C11 12.4659 10.9473 12.593 10.8536 12.6868C10.7598 12.7806 10.6326 12.8333 10.5 12.8333H5.5C5.36739 12.8333 5.24021 12.7806 5.14645 12.6868C5.05268 12.593 5 12.4659 5 12.3333Z" fill="currentColor" />
          </svg>
          <span className="text-sm sm:text-base font-normal font-['Inter'] text-black">Articles</span>
        </button>
      </div>

      {/* Main Content */}
      <div className={`flex-1 px-3 sm:px-6 pb-4 ${activeTab === 'Articles' ? 'mt-6' : 'mt-4 sm:mt-12'}`}>
        {activeTab === 'Timelines' && (
          <>
            {/* Desktop: Two-column layout, Mobile: Stacked layout */}
            <div className="w-full mb-6 lg:flex lg:gap-6">
              {/* Timeline Category Buttons - Left Sidebar */}
              <div className="w-full lg:w-[280px] flex-shrink-0 mb-6 lg:mb-0">
                <div className="flex flex-col gap-3">
                  {sidebarCategories.map((category, index) => {
                    const isActive = activeCategory === category.name;
                    return (
                      <div key={index} className="w-full">
                        <button
                         className="w-full h-11 lg:h-14 px-4 py-2 lg:px-6 lg:py-3 bg-white rounded-[5px] flex justify-between items-center hover:shadow-md transition-all duration-200 text-black"
                          onClick={() => handleCategoryClick(category.name)}
                        >
                         <span className="text-base sm:text-lg lg:text-xl font-medium font-['Inter']">
                            {category.name}
                          </span>
                          <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            className={`transform transition-transform lg:hidden ${isActive && showTimeline ? 'rotate-180' : ''}`}
                          >
                            <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </button>

                        {/* Mobile Timeline Display - appears below the clicked button */}
                        {isActive && showTimeline && (
                          <div
                            className="w-full bg-white rounded-[5px] p-4 sm:p-8 overflow-auto relative mt-3 lg:hidden"
                            style={{
                              height: `${Math.min(dynamicTimelineHeight, 800)}px`,
                              maxHeight: '85vh'
                            }}
                          >
                            {renderTimelineContent(true)}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Desktop Timeline Container - Right Side */}
              {showTimeline && activeCategory && (
                <div className="hidden lg:block flex-1">
                  <div
                    className="w-full bg-white rounded-[5px] p-8 overflow-auto relative"
                    style={{
                      height: `${Math.min(dynamicTimelineHeight, 800)}px`,
                      maxHeight: '85vh'
                    }}
                  >
                    {renderTimelineContent(false)}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
        {activeTab === 'Articles' && !selectedArticle && (
    <div className="w-full px-2 sm:px-0">
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {articlesData.map((articleItem, index) => (
        <div
          key={index}
          className="min-h-[176px] px-6 py-4 sm:p-4 sm:px-6 md:py-3 bg-white rounded-[5px] flex flex-col justify-start items-start gap-5 sm:gap-4 md:gap-3 cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => handleArticleClick(articleItem)}
        >
          <div className="self-stretch text-black text-lg sm:text-base font-medium font-['Inter'] leading-tight">
            {articleItem.title}
          </div>
          <div className="self-stretch text-black text-sm font-normal font-['Inter'] leading-tight">
            {articleItem.description}
          </div>
          <div className="self-stretch mt-auto">
            <span className="text-black/60 text-sm font-normal font-['Inter']">{articleItem.date} - </span>
            <span className="text-black/60 text-sm font-normal font-['Inter'] uppercase">{articleItem.author}</span>
          </div>
        </div>
      ))}
    </div>
  </div>
)}


        {/* Selected Article View with References and Video */}
        {activeTab === 'Articles' && selectedArticle && (
          <ReferenceProvider>
            <div className="flex justify-center">
              <div className="w-full max-w-[1600px] min-h-[400px] px-6 py-4 sm:p-6 bg-white rounded-[5px] flex flex-col justify-start items-start gap-4 sm:gap-6">
              {/* Article Title */}
{/* Desktop version - single line */}
<div className="hidden lg:block self-stretch text-left text-black text-2xl font-medium font-['Inter'] leading-tight">
  {selectedArticle.title.replace(/\n/g, ' ')}
</div>

{/* Mobile version - with line breaks */}
<div className="block lg:hidden self-stretch text-left text-black text-2xl font-medium font-['Inter'] leading-tight">
  {selectedArticle.title.split('\n').map((line, lineIndex) => (
    <div key={lineIndex}>{line}</div>
  ))}
</div>

                {/* Article Subtitle */}
                <div className="self-stretch text-left text-gray-600/60 text-sm sm:text-lg font-normal font-['Inter'] leading-normal -mt-2">
                  {selectedArticle.content.subtitle}
                </div>

                {/* Author and Date */}
                <div className="self-stretch flex flex-col gap-2">
                  <div className="text-left text-black text-sm sm:text-lg font-medium font-['Inter'] uppercase  ">
                    {selectedArticle.author}
                  </div>
                  <div className="text-left text-gray-600/60 text-sm sm:text-lg font-normal font-['Inter'] mb-7">
                    {selectedArticle.date}
                  </div>
                </div>

                {/* Video Component - Only show if article has a videoId */}
                {selectedArticle.videoId && (
                  <div className="self-stretch">
                    <ArticleVideo 
                      videoId={selectedArticle.videoId} 
                      title={selectedArticle.videoTitle || "Related Video"}
                    />
                  </div>
                )}

                {/* Content Sections */}
                <div className="self-stretch">
                  <div className="text-left text-black text-sm sm:text-lg font-normal font-['Inter'] leading-relaxed">
                    Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestae consequatur
                    <Citation id="1">
                      Sahih al-Bukhari, Book 3, Hadith 134: "The Book of Knowledge" - This hadith emphasizes the importance of seeking knowledge in Islamic tradition
                    </Citation>
                    .
                  </div>
                </div>

              <div className="self-stretch mt-2">
  {/* Desktop version - single line */}
  <div className="hidden lg:block text-left text-black text-lg font-medium font-['Inter'] leading-tight">
    Exercitationem ullam corporis suscipit
  </div>
  
  {/* Mobile version - two lines */}
  <div className="block lg:hidden text-left text-black text-lg font-medium font-['Inter'] leading-tight">
    <div>Exercitationem ullam corporis</div>
    <div>suscipit</div>
  </div>
</div>
                <div className="self-stretch">
                  <div className="text-left text-black text-sm sm:text-lg font-normal font-['Inter'] leading-relaxed">
                    Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil
                    <Citation id="2">
                      Ibn Majah, Sunan Ibn Majah, Introduction, Chapter 17: "Concerning Following the Sunnah of the Messenger of Allah"
                    </Citation>
                    .
                  </div>
                </div>

                {/* Bullet Points with References */}
                <div className="self-stretch mt-4 ml-4">
                  {selectedArticle.content.sections[0] && (
                    <>
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-2 h-2 bg-black rounded-full mt-2 flex-shrink-0"></div>
                        <div className="flex-1 text-left text-black text-sm sm:text-lg font-normal font-['Inter'] leading-relaxed">
                          Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis
                          <Citation id="3">
                            Abu Dawud, Sunan Abu Dawud, Book 25, Hadith 3641: "Book of General Behavior" - Reference to scholarly methodology in hadith compilation
                          </Citation>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-2 h-2 bg-black rounded-full mt-2 flex-shrink-0"></div>
                        <div className="flex-1 text-left text-black text-sm sm:text-lg font-normal font-['Inter'] leading-relaxed">
                          Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis
                          <Citation id="4">
                            Jami` at-Tirmidhi, Book 47, Hadith 3682: "Chapters on Virtues" - Discussion on the grading system used by classical scholars
                          </Citation>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-black rounded-full mt-2 flex-shrink-0"></div>
                        <div className="flex-1 text-left text-black text-sm sm:text-lg font-normal font-['Inter'] leading-relaxed">
                          Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis
                          <Citation id="5">
                            Sunan an-Nasa'i, Book 1, Chapter 6: "The Book of Purification" - Contains examples of different hadith classifications
                          </Citation>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* References List - displays all references at bottom */}
                <ReferencesList />
              </div>
            </div>
          </ReferenceProvider>
        )}
      </div>

      {/* Bottom Popup Menu with AnimatePresence */}
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

      {/* Language Menu with AnimatePresence */}
      <AnimatePresence>
        {showLanguageMenu && <LanguageMenu onClose={() => setShowLanguageMenu(false)} />}
      </AnimatePresence>

      {/* Hadith Collection Menu with AnimatePresence */}
      <AnimatePresence>
        {showHadithCollectionMenu && (
          <HadithCollectionMenu onClose={() => setShowHadithCollectionMenu(false)} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Timeline;