"use client";

import { useLanguage } from "../lib/LanguageContext";
import { compilerToDb } from "../lib/i18n";

// Latin digits -> Arabic-Indic (٠١٢٣٤٥٦٧٨٩), for display in Arabic mode.
function toArabicDigits(str) {
  return String(str).replace(/[0-9]/g, (d) => "٠١٢٣٤٥٦٧٨٩"[d]);
}

// Build the Arabic label for a chip: translate the compiler name to Arabic
// (compilerToDb maps 'Bukhari' -> 'البخاري'), and convert the number's digits.
// Falls back to the raw English text if a name has no mapping, so nothing ever
// renders blank.
function arabicLabel(compiler, number) {
  let ar = compiler;
  try {
    const mapped = compilerToDb(compiler);
    if (mapped) ar = mapped;
  } catch {
    /* keep English name */
  }
  return number ? `${ar} ${toArabicDigits(number)}` : ar;
}

/* ------------------------------------------------------------------ *
 * MatchedReferenceChips
 * ------------------------------------------------------------------
 * Renders the `matched_hadith` string ("Bukhari 1, Abu Dawud 2201, ...")
 * as one pill per reference, colored by compiler. Matches the app's
 * existing chip style: h-[28px] px-3 rounded-[10px] text-xs font-medium.
 *
 * value    — the raw matched_hadith string from the API
 * onSelect — optional. When given, each pill is a <button> and calls
 *            onSelect({ compiler, number, raw }) on click. Omit it and
 *            the pills render as plain, non-clickable spans.
 * emptyText — what to show when there are no references.
 * ------------------------------------------------------------------ */

// "Abu Dawud 2201" -> { compiler: "Abu Dawud", number: "2201" }
// Trailing number may carry a letter suffix (e.g. "1234a").
function parseRef(raw) {
  const t = String(raw).trim();
  const m = t.match(/^(.*?)\s*(\d+[a-zA-Z]?)$/);
  if (m) return { compiler: m[1].trim(), number: m[2] };
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

export default function MatchedReferenceChips({ value, onSelect, emptyText }) {
  const { isArabic } = useLanguage();

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

  const clickable = typeof onSelect === "function";
  const base =
    "h-[28px] px-3 inline-flex items-center justify-center text-xs font-medium rounded-[10px]";

  return (
    <div className="flex flex-wrap gap-2">
      {chips.map((raw, i) => {
        const { compiler, number } = parseRef(raw);
        const cls = `${base} ${styleFor(compiler)}`;
        const label = isArabic ? arabicLabel(compiler, number) : raw;

        if (!clickable) {
          return (
            <span key={`${raw}-${i}`} className={cls}>
              {label}
            </span>
          );
        }

        return (
          <button
            key={`${raw}-${i}`}
            type="button"
            onClick={() => onSelect({ compiler, number, raw })}
            className={`${cls} cursor-pointer transition hover:brightness-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1`}
            aria-label={`Open ${raw}`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}