// src/app/hadith/[hadithId]/HadithDetailClient.js
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DetailView from '@/component/DetailView';
import { parseHadithSlug, hadithSlug } from '@/lib/hadithUrl';
import { compilerToDb } from '@/lib/i18n';

// initialHadith / initialNeighbors are supplied by the server component at
// /[hadithSlug]. When they are present this component renders the hadith on
// the first paint and never fetches — the browser-side load below is kept only
// for the callers that still mount this without server data (/hadith/<id>).
export default function HadithDetailClient({ hadithId, initialHadith = null, initialNeighbors = null }) {
  const router = useRouter();
  const [hadith, setHadith] = useState(initialHadith);
  const [neighbors, setNeighbors] = useState(initialNeighbors || { prev: null, next: null });
  const [loading, setLoading] = useState(!initialHadith);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Already rendered from the server payload for this slug — nothing to do.
    if (initialHadith) {
      setHadith(initialHadith);
      setNeighbors(initialNeighbors || { prev: null, next: null });
      setLoading(false);
      return;
    }

    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        setError(null);

        // The URL may be the readable form (Abu-Dawud2350) or a composite id
        // from an older link (sevenbooks-59726). Everything downstream works in
        // composite ids, so a readable slug is resolved to one first.
        let id = hadithId;
        const parsed = parseHadithSlug(hadithId);
        if (parsed) {
          const lookup = await fetch(
            `/api/hadith/${encodeURIComponent(parsed.number)}?compiler=${encodeURIComponent(
              compilerToDb(parsed.compiler)
            )}`
          );
          const lookupJson = lookup.ok ? await lookup.json() : null;
          const resolved = lookupJson?.data?.id;

          if (cancelled) return;

          // A slug that doesn't resolve means there is no such hadith. Stop
          // here: passing the slug on to /api/hadith-by-id would surface that
          // endpoint's format complaint ("Expected '<source>-<id>'"), which
          // describes an internal id shape the reader never typed.
          if (!resolved) {
            setError(`No hadith found for ${parsed.compiler} ${parsed.number}.`);
            setHadith(null);
            setLoading(false);
            return;
          }

          id = resolved;
        }

        if (cancelled) return;

        // Fetch the hadith and its neighbors in parallel — neighbors is
        // independent of the body, so no reason to wait sequentially.
        const [hadithRes, neighborsRes] = await Promise.all([
          fetch(`/api/hadith-by-id/${encodeURIComponent(id)}`),
          fetch(`/api/hadith-by-id/${encodeURIComponent(id)}/neighbors`),
        ]);

        const hadithJson = await hadithRes.json();
        const neighborsJson = await neighborsRes.json();

        if (cancelled) return;

        if (!hadithJson.success) {
          setError(hadithJson.error || 'Failed to load hadith');
          setHadith(null);
        } else {
          setHadith(hadithJson.data);
        }

        // Neighbors are best-effort — if the call fails we just disable the arrows
        if (neighborsJson.success) {
          setNeighbors(neighborsJson.data);
        } else {
          setNeighbors({ prev: null, next: null });
        }
      } catch (e) {
        if (cancelled) return;
        setError(e.message || 'Failed to load hadith');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [hadithId, initialHadith, initialNeighbors]);

  const handleClose = () => router.back();

  // Prefer the readable URL, so stepping through with the arrows leaves a
  // legible address bar. Falls back to the composite id when the neighbour
  // payload doesn't carry a compiler and number.
  const goTo = (neighbor) => {
    if (!neighbor?.hadith_id) return;
    const slug = hadithSlug(neighbor.compiler, neighbor.hadith_number) || neighbor.hadith_id;
    router.push(`/${encodeURIComponent(slug)}`);
  };

  const handlePrev = () => goTo(neighbors.prev);
  const handleNext = () => goTo(neighbors.next);

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-[#F6F4F1] flex items-center justify-center">
        <p className="text-gray-500 text-sm">Loading hadith...</p>
      </div>
    );
  }

  if (error || !hadith) {
    return (
      <div className="min-h-screen w-full bg-[#F6F4F1] flex flex-col items-center justify-center gap-3">
        <p className="text-gray-700 text-base">Hadith not found.</p>
        {error && <p className="text-gray-500 text-xs">{error}</p>}
        <button
          onClick={handleClose}
          className="mt-2 px-4 py-2 bg-[#523230] text-white rounded-[5px] text-sm"
        >
          Go back
        </button>
      </div>
    );
  }

  return (
    <DetailView
      hadith={hadith}
      onClose={handleClose}
      asPage
      onPrev={handlePrev}
      onNext={handleNext}
      hasPrev={!!neighbors.prev}
      hasNext={!!neighbors.next}
    />
  );
}