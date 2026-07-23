// src/app/api/hadith/lookup/route.js
//
// Resolves "compiler + hadith number" to that hadith's page and redirects.
//
// The reference chips only know a compiler and a number; the page they point at
// is /hadith/<composite id>, which is only known after a lookup. That meant the
// chips had to be <button>s running an async fetch — and a button has no URL, so
// right-click offered no "open in new tab", middle-click did nothing, and the
// reference couldn't be copied or bookmarked.
//
// This gives them a real URL to hang off. The browser follows it, this route
// does the lookup server-side, and the user lands on the hadith.
//
// The `compiler` parameter is the ARABIC value, translated client-side before
// the link is built — this route deliberately does no i18n of its own.

import { NextResponse } from 'next/server';
import { hadithSlug } from '@/lib/hadithUrl';
import { translateCompiler } from '@/lib/i18n';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const compiler = searchParams.get('compiler');
  const number = searchParams.get('number');

  // Anything unresolvable goes home rather than showing an error page — a bad
  // reference is a data problem, not something the reader can act on.
  const home = NextResponse.redirect(new URL('/', origin));
  if (!compiler || !number) return home;

  try {
    const res = await fetch(
      `${origin}/api/hadith/${encodeURIComponent(number)}?compiler=${encodeURIComponent(compiler)}`,
      { cache: 'no-store' }
    );
    if (!res.ok) return home;

    const json = await res.json();
    const id = json?.data?.id;
    if (!id) return home;

    // Land on the readable URL, not the composite id — a chip opened in a new
    // tab should leave a legible address bar.
    const slug = hadithSlug(translateCompiler(compiler), number) || id;
    return NextResponse.redirect(new URL(`/hadith/${encodeURIComponent(slug)}`, origin));
  } catch {
    return home;
  }
}