'use client';
import React, { useState } from 'react';

const ArticleVideo = ({ videoId, title = "Related Video" }) => {
  const [isPlaying, setIsPlaying] = useState(false);

  // Extract video ID from YouTube URL if full URL is provided
  const getVideoId = (url) => {
    if (!url) return null;
    
    // If it's already just an ID, return it
    if (url.length === 11 && !url.includes('/') && !url.includes('?')) {
      return url;
    }
    
    // Extract from various YouTube URL formats
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const extractedVideoId = getVideoId(videoId);

  if (!extractedVideoId) {
    return null;
  }

  const thumbnailUrl = `https://img.youtube.com/vi/${extractedVideoId}/maxresdefault.jpg`;
  const embedUrl = `https://www.youtube.com/embed/${extractedVideoId}?autoplay=1&rel=0`;

  return (
    <div className="w-full my-6 sm:my-8">
      {/* Video Title */}
      {title && (
        <div className="text-left text-black text-base sm:text-lg font-medium font-['Inter'] mb-3 sm:mb-4">
          {title}
        </div>
      )}

      {/* Video Container */}
      <div className="relative w-full bg-black rounded-lg overflow-hidden shadow-lg" style={{ paddingBottom: '56.25%' }}>
        {!isPlaying ? (
          // Thumbnail with Play Button
          <div className="absolute inset-0 cursor-pointer group" onClick={() => setIsPlaying(true)}>
            {/* Thumbnail Image */}
            <img
              src={thumbnailUrl}
              alt={title || "Video thumbnail"}
              className="w-full h-full object-cover"
            />
            
            {/* Dark Overlay on Hover */}
            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-all duration-200" />
            
            {/* Play Button */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-red-600 rounded-full flex items-center justify-center group-hover:bg-red-700 transition-all duration-200 group-hover:scale-110 shadow-2xl">
                <svg 
                  className="w-8 h-8 sm:w-10 sm:h-10 text-white ml-1" 
                  fill="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>

            {/* YouTube Logo (optional) */}
            <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 opacity-80">
              <svg 
                className="w-12 h-8 sm:w-16 sm:h-10" 
                viewBox="0 0 159 110" 
                fill="none"
              >
                <path 
                  d="M154 17.5c-1.82-6.73-7.07-12-13.8-13.8C128.2 0 79 0 79 0S29.8 0 17.8 3.7C11.07 5.5 5.82 10.77 4 17.5 0 29.5 0 55 0 55s0 25.5 4 37.5c1.82 6.73 7.07 12 13.8 13.8C29.8 110 79 110 79 110s49.2 0 61.2-3.7c6.73-1.8 11.98-7.07 13.8-13.8 4-12 4-37.5 4-37.5s0-25.5-4-37.5z" 
                  fill="red"
                />
                <path 
                  d="M63.5 79l40.5-24-40.5-24v48z" 
                  fill="white"
                />
              </svg>
            </div>
          </div>
        ) : (
          // YouTube Iframe
          <iframe
            className="absolute inset-0 w-full h-full"
            src={embedUrl}
            title={title || "YouTube video player"}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        )}
      </div>

      {/* Video Caption/Description (optional) */}
      <div className="mt-2 sm:mt-3 text-left text-gray-600/80 text-xs sm:text-sm font-normal font-['Inter'] leading-relaxed">
        Click to watch the video related to this article
      </div>
    </div>
  );
};

export default ArticleVideo;