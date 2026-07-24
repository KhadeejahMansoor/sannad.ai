"use client";

import { useLanguage } from "../lib/LanguageContext";
import { compilerToDb } from "../lib/i18n";

// Latin digits -> Arabic-Indic (٠١٢٣٤٥٦٧٨٩), for display in Arabic mode.
function toArabicDigits(str) {
  return String(str).replace(/[0-9]/g, (d) => "٠١٢٣٤٥٦٧٨٩"[d]);
}

// Translate a compiler name to Arabic ('Bukhari' -> 'البخاري'), falling back to
// the English name if there's no mapping, so a row never renders blank.
function arabicCompiler(compiler) {
  try {
    const mapped = compilerToDb(compiler);
    if (mapped) return mapped;
  } catch {
    /* keep English name */
  }
  return compiler;
}

// Same lookup, but null when there's no real mapping — the display fallback
// above is fine showing an English name, a URL is not.
function arabicCompilerOrNull(compiler) {
  try {
    return compilerToDb(compiler) || null;
  } catch {
    return null;
  }
}

/* ------------------------------------------------------------------ *
 * MatchedReferenceChips
 * ------------------------------------------------------------------
 * Renders the `matched_hadith` string ("Bukhari 1, Abu Dawud 2201, ...")
 * as one ROW PER COMPILER: the name once on the left, its numbers as
 * pills on the right.
 *
 * The previous layout repeated the compiler name on every pill, so a
 * hadith with five Azami cross-references read "Azami 6132, Azami 226,
 * Azami 13940…" — the same word four times more than it needed to be.
 * Grouping drops the repetition and makes the spread of sources legible
 * at a glance.
 *
 * value    — the raw matched_hadith string from the API
 * onSelect — optional. When given, each pill is a <button> and calls
 *            onSelect({ compiler, number, raw }) on click. Omit it and
 *            the pills render as plain, non-clickable spans.
 * emptyText — what to show when there are no references.
 * ------------------------------------------------------------------ */

// "Abu Dawud 2201" -> { compiler: "Abu Dawud", number: "2201" }
// Trailing number may carry a letter suffix (e.g. "1234a") or be a range
// ("7350-7351"), both of which stay attached to the number.
function parseRef(raw) {
  const t = String(raw).trim();
  const m = t.match(/^(.*?)\s*(\d+[a-zA-Z]?(?:\s*[-–]\s*\d+[a-zA-Z]?)*)$/);
  if (m) return { compiler: m[1].trim(), number: m[2].replace(/\s*[-–]\s*/g, "-") };
  return { compiler: t, number: "" };
}

// One uniform chip colour for every compiler. Per-compiler tinting existed to
// tell references apart in a flat list — now that each compiler owns its own
// row, the colour carried no information and only added noise. A single warm
// sand keeps the panel calm against the #F6F4F1 page.
// Numbers sit as plain text and only take a background on hover. A panel with
// twenty references was twenty filled boxes competing for attention; the
// highlight is more useful as a pointer cue than as permanent decoration.
const CHIP_STYLE = "text-[#5C5347] bg-transparent hover:bg-[#EBE7DE]";

// The resolver route that turns compiler+number into the hadith's real URL.
// Giving the chips an href is what makes right-click "open in new tab",
// middle-click, and copy-link-address work — a <button> offers none of those.
// Returns null when the compiler has no Arabic mapping, in which case the chip
// renders as a plain span, matching the old no-op behaviour.
function hrefFor(compiler, number) {
  const ar = arabicCompilerOrNull(compiler);
  if (!ar || !number) return null;
  return `/api/hadith/lookup?compiler=${encodeURIComponent(ar)}&number=${encodeURIComponent(number)}`;
}

// Leading integer, for ordering. "13940" -> 13940, "7350-7351" -> 7350.
function numericValue(number) {
  const n = parseInt(String(number).replace(/[^0-9]/g, ""), 10);
  return Number.isNaN(n) ? Infinity : n;
}

