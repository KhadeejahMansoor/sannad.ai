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

// Per-compiler colors — all in one warm brown family, tuned to the
// #F6F4F1 background + umber logo. No greens or blues: compilers are told
// apart by undertone (reddish clay / golden ochre / neutral taupe) and
// lightness. Each text color is a deeper shade of its own pill.
// Tailwind arbitrary values, so no config/safelist changes needed.
const COMPILER_STYLES = {
  Bukhari:     "bg-[#EBDCCB] text-[#7A4B2B]", // terracotta / umber — the hero
  Muslim:      "bg-[#E9D6C2] text-[#8A5A34]", // caramel brown
  Ahmad:       "bg-[#E2D6C6] text-[#5D4B35]", // greyed chestnut
  Malik:       "bg-[#EBE0D3] text-[#7A5C3E]", // sand / walnut
  "Abu Dawud": "bg-[#E6DBCF] text-[#6F5B42]", // mushroom brown
  Nasai:       "bg-[#E9E0D6] text-[#6E5A44]", // neutral tan
  Tirmidhi:    "bg-[#E0D2C4] text-[#5F4636]", // deep coffee
  "Ibn Majah": "bg-[#EDE6DC] text-[#6B5B4A]", // light cream-taupe
  Azami:       "bg-[#E4DBCE] text-[#6B5B55]", // cream — internal numbering, kept quiet
};
const DEFAULT_STYLE = "bg-[#ECE7E1] text-[#6B5B55]";

function styleFor(compiler) {
  if (COMPILER_STYLES[compiler]) return COMPILER_STYLES[compiler];
  const key = Object.keys(COMPILER_STYLES).find((k) =>
    compiler.toLowerCase().includes(k.toLowerCase())
  );
  return key ? COMPILER_STYLES[key] : DEFAULT_STYLE;
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
        const cls = `${pillBase} ${styleFor(group.compiler)}`;
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

                return (
                  <button
                    key={`${ref.raw}-${i}`}
                    type="button"
                    onClick={() =>
                      onSelect({ compiler: group.compiler, number: ref.number, raw: ref.raw })
                    }
                    className={`${cls} cursor-pointer transition hover:brightness-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1`}
                    aria-label={`Open ${ref.raw}`}
                  >
                    {label}
                  </button>
                );
              })}
            </span>
          </div>
        );
      })}
    </div>
  );
}