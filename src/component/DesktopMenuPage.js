'use client';
import { Search ,X} from 'lucide-react';
import { useState } from 'react';
import Header from '@/component/Header';
import { BookOpen } from "lucide-react";
import { Noto_Sans_Arabic } from "next/font/google";


export default function DesktopMenuPage() {
    const [showSearch, setShowSearch] = useState(false);

    
  const [searchText, setSearchText] = useState('');
  const [activeCategory, setActiveCategory] = useState(null);
  const [activeSubItem, setActiveSubItem] = useState(null);

  const categories = ['Faith', 'Salat', 'Wudu', 'Zakat', 'Fasting'];

  // Level 2 items for each category
  const subItems = {
    Faith: Array(4).fill("Regarding narrations of throne, its origin, and its place above water"),
    Salat: Array(4).fill("Regarding narrations of throne, its origin, and its place above water"),
    Wudu: Array(4).fill("Regarding narrations of throne, its origin, and its place above water"),
    Zakat: Array(4).fill("Regarding narrations of throne, its origin, and its place above water"),
    Fasting: Array(4).fill("Regarding narrations of throne, its origin, and its place above water"),
  };

  // Level 3 items for each sub-item
  const nestedItems = Array(3).fill("Regarding the throne");

  return (
    <div className="w-full min-h-screen bg-gray-100 pb-20 relative">
      <Header onEdit={() => console.log('Edit clicked')} onMenu={() => console.log('Menu clicked')} />

      <div className="flex w-full h-screen font-[Inter] min-h-screen bg-[#F6F4F1]">
        {/* Sidebar */}
        <div className="w-[280px] h-screen bg-[#F6F4F1] flex flex-col justify-between">
          <div className="p-4 overflow-y-auto mt-[42px]">
              <div className="flex gap-3 ">
            <div className="text-xl font-bold mb-4 gap-3">Bukhari</div>
          
      {/* Search Icon SVG
      <svg className="ml-5"  width="24" height="24" viewBox="0 0 24 24" fill="none"
        xmlns="http://www.w3.org/2000/svg">
        <rect width="24" height="24" fill="white" fillOpacity="0.01" />
        <path fillRule="evenodd" clipRule="evenodd"
          d="M15.9992 10.4002C15.9992 13.493 13.492 16.0002 10.3992 16.0002C7.30642 16.0002 4.79922 13.493 4.79922 10.4002C4.79922 7.3074 7.30642 4.8002 10.3992 4.8002C13.492 4.8002 15.9992 7.3074 15.9992 10.4002ZM14.8934 16.0256C13.6616 17.0111 12.0992 17.6002 10.3992 17.6002C6.42277 17.6002 3.19922 14.3766 3.19922 10.4002C3.19922 6.42375 6.42277 3.2002 10.3992 3.2002C14.3757 3.2002 17.5992 6.42375 17.5992 10.4002C17.5992 12.1002 17.0101 13.6626 16.0247 14.8943L20.565 19.4344C20.8773 19.7469 20.8773 20.2535 20.565 20.566C20.2525 20.8783 19.7459 20.8783 19.4335 20.566L14.8934 16.0256Z"
          fill="#523230" />
      </svg> */}

      {/* Close/Collapse Icon SVG */}
      <svg className="ml-32"  width="24" height="24" viewBox="0 0 24 24" fill="none"
        xmlns="http://www.w3.org/2000/svg">
        <path
          d="M12.0008 13.3998L7.10078 18.2998C6.91745 18.4831 6.68411 18.5748 6.40078 18.5748C6.11745 18.5748 5.88411 18.4831 5.70078 18.2998C5.51745 18.1165 5.42578 17.8831 5.42578 17.5998C5.42578 17.3165 5.51745 17.0831 5.70078 16.8998L10.6008 11.9998L5.70078 7.0998C5.51745 6.91647 5.42578 6.68314 5.42578 6.3998C5.42578 6.11647 5.51745 5.88314 5.70078 5.6998C5.88411 5.51647 6.11745 5.4248 6.40078 5.4248C6.68411 5.4248 6.91745 5.51647 7.10078 5.6998L12.0008 10.5998L16.9008 5.6998C17.0841 5.51647 17.3174 5.4248 17.6008 5.4248C17.8841 5.4248 18.1174 5.51647 18.3008 5.6998C18.4841 5.88314 18.5758 6.11647 18.5758 6.3998C18.5758 6.68314 18.4841 6.91647 18.3008 7.0998L13.4008 11.9998L18.3008 16.8998C18.4841 17.0831 18.5758 17.3165 18.5758 17.5998C18.5758 17.8831 18.4841 18.1165 18.3008 18.2998C18.1174 18.4831 17.8841 18.5748 17.6008 18.5748C17.3174 18.5748 17.0841 18.4831 16.9008 18.2998L12.0008 13.3998Z"
          fill="black" />
      </svg>
    </div>

            {/* Search Bar */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={17} />
              <input
                type="text"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="Search or enter hadith #..."
                className="pl-10 pr-3 w-[248px] h-[40px] bg-white rounded-[5px] border border-emerald-600 text-sm focus:outline-none"
              />
            </div>

          {/* Category List with Go button inside */}
<div className="w-61 h-[485px] bg-white rounded-[5px] overflow-y-auto px-4 py-4 font-['Inter']">
  {categories.map((cat, index) => (
  <div key={index} className="mb-[22px]">
    <div
      className="w-52 h-11 text-black text-base font-normal flex items-center cursor-pointer hover:bg-zinc-100 hover:rounded-[10px] px-2"
      onClick={() =>
        setActiveCategory(activeCategory === cat ? null : cat)
      }
    >
      {cat}
    </div>

    {/* Subitems */}
    {activeCategory === cat && subItems[cat] && (
      <div className="mb-[22px]">
        {subItems[cat].map((text, idx) => {
          const key = `${cat}-${idx}`;
          return (
            <div key={idx}>
              <div
                className="w-52 min-h-11 flex items-center text-base font-normal text-black cursor-pointer px-2 mb-[2px] hover:bg-zinc-100 hover:rounded-[10px] mt-5"
                onClick={() =>
                  setActiveSubItem(activeSubItem === key ? null : key)
                }
              >
                {text}
              </div>

              {/* Nested Level 3 */}
              {activeSubItem === key && (
                <div className="ml-4 mt-1">
                  {nestedItems.map((nested, nIdx) => (
                    <div
                      key={nIdx}
                      className="w-48 min-h-10 flex items-center text-sm font-normal text-black cursor-pointer px-2 mb-[2px] hover:bg-zinc-100 hover:rounded-[10px]"
                    >
                      {nested}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    )}
  </div>
))}


              {/* Bottom Button */}
              <div className="pt-4">
                <button className="w-full h-[47px] bg-[#523230] text-white text-sm py-[6px] rounded-[5px] mt-17">
                  Go
                </button>
              </div>
            </div>
          </div>
        </div>


     

    </div>
    </div>
  );
}
