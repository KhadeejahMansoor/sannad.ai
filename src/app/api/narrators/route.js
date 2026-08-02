// src/app/api/narrators/route.js
//
// Two modes, one endpoint:
//   GET /api/narrators            → the chips: top 9 by hadith count
//   GET /api/narrators?q=abdullah → the tail: name search over all 3,621
//
// Both scripts come back. machine_clause IS the Arabic name (أبو هريرة) and
// english is the transliteration (Abu Hurairah), so the chip can follow the
// language toggle like every other label in the app. The Arabic search box also
// matches on either script.
//
// The VALUE stays English everywhere — chip state, URL, API param — matching
// the rule already documented in FilterPopup: never let the Arabic label into
// state. Only the label switches.
//
// Names only in the search results, per the UI decision. Counts come back on
// the chip list because the chips are a fixed set and the number is useful
// there; a 3,621-row search doesn't need it and it costs an aggregate.

import { pool } from '../../../lib/db';
import { NextResponse } from 'next/server';

// Nine, because that's where the corpus divides: Abu Hurairah 10,858 down to
// Abdullah bin Amr bin As 1,593, then a long flat tail. Hard-coding the COUNT
// rather than the names, so the list stays correct as data is re-imported.
const CHIP_COUNT = 9;

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = (searchParams.get('q') || '').trim();

    if (q) {
      // Searching machine_clauses alone — 3,621 short strings, not 80k hadith
      // bodies. No join, no count, no ranking by relevance: ordered by name so
      // results are stable and scannable while typing.
      //
      // Chips are excluded: they're already on screen, and repeating them in
      // the "other narrators" list is confusing.
      const { rows } = await pool.query(
        `WITH chips AS (
           SELECT m.english
             FROM hadiths h
             JOIN machine_clauses m ON h.machine_clause = m.machine_clause
            WHERE m.english IS NOT NULL AND TRIM(m.english) <> ''
            GROUP BY m.english
            ORDER BY COUNT(*) DESC
            LIMIT $2
         )
         SELECT DISTINCT m.english AS narrator, m.machine_clause AS narrator_ar
           FROM machine_clauses m
          WHERE (m.english ILIKE '%' || $1 || '%' OR m.machine_clause ILIKE '%' || $1 || '%')
            AND TRIM(COALESCE(m.english, '')) <> ''
            AND m.english NOT IN (SELECT english FROM chips)
          ORDER BY m.english
          LIMIT 50`,
        [q, CHIP_COUNT]
      );
      return NextResponse.json({ success: true, data: rows });
    }

    // The chip list. Counts are over hadiths, not machine_clauses, because a
    // narrator's weight is how many hadiths they carry.
    const { rows } = await pool.query(
      `SELECT m.english AS narrator,
              MIN(m.machine_clause) AS narrator_ar,
              COUNT(*)::int AS hadiths
         FROM hadiths h
         JOIN machine_clauses m ON h.machine_clause = m.machine_clause
        WHERE m.english IS NOT NULL AND TRIM(m.english) <> ''
        GROUP BY m.english
        ORDER BY hadiths DESC
        LIMIT $1`,
      [CHIP_COUNT]
    );

    return NextResponse.json({ success: true, data: rows });
  } catch (error) {
    console.error('Narrators error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to load narrators', details: error.message },
      { status: 500 }
    );
  }
}