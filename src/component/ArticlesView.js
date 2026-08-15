'use client';
import React, { useState } from 'react';
import ArticleVideo from './ArticleVideo';
import { ARTICLES } from '../data/articles';

/* ------------------------------------------------------------------ *
 * ArticlesView
 * ------------------------------------------------------------------
 * A list of article cards; clicking one opens it in place. Content
 * comes from data/articles.js rather than living in this file, so
 * adding an article means adding an object there.
 * ------------------------------------------------------------------ */

/* The honorific ﷺ is written as [[r9]] in the source text, matching the
   convention the rest of the site uses. Rendered as the Unicode glyph
   (U+FDFA) so it scales with the surrounding type. */
function withHonorifics(text) {
  return text.split(/(\[\[r9\]\])/g).map((part, i) =>
    part === '[[r9]]' ? (
      <span key={i} lang="ar">
        {'\uFDFA'}
      </span>
    ) : (
      part
    )
  );
}

/* Footnote markers are written as [1], [2] … in the source. They render
   as small raised numbers linking to the list at the foot of the piece. */
function withMarkers(text) {
  return text.split(/(\[\d\])/g).map((part, i) => {
    const m = part.match(/^\[(\d)\]$/);
    if (!m) return <React.Fragment key={i}>{withHonorifics(part)}</React.Fragment>;
    return (
      <sup key={i} className="ms-0.5 text-[11px] text-[#7A4B2B]">
        <a href={`#fn-${m[1]}`} className="no-underline">
          {m[1]}
        </a>
      </sup>
    );
  });
}

function ArticleBody({ article }) {
  return (
    <div className="flex flex-col gap-5">
      {article.body.map((block, i) => {
        if (block.type === 'h2') {
          return (
            <h2
              key={i}
              className="mt-4 text-[18px] font-medium text-[#1C1917] first:mt-0"
            >
              {block.text}
            </h2>
          );
        }

        if (block.type === 'qa') {
          return (
            <p key={i} className="text-[16px] leading-relaxed text-[#292524]">
              {/* Speaker set in the site maroon, no colon — the colour and
                  weight already separate it from the words that follow. */}
              <span className="font-medium text-[#7B2833]">{block.speaker} </span>
              {withMarkers(block.text)}
            </p>
          );
        }

        return (
          <p key={i} className="text-[16px] leading-relaxed text-[#292524]">
            {withMarkers(block.text)}
          </p>
        );
      })}
    </div>
  );
}

export default function ArticlesView() {
  const [openSlug, setOpenSlug] = useState(null);
  const article = ARTICLES.find((a) => a.slug === openSlug);

  if (article) {
    return (
      <div className="mx-auto w-full max-w-[760px]">
        <button
          type="button"
          className="mb-8 text-sm text-[#A8A29E] hover:text-[#1C1917]"
          onClick={() => setOpenSlug(null)}
        >
          ← All articles
        </button>

        <h1 className="text-[26px] sm:text-[30px] font-medium leading-tight text-[#1C1917]">
          {article.title}
        </h1>

        {/* Video sits above the text: it's the primary artefact here and
            the transcript is the record of it. */}
        {article.videoId && (
          <ArticleVideo videoId={article.videoId} title={article.videoTitle} />
        )}

        <div className="mt-8">
          <ArticleBody article={article} />
        </div>

        {article.footnotes?.length > 0 && (
          <div className="mt-12 border-t border-[#E7E1DC] pt-6">
            <h2 className="mb-3 text-[15px] font-medium text-[#1C1917]">References</h2>
            <ol className="flex flex-col gap-2">
              {article.footnotes.map((note, i) => (
                <li
                  key={i}
                  id={`fn-${i + 1}`}
                  className="flex gap-3 text-[13px] leading-relaxed text-[#78716C]"
                >
                  <span className="tabular-nums text-[#A8A29E]">{i + 1}</span>
                  <span>{note}</span>
                </li>
              ))}
            </ol>
          </div>
        )}

      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {ARTICLES.map((a) => (
        <button
          key={a.slug}
          type="button"
          className="flex min-h-[168px] flex-col gap-3 rounded-[8px] border border-[#E7E1DC] bg-white p-5 text-start transition-colors hover:border-[#CFC7C1]"
          onClick={() => setOpenSlug(a.slug)}
        >
          <span className="text-base font-medium leading-tight text-[#1C1917]">
            {a.title}
          </span>
          {a.subtitle && (
            <span className="text-sm leading-snug text-[#57534E]">{a.subtitle}</span>
          )}
          <span className="mt-auto text-xs text-[#A8A29E]">
            {a.date} — {a.author}
          </span>
        </button>
      ))}
    </div>
  );
}