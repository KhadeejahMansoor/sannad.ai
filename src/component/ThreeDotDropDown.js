'use client';
import { useState, useRef, useEffect } from 'react';

export default function ThreeDotDropdown() {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} className="relative flex justify-end pb-10 pr-4 z-50">
      {/* Always visible Three-Dot Button */}
      <div
        onClick={() => setShowDropdown((prev) => !prev)}
        className="w-6 h-6 flex items-center justify-center cursor-pointer "
      >
        <svg
        className="translate-x-[16px] mt-2"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M5 10C3.9 10 3 10.9 3 12C3 13.1 3.9 14 5 14C6.1 14 7 13.1 7 12C7 10.9 6.1 10 5 10ZM19 10C17.9 10 17 10.9 17 12C17 13.1 17.9 14 19 14C20.1 14 21 13.1 21 12C21 10.9 20.1 10 19 10ZM12 10C10.9 10 10 10.9 10 12C10 13.1 10.9 14 12 14C13.1 14 14 13.1 14 12C14 10.9 13.1 10 12 10Z"
            fill="black"
          />
        </svg>
      </div>

      {/* Dropdown Menu */}
      {showDropdown && (
        <div className="absolute top-7 right-0 w-40 bg-white rounded-lg shadow-lg flex flex-col py-1">
          {/* Share Option */}
          <div className="flex items-center gap-2 px-4 py-2 text-black text-xs hover:bg-gray-100 cursor-pointer">
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M10 8.48193C9.49333 8.48193 9.04 8.66265 8.69333 8.94578L3.94 6.44578C3.97333 6.30723 4 6.16867 4 6.0241C4 5.87952 3.97333 5.74096 3.94 5.60241L8.64 3.12651C9 3.42771 9.47333 3.61446 10 3.61446C11.1067 3.61446 12 2.80723 12 1.80723C12 0.807229 11.1067 0 10 0C8.89333 0 8 0.807229 8 1.80723C8 1.95181 8.02667 2.09036 8.06 2.22892L3.36 4.70482C3 4.40361 2.52667 4.21687 2 4.21687C0.893333 4.21687 0 5.0241 0 6.0241C0 7.0241 0.893333 7.83133 2 7.83133C2.52667 7.83133 3 7.64458 3.36 7.34337L8.10667 9.8494C8.07333 9.9759 8.05333 10.1084 8.05333 10.241C8.05333 11.2108 8.92667 12 10 12C11.0733 12 11.9467 11.2108 11.9467 10.241C11.9467 9.27108 11.0733 8.48193 10 8.48193Z"
                fill="black"
              />
            </svg>
            Share
          </div>

          {/* View in Arabic Option */}
          <div className="flex items-center gap-2 px-4 py-2 text-black text-xs hover:bg-gray-100 cursor-pointer whitespace-nowrap">
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M9.99967 3.33301C8.39967 3.33301 7.08301 4.64967 7.08301 6.24967C7.08301 7.02467 7.39967 7.73301 7.91634 8.25801C6.64134 9.09134 5.83301 10.5163 5.83301 12.083C5.83301 14.608 7.89134 16.6663 10.4163 16.6663C11.883 16.6663 13.333 16.283 14.583 15.5497L13.7497 14.108C12.733 14.6913 11.583 14.9997 10.4163 14.9997C8.79967 14.9997 7.49967 13.708 7.49967 12.083C7.4982 11.4412 7.70909 10.8168 8.09949 10.3074C8.48989 9.79788 9.03786 9.43186 9.65801 9.26634L13.9997 8.09967L13.5663 6.49134L9.85801 7.49967C9.23301 7.41634 8.74967 6.89967 8.74967 6.24967C8.74967 5.54967 9.29967 4.99967 9.99967 4.99967C10.2163 4.99967 10.4163 5.05801 10.6247 5.16634L11.458 3.72467C11.0163 3.46634 10.508 3.33301 9.99967 3.33301Z"
                fill="black"
              />
            </svg>
            View in Arabic
          </div>
        </div>
      )}
    </div>
  );
}
