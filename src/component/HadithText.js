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

// Mirrors public.norm_ar() in the database, which search_vector is generated
// through. The index stores ا for أ إ آ ٱ, ي for ى, ه for ة, and strips
// diacritics and tatweel — so a search for 'الاعمال' legitimately matches text
// containing 'الأعمال'. Highlighting has to normalise the same way or the row
// comes back with nothing marked, which reads as a bug.
//
// If norm_ar() ever changes, this changes with it.
const AR_FROM = '\u0623\u0625\u0622\u0671\u0649\u0629\u0640';
const AR_TO   = '\u0627\u0627\u0627\u0627\u064a\u0647';  // one shorter: tatweel maps to nothing
const AR_MARKS = /[\u064B-\u0652\u0670]/g;

function normAr(t) {
  let out = '';
  for (const ch of String(t).replace(AR_MARKS, '')) {
    const i = AR_FROM.indexOf(ch);
    if (i === -1) out += ch;
    else if (i < AR_TO.length) out += AR_TO[i];
    // i >= AR_TO.length — tatweel — is dropped
  }
  return out.toLowerCase();
}

// Word characters for splitting. \w is ASCII-only, so Arabic would be treated
// as punctuation and every letter split into its own token.
const WORD_CHAR = /[\p{L}\p{N}]/u;

// Terms so common that marking them turns a paragraph into a highlighter
// accident. Pasting a whole hadith is a supported search, and without this
// every 'the', 'of' and 'in' in the result would be marked.
const STOPWORDS = new Set([
  'the', 'and', 'for', 'you', 'his', 'her', 'him', 'was', 'are', 'has', 'had',
  'that', 'this', 'with', 'from', 'they', 'them', 'were', 'when', 'then',
  'said', 'not', 'but', 'who', 'all', 'any', 'one', 'out', 'she', 'have',
  'من', 'في', 'عن', 'على', 'الي', 'ان', 'انه', 'انما', 'قال', 'قالت',
  'الذي', 'التي', 'هذا', 'هذه', 'ذلك', 'وقد', 'لم', 'لا', 'ما', 'بن',
]);

// Query -> the set of normalised terms to mark. Punctuation splits, so quotes
// and a leading - fall away on their own: both are search syntax, not text to
// find. Terms under three characters go too — below that, matching is mostly
// coincidence.
function queryTerms(q) {
  if (!q) return [];
  return String(q)
    .split(/[^\p{L}\p{N}]+/u)
    .map((t) => normAr(t))
    .filter((t) => t.length >= 3 && !STOPWORDS.has(t));
}

// Whole-word marking, so searching 'slaughter' marks 'slaughtered' entire
// rather than leaving a ragged 'ed' outside the mark. That matches why the row
// was returned: the index stems, so the stemmed form is what actually hit.
//
// A prefix test alone isn't enough for Arabic, where the definite article is
// attached: 'صلاه' has to match 'الصلاة', and neither is a prefix of the other
// once normalised. So the test is containment — but strictly one-directional:
// the WORD must contain the TERM, never the reverse. Testing both ways marked
// every 'a' and 's' on the page, because the term 'salah' contains them.
function markMatches(text, terms, keyPrefix) {
  if (!terms.length) return text;

  const str = String(text);
  const out = [];
  let buf = '';
  let i = 0;

  const flush = () => { if (buf) { out.push(buf); buf = ''; } };

  while (i < str.length) {
    if (!WORD_CHAR.test(str[i])) { buf += str[i]; i += 1; continue; }

    let j = i;
    while (j < str.length && WORD_CHAR.test(str[j])) j += 1;

    const word = str.slice(i, j);
    const norm = normAr(word);
    const hit = terms.some((t) => norm.includes(t));

    if (hit) {
      flush();
      out.push(
        <mark
          key={`${keyPrefix}-mk${i}`}
          style={{ background: '#F3E7C8', color: 'inherit', padding: '0 1px', borderRadius: '2px' }}
        >
          {word}
        </mark>
      );
    } else {
      buf += word;
    }

    i = j;
  }

  flush();
  return out;
}

// r9 (ﷺ) is an IMAGE like every other honorific, not the U+FDFA character.
// As a font glyph it was unfixable: every Arabic font draws that codepoint as
// a two-tier stacked ligature roughly as tall as it is wide, so at any size
// matching the surrounding text it overflowed the line. r9.svg is the same
// mark drawn from Amiri, and it now goes through the identical <img> path as
// r0-r8 — so it aligns exactly the way the honorifics that already looked
// right do.

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
function renderHonorifics(text, keyPrefix, terms = []) {
  // Split on [[rN]], keeping the tokens so we can swap them for images.
  const parts = String(text).split(/(\[\[r\d+\]\])/g);

  return parts.map((part, i) => {
    const m = part.match(/^\[\[(r\d+)\]\]$/);
    if (m) {
      const code = m[1];
      const alt = HONORIFICS[code] || code;

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
    return (
      <React.Fragment key={`${keyPrefix}-${i}`}>
        {markMatches(part, terms, `${keyPrefix}-${i}`)}
      </React.Fragment>
    );
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
function renderInline(text, keyPrefix, terms = []) {
  const parts = String(text).split(/(\*[^*\n]+\*)/g);

  return parts.map((part, i) => {
    if (/^\*[^*\n]+\*$/.test(part)) {
      return (
        <em key={`${keyPrefix}-em${i}`}>
          {renderHonorifics(part.slice(1, -1), `${keyPrefix}-em${i}`, terms)}
        </em>
      );
    }
    return (
      <React.Fragment key={`${keyPrefix}-t${i}`}>
        {renderHonorifics(part, `${keyPrefix}-t${i}`, terms)}
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
// A clause split can leave the separator attached to the front of the text:
// ", فقال ..." or ": قال ...". It is punctuation belonging to the clause
// that came before, so it is dropped for display only — the stored value is
// untouched, and the split itself is still worth fixing at the source.
//
// Covers the Arabic comma ، and semicolon ؛ alongside the Latin ones, plus
// any leading whitespace before or after. Repeats are collapsed, so ",, "
// goes too. Only the START of the text — punctuation anywhere else is real.
const LEADING_PUNCT = /^[\s\u200b-\u200f\u202a-\u202e]*(?:[,;:\u060c\u061b][\s\u200b-\u200f\u202a-\u202e]*)+/;

const stripLeadingPunct = (t) => String(t).replace(LEADING_PUNCT, '');

export default function HadithText({ text, className = '', paragraphGap = '0.55em', highlight = '' }) {
  if (!text) return null;

  const cleaned = stripLeadingPunct(text);
  const terms = queryTerms(highlight);
  if (!cleaned) return null;

  const blocks = String(cleaned)
    .split(/\n[ \t]*\n+/)
    .map((b) => b.replace(/^\n+|\n+$/g, ''))
    .filter((b) => b.trim() !== '');

  if (blocks.length <= 1) {
    return <span className={className}>{renderInline(cleaned, 'p0', terms)}</span>;
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
          {renderInline(block, `p${bi}`, terms)}
        </span>
      ))}
    </span>
  );
}