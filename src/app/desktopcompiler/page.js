// src/app/desktopcompiler/page.js
//
// The old collection address. /desktopcompiler?compiler=Nasai now lives at
// /Nasai, so this route's only job is to send visitors and crawlers there.
//
// A permanent redirect rather than a copy of the page: two addresses serving
// the same collection would compete with each other in search results, and the
// query-string one is the weaker of the two — search engines treat ?compiler=
// as a filter on some other page rather than as a page in its own right.
//
// Existing links keep working. Book, chapter and section params ride along, so
// a link into a specific chapter still lands on that chapter.

import { permanentRedirect } from 'next/navigation';
import { COMPILER_SLUGS, compilerSlug } from '@/lib/compilerSlug';

export default async function DesktopCompilerPage({ searchParams }) {
  const params = await searchParams;
  const requested = String(params?.compiler || 'Azami');

  // Match the compiler key case-insensitively and ignoring spaces, so
  // ?compiler=abu+dawud and ?compiler=AbuDawud both resolve.
  const normalise = (value) => value.replace(/\s+/g, '').toLowerCase();
  const match = COMPILER_SLUGS.find(
    (entry) => normalise(entry.key) === normalise(requested)
  );

  const slug = match ? match.slug : compilerSlug(requested);

  // Everything except `compiler` carries over — that one is now the path.
  const rest = new URLSearchParams();
  for (const [key, value] of Object.entries(params || {})) {
    if (key === 'compiler') continue;
    if (Array.isArray(value)) value.forEach((v) => rest.append(key, v));
    else if (value != null) rest.set(key, String(value));
  }

  const query = rest.toString();
  permanentRedirect(`/${encodeURIComponent(slug)}${query ? `?${query}` : ''}`);
}