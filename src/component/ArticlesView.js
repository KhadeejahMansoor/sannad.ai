"use client";
import React from "react";
import Link from "next/link";
import ArticleVideo from "./ArticleVideo";
import { ARTICLES } from "../data/articles";

/* ------------------------------------------------------------------ *
 * ArticlesView / ArticleDetail
 * ------------------------------------------------------------------
 * Two exports. ArticlesView is the card list at /articles;
 * ArticleDetail renders one piece at /articles/[slug].
 *
 * These used to be one component switching on useState, which meant
 * every article shared the /articles URL — a piece couldn't be linked,
 * shared, bookmarked, or indexed by a search engine, and the back
 * button left the section entirely.
 *
 * Content comes from data/articles.js, so adding an article means
 * adding an object there; the route picks it up automatically.
 * ------------------------------------------------------------------ */

/* The honorific ﷺ is written as [[r9]] in the source text, matching the
   convention the rest of the site uses. Rendered as the Unicode glyph
   (U+FDFA) so it scales with the surrounding type. */
function withHonorifics(text) {
  return text.split(/(\[\[r9\]\])/g).map((part, i) =>
    part === "[[r9]]" ? (
      <span key={i} lang="ar">
        {"\uFDFA"}
      </span>
    ) : (
      part
    ),
  );
}

/* Footnote markers are written as [1], [2] … in the source. They render
   as small raised numbers linking to the list at the foot of the piece. */
function withMarkers(text) {
  return text.split(/(\[\d\])/g).map((part, i) => {
    const m = part.match(/^\[(\d)\]$/);
    if (!m)
      return <React.Fragment key={i}>{withHonorifics(part)}</React.Fragment>;
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
        if (block.type === "h2") {
          return (
            <h2
              key={i}
              className="mt-4 text-[18px] font-medium text-[#1C1917] first:mt-0"
            >
              {block.text}
            </h2>
          );
        }

        if (block.type === "qa") {
          return (
            <p key={i} className="text-[16px] leading-relaxed text-[#292524]">
              {/* Speaker set in the site maroon, no colon — the colour and
                  weight already separate it from the words that follow. */}
              <span className="font-medium text-[#7B2833]">
                {block.speaker}{" "}
              </span>
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

export function ArticleDetail({ article }) {
  if (!article) return null;

  return (
    <div className="mx-auto w-full max-w-[760px]">
      {/* A real link, so it can be opened in a new tab and so the
            browser's own back button lands where the reader expects. */}
      <Link
        href="/articles"
        className="mb-8 inline-block text-sm text-[#A8A29E] no-underline hover:text-[#1C1917]"
      >
        ← All articles
      </Link>

      <h1 className="text-[26px] sm:text-[30px] font-medium leading-tight text-[#1C1917]">
        {article.title}
      </h1>

      {article.interviewDate && (
        <p className="mt-2 text-sm text-[#A8A29E]">{article.interviewDate}</p>
      )}

      {/* Video sits above the text: it's the primary artefact here and
            the transcript is the record of it. */}
      {article.videoId && (
        <ArticleVideo
          videoId={article.videoId}
          title={article.videoTitle ?? null}
        />
      )}

      <div className="mt-8">
        <ArticleBody article={article} />
      </div>

      {article.footnotes?.length > 0 && (
        <div className="mt-12 border-t border-[#E7E1DC] pt-6">
          <h2 className="mb-3 text-[15px] font-medium text-[#1C1917]">
            References
          </h2>
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

export default function ArticlesView() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {ARTICLES.map((a) => (
        <Link
          key={a.slug}
          href={`/articles/${a.slug}`}
          className="flex flex-col gap-2 rounded-[8px] border border-[#E7E1DC] bg-white p-5 text-start no-underline transition-colors hover:border-[#CFC7C1]"
        >
          <span className="text-base font-medium leading-tight text-[#1C1917]">
            {a.title}
          </span>
          {a.subtitle && (
            <span className="text-sm leading-snug text-[#57534E]">
              {a.subtitle}
            </span>
          )}
        </Link>
      ))}
    </div>
  );
}