// src/component/HadithText.js
//
// Renders hadith text, replacing honorific placeholder tokens like [[r9]] with
// their logo image. Put the logo files in  public/honorifics/  named r0..r9
// (e.g. public/honorifics/r9.svg). Change the extension below if yours are PNG.
//
// Usage: replace  {content}  with  <HadithText text={content} />

'use client';

import React from 'react';

const EXT = 'svg'; // change to 'png' if your logos are PNGs

// Code -> the phrase it stands for (used as the image alt text / tooltip).
const HONORIFICS = {
  r0: 'عليه السلام',
  r1: 'رضي الله عنه',
  r2: 'رضي الله عنها',
  r3: 'رضي الله عنهم',
  r4: 'عز وجل',
  r5: 'تبارك وتعالى',
  r6: 'سبحانه وتعالى',
  r7: 'جل جلاله',
  r8: 'جل وعلا',
  r9: 'صلى الله عليه وسلم',
};

export default function HadithText({ text, className = '' }) {
  if (!text) return null;

  // Split on [[rN]], keeping the tokens so we can swap them for images.
  const parts = String(text).split(/(\[\[r\d+\]\])/g);

  return (
    <span className={className}>
      {parts.map((part, i) => {
        const m = part.match(/^\[\[(r\d+)\]\]$/);
        if (m) {
          const code = m[1];
          const alt = HONORIFICS[code] || code;

          // r9 is the ﷺ glyph (U+FDFA) — a real character, not an image.
          if (code === 'r9') {
            return (
              <span key={i} title={alt} aria-label={alt}>
                {'\uFDFA'}
              </span>
            );
          }

          return (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={i}
              src={`/honorifics/${code}.${EXT}`}
              alt={alt}
              title={alt}
              style={{
                display: 'inline-block',
                height: '34px',
                width: 'auto',
                verticalAlign: '-0.4em',
                margin: '0 3px',
              }}
            />
          );
        }
        return <React.Fragment key={i}>{part}</React.Fragment>;
      })}
    </span>
  );
}