// Collapse the flat list into [{ compiler, refs: [...] }], keeping the order in
// which each compiler first appears — that ordering comes from the source data
// and is more meaningful than alphabetical. Numbers within a compiler are
// sorted ascending, which the raw string rarely is.
function groupByCompiler(chips) {
  const groups = [];
  const byName = new Map();

  for (const raw of chips) {
    const { compiler, number } = parseRef(raw);
    let group = byName.get(compiler);
    if (!group) {
      group = { compiler, refs: [] };
      byName.set(compiler, group);
      groups.push(group);
    }
    group.refs.push({ raw, number });
  }

  for (const g of groups) {
    g.refs.sort((a, b) => numericValue(a.number) - numericValue(b.number));
  }
  return groups;
}

export default function MatchedReferenceChips({ value, onSelect, emptyText, isArabic: isArabicProp }) {
  const ctx = useLanguage();
  // Prefer an explicit prop; fall back to the global context when it isn't given.
  // DetailView has its OWN local Arabic toggle, separate from the global context,
  // so without this the chips would ignore that toggle and stay English.
  const isArabic = isArabicProp !== undefined ? isArabicProp : ctx.isArabic;

  const chips = (value || "")
    // split on both Latin and Arabic commas, plus semicolons / newlines
    .split(/[,،;\n]+/)
    .map((s) => s.trim())
    .filter(Boolean);

  if (chips.length === 0) {
    return (
      <p className="text-[#6B5B55] text-xs text-start">
        {emptyText || "No references available."}
      </p>
    );
  }

  const groups = groupByCompiler(chips);
  const clickable = typeof onSelect === "function";
  const pillBase =
    "h-[26px] px-2.5 inline-flex items-center justify-center text-xs font-medium rounded-[8px]";

  return (
    <div className="flex flex-col">
      {groups.map((group, gi) => {
        const cls = `${pillBase} ${CHIP_STYLE}`;
        const name = isArabic ? arabicCompiler(group.compiler) : group.compiler;

        return (
          <div
            key={`${group.compiler}-${gi}`}
            className={`flex items-baseline gap-3 py-2 ${
              gi < groups.length - 1 ? "border-b border-[#EDE4E1]" : ""
            }`}
          >
            {/* Fixed-width label column keeps the pills aligned down the panel.
                min-w rather than w so longer Arabic names aren't clipped. */}
            <span className="min-w-[76px] flex-shrink-0 text-xs font-medium text-[#523230] text-start">
              {name}
            </span>

            <span className="flex flex-wrap gap-1.5">
              {group.refs.map((ref, i) => {
                const label = isArabic ? toArabicDigits(ref.number) : ref.number;

                if (!clickable) {
                  return (
                    <span key={`${ref.raw}-${i}`} className={cls}>
                      {label}
                    </span>
                  );
                }

                const href = hrefFor(group.compiler, ref.number);

                // No mapping, no URL — render it unclickable rather than a dead link.
                if (!href) {
                  return (
                    <span key={`${ref.raw}-${i}`} className={cls}>
                      {label}
                    </span>
                  );
                }

                return (
                  <a
                    key={`${ref.raw}-${i}`}
                    href={href}
                    onClick={(e) => {
                      // Let the browser handle anything that means "somewhere
                      // else": ctrl/cmd/shift/alt-click, or a middle click. Only
                      // a plain left click is intercepted for in-app navigation,
                      // which is faster than a round trip through the redirect.
                      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
                      e.preventDefault();
                      onSelect({ compiler: group.compiler, number: ref.number, raw: ref.raw });
                    }}
                    className={`${cls} cursor-pointer transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 no-underline`}
                    aria-label={`Open ${ref.raw}`}
                  >
                    {label}
                  </a>
                );
              })}
            </span>
          </div>
        );
      })}
    </div>
  );
}