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

/* Section ids, derived from the heading text so the contents list and the
   headings can't drift apart — both call this rather than keeping their own
   list. */
const sectionId = (text) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");

/* A speaker is named only when the speaker changes. Azami and Qadhi each
   run several paragraphs at a stretch, and repeating the name on every
   one of them read as a new turn each time — the transcript looked like
   an exchange where it was really one person talking. A heading resets
   the run, so the first paragraph after a section break is always
   attributed. */
function ArticleBody({ article }) {
  let lastSpeaker = null;

  return (
    <div className="flex flex-col gap-5">
      {article.body.map((block, i) => {
        if (block.type === "h2") {
          lastSpeaker = null;
          return (
            <h2
              key={i}
              id={sectionId(block.text)}
              /* Inline rather than a Tailwind class: the jump has to clear
                 the sticky header AND leave the heading visible, and this is
                 the one value likely to need tuning by eye. Without it the
                 browser scrolls the heading to y=0, where the header sits on
                 top of it — you land on the first paragraph with no idea
                 which section you're in. */
              style={{ scrollMarginTop: "150px" }}
              className="mt-8 text-[21px] font-medium text-[#1C1917] first:mt-0"
            >
              {withHonorifics(block.text)}
            </h2>
          );
        }

        /* Sub-section within a part — e.g. "Building on the works of other
           authors" inside the works section. */
        if (block.type === "h3") {
          lastSpeaker = null;
          return (
            <h3
              key={i}
              className="mt-5 text-[17px] font-medium leading-snug text-[#1C1917] first:mt-0"
            >
              {withHonorifics(block.text)}
            </h3>
          );
        }

        /* Lowest level — an individual work title. Set in the site maroon so
           a long run of them reads as a list of entries rather than a
           series of sections. */
        if (block.type === "h4") {
          lastSpeaker = null;
          return (
            <h4
              key={i}
              className="mt-3 text-[16px] font-medium leading-snug text-[#7B2833] first:mt-0"
            >
              {withHonorifics(block.text)}
            </h4>
          );
        }

        if (block.type === "qa") {
          const isNewSpeaker = block.speaker !== lastSpeaker;
          lastSpeaker = block.speaker;

          return (
            <p key={i} className="text-[16px] leading-relaxed text-[#292524]">
              {/* Speaker set in the site maroon, no colon — the colour and
                  weight already separate it from the words that follow. */}
              {isNewSpeaker && (
                <span className="font-medium text-[#7B2833]">
                  {block.speaker}{" "}
                </span>
              )}
              {withMarkers(block.text)}
            </p>
          );
        }

        lastSpeaker = null;

        /* Numbered list — the second edition's list of what changed.
           Numbers sit in the maroon and hang outside the text column, so a
           long item wraps flush rather than under its own number. */
        if (block.type === "ol") {
          return (
            <ol key={i} className="flex flex-col gap-2">
              {block.items.map((item, j) => (
                <li
                  key={j}
                  className="flex gap-3 text-[16px] leading-relaxed text-[#292524]"
                >
                  <span className="tabular-nums text-[#7B2833]">{j + 1}.</span>
                  <span>{withMarkers(item)}</span>
                </li>
              ))}
            </ol>
          );
        }

        /* Closing signature — place, date, attribution. Set apart and
           quieter than the body, so it reads as the end of the piece
           rather than another paragraph. */
        if (block.type === "sig") {
          return (
            <div
              key={i}
              className="mt-4 flex flex-col gap-0.5 text-[15px] leading-relaxed text-[#78716C]"
            >
              {block.lines.map((line, j) => (
                <span key={j}>{line}</span>
              ))}
            </div>
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
    <div className="w-full max-w-[760px]">
      {/* A real link, so it can be opened in a new tab and so the
            browser's own back button lands where the reader expects. */}
      <Link
        href="/articles"
        className="mb-8 inline-block text-sm text-[#A8A29E] no-underline hover:text-[#1C1917]"
      >
        ← All articles
      </Link>

      {/* Same serif as the index, so a piece looks continuous with the
          entry that led to it. */}
      <h1
        className="text-[28px] sm:text-[34px] leading-[1.15] text-[#1C1917]"
        style={{ fontFamily: 'var(--font-serif)' }}
      >
        {article.title}
      </h1>

      {article.interviewDate && (
        <p className="mt-2 text-sm text-[#A8A29E]">{article.interviewDate}</p>
      )}

      {article.intro && (
        <p className="mt-5 text-[16px] leading-relaxed text-[#44403C]">
          {withHonorifics(article.intro)}
        </p>
      )}

      {/* Contents, built from the h2 blocks in the body rather than a
          separate list — a section can't be added without appearing here,
          and a renamed heading can't leave a dead link behind. Hidden when
          a piece has fewer than two sections, where it would be noise. */}
      {(() => {
        const sections = article.body.filter((b) => b.type === "h2");
        if (sections.length < 2) return null;

        return (
          <nav aria-label="Contents" className="mt-6 flex flex-col gap-1.5">
            {sections.map((b) => (
              <a
                key={b.text}
                href={`#${sectionId(b.text)}`}
                className="text-[15px] text-[#7B2833] no-underline hover:underline"
              >
                {b.text}
              </a>
            ))}
          </nav>
        );
      })()}

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
  /* An editorial index rather than a grid of cards — four white rectangles
     read as a dashboard; serif titles on the bare page read as a
     publication.

     Every entry is set at the same size. An earlier version gave the newest
     piece a larger title, which made the list look ranked rather than
     chronological. Hairlines separate them; no boxes.

     Subtitles sit in the site maroon rather than grey: at this size the
     colour does the separating that a border used to. */
  return (
    <div className="w-full max-w-[760px]">
      {ARTICLES.map((a) => (
        <Link
          key={a.slug}
          href={`/articles/${a.slug}`}
          className="block border-b border-[#E7E1DC] py-7 no-underline first:pt-0 last:border-b-0"
        >
          <h2
            className="text-[20px] sm:text-[24px] leading-[1.2] text-[#1C1917] transition-colors hover:text-[#7B2833]"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            {a.title}
          </h2>
          {a.subtitle && (
            <p className="mt-2 text-[14px] leading-relaxed text-[#7B2833]">
              {a.subtitle}
            </p>
          )}
        </Link>
      ))}
    </div>
  );
}