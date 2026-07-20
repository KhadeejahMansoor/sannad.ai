// src/app/api/hadith/[number]/route.js
//
// Lookup by hadith NUMBER (not database id).
//
// ⚠️ Two things were broken here, both silent:
//
// 1. The old code did `parseInt(number)` and rejected NaN. But parseInt("7008A")
//    returns 7008 — it stops at the letter without complaining. So a request for
//    7008A quietly fetched 7008 instead, and nobody would ever know. Hadith
//    numbers are TEXT now and are treated as text.
//
// 2. It queried `WHERE hadith_number = $1` with no compiler. In the old two-table
//    world that was merely sloppy. Now all nine compilers live in one table and
//    every one of them has a hadith #1 — the query would return whichever row
//    Postgres happened to reach first. Nondeterministic.
//
// So `compiler` is now required. `source` is still accepted for backward
// compatibility but is no longer used to pick a table; there's only one.

import { pool } from '@/lib/db';
import { NextResponse } from 'next/server';

const AZAMI = 'الأعظمي';

export async function GET(request, { params }) {
  try {
    const { number } = await params;
    const { searchParams } = new URL(request.url);
    const compiler = searchParams.get('compiler');

    const hadithNumber = String(number || '').trim();

    if (!hadithNumber) {
      return NextResponse.json(
        { success: false, error: 'Hadith number is required' },
        { status: 400 }
      );
    }

    if (!compiler) {
      return NextResponse.json(
        {
          success: false,
          error: 'compiler parameter is required — hadith numbers are only unique within a compiler',
        },
        { status: 400 }
      );
    }

    const result = await pool.query(`
      SELECT
        CASE WHEN h.compiler = $3 THEN 'azami-' ELSE 'sevenbooks-' END
          || h.id::text            AS id,
        h.hadith_number,
        h.created_at,
        h.volume                   AS primary_volume,
        h.book                     AS primary_book,
        h.compiler                 AS primary_compiler,
        h.post_clause_english      AS primary_text,
        h.final_grade              AS primary_grade,
        NULL::text                 AS primary_reference,
        h.commentary_1             AS primary_commentary,
        h.section                  AS primary_section,
        h.chapter                  AS primary_chapter,
        h.volume                   AS secondary_volume,
        h.book                     AS secondary_book,
        h.compiler                 AS secondary_compiler,
        h.final_hadith             AS secondary_text,
        h.final_grade              AS secondary_grade,
        NULL::text                 AS secondary_reference,
        h.commentary_1             AS secondary_commentary,
        h.section                  AS secondary_section,
        h.chapter                  AS secondary_chapter,
        CASE WHEN h.compiler = $3 THEN 'azami' ELSE 'sevenbooks' END AS source
      FROM hadiths h
      WHERE h.hadith_number = $1
        AND h.compiler = $2
      LIMIT 1
    `, [hadithNumber, compiler, AZAMI]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Hadith not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch hadith', details: error.message },
      { status: 500 }
    );
  }
}