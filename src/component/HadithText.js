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

// ﷺ (U+FDFA) is a ligature drawn compressed inside a single em box, so at
// font-size:1em it looks markedly smaller than the letters beside it — the whole
// phrase is squeezed into the space of one character. It has to be scaled up to
// LOOK the same size.
//
// The lang="ar" below is what picks the font: globals.css has a *:lang(ar) rule
// pointing at Noto Sans Arabic, so the glyph renders identically on the English
// and Arabic sides instead of falling back to a different system font in each.
// Tune these two if it sits high, low, or small:
//   GLYPH_SIZE    how much bigger than the body text
//   GLYPH_BASELINE how far to drop it (more negative = lower)
const GLYPH_SIZE = '1.45em';
const GLYPH_BASELINE = '-0.32em';

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

// Honorific tokens swapped for glyphs or images.
function renderHonorifics(text, keyPrefix) {
  // Split on [[rN]], keeping the tokens so we can swap them for images.
  const parts = String(text).split(/(\[\[r\d+\]\])/g);

  return parts.map((part, i) => {
    const m = part.match(/^\[\[(r\d+)\]\]$/);
    if (m) {
      const code = m[1];
      const alt = HONORIFICS[code] || code;

      // r9 is the ﷺ glyph (U+FDFA) — a real character, not an image.
      if (code === 'r9') {
        return (
          <span
            key={`${keyPrefix}-${i}`}
            lang="ar"
            title={alt}
            aria-label={alt}
            style={{
              display: 'inline-block',
              fontSize: GLYPH_SIZE,
              // Zero line-height keeps the enlarged glyph from stretching the
              // line box and spacing the paragraph's lines apart.
              lineHeight: 0,
              verticalAlign: GLYPH_BASELINE,
            }}
          >
            {'\uFDFA'}
          </span>
        );
      }

      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={`${keyPrefix}-${i}`}
          src={`/honorifics/${code}.${EXT}`}
          alt={alt}
          title={alt}
          style={{
            display: 'inline-block',
            height: '1.4em',
            width: 'auto',
            verticalAlign: '-0.35em',
            margin: '0 2px',
          }}
        />
      );
    }
    return <React.Fragment key={`${keyPrefix}-${i}`}>{part}</React.Fragment>;
  });
}

// Emphasis. The source marks a phrase by wrapping it in asterisks —
// *like this* — and those asterisks were being printed literally.
//
// Split on the pairs FIRST, then render honorifics inside each piece, so a
// token sitting inside an emphasised phrase (*The Prophet [[r9]] said*) still
// becomes its glyph and the emphasis still spans the whole phrase.
//
// A lone asterisk with no partner stays literal — it isn't markup.
function renderInline(text, keyPrefix) {
  const parts = String(text).split(/(\*[^*\n]+\*)/g);

  return parts.map((part, i) => {
    if (/^\*[^*\n]+\*$/.test(part)) {
      return (
        <em key={`${keyPrefix}-em${i}`}>
          {renderHonorifics(part.slice(1, -1), `${keyPrefix}-em${i}`)}
        </em>
      );
    }
    return (
      <React.Fragment key={`${keyPrefix}-t${i}`}>
        {renderHonorifics(part, `${keyPrefix}-t${i}`)}
      </React.Fragment>
    );
  });
}

/**
 * The source text separates paragraphs with a blank line. Containers render it
 * with `whitespace-pre-line`, which turns that blank line into a full empty
 * line — around 1.6em of dead space between every paragraph. That reads as a
 * gap between sections rather than between paragraphs.
 *
 * The blank lines are consumed here instead, and each paragraph becomes a block
 * with a measured `paragraphGap` above it. Single newlines inside a paragraph
 * still break, via white-space: pre-line on the block.
 *
 * Text with no blank line — chip labels, detail rows, the machine clause —
 * renders inline exactly as before, so only multi-paragraph bodies change.
 *
 * paragraphGap — space between paragraphs. Override per call site if needed.
 */
export default function HadithText({ text, className = '', paragraphGap = '0.55em' }) {
  if (!text) return null;

  const blocks = String(text)
    .split(/\n[ \t]*\n+/)
    .map((b) => b.replace(/^\n+|\n+$/g, ''))
    .filter((b) => b.trim() !== '');

  if (blocks.length <= 1) {
    return <span className={className}>{renderInline(text, 'p0')}</span>;
  }

  return (
    <span className={className}>
      {blocks.map((block, bi) => (
        <span
          key={`b${bi}`}
          style={{
            display: 'block',
            whiteSpace: 'pre-line',
            marginTop: bi === 0 ? 0 : paragraphGap,
          }}
        >
          {renderInline(block, `p${bi}`)}
        </span>
      ))}
    </span>
  );
}