"use client";
import { useRouter } from "next/navigation";
import { compilerToDb } from "@/lib/i18n";
import { hadithSlug } from "@/lib/hadithUrl";

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
 *   3. router.push(`/hadith/<Compiler><number>`) — e.g. /hadith/Tirmidhi1
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
      if (!id) return;

      // The lookup above is what tells us the reference actually exists — an
      // unknown one stays a no-op. But navigate to the READABLE url, not the
      // composite id, so clicking a chip and opening it in a new tab (which
      // goes through /api/hadith/lookup) both land on the same address.
      const slug = hadithSlug(compiler, number) || id;
      router.push(`/hadith/${encodeURIComponent(slug)}`);
    } catch {
      /* swallow — a broken pill shouldn't take down the panel */
    }
  };
}