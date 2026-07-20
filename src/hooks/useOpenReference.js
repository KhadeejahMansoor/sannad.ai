"use client";
import { useRouter } from "next/navigation";
import { compilerToDb } from "@/lib/i18n";

/* ------------------------------------------------------------------ *
 * useOpenReference
 * ------------------------------------------------------------------
 * Returns a function for <MatchedReferenceChips onSelect={...} />.
 *
 * Reuses the EXISTING endpoint api/hadith/[number], which takes a
 * hadith number + Arabic compiler and returns the row (including its
 * computed composite id, e.g. "sevenbooks-32138" / "azami-1542").
 * On click it:
 *   1. translates the English compiler on the pill -> Arabic DB value
 *   2. GET /api/hadith/<number>?compiler=<arabic>
 *   3. router.push(`/hadith/<data.id>`)
 *
 * A reference with no matching row (or an unmapped compiler) is a no-op
 * — the pill just doesn't navigate; nothing errors.
 * ------------------------------------------------------------------ */
export function useOpenReference() {
  const router = useRouter();

  return async function openReference({ compiler, number }) {
    const compilerAr = compilerToDb(compiler);
    if (!compilerAr || !number) return; // unmappable reference -> no-op

    try {
      const res = await fetch(
        `/api/hadith/${encodeURIComponent(number)}?compiler=${encodeURIComponent(
          compilerAr
        )}`
      );
      if (!res.ok) return; // 404 (no such hadith) / 400 -> no-op
      const json = await res.json();
      const id = json?.data?.id; // composite id: "sevenbooks-…" / "azami-…"
      if (id) router.push(`/hadith/${id}`);
    } catch {
      /* swallow — a broken pill shouldn't take down the panel */
    }
  };
}