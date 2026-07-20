// src/app/api/hadith-by-id/[hadithId]/route.js
//
// Single hadith by compound id, e.g. "azami-1103" / "sevenbooks-43180".

import { pool } from '@/lib/db';
import { NextResponse } from 'next/server';

const AZAMI = 'الأعظمي';

export async function GET(_request, { params }) {
  try {
    const { hadithId } = await params;

    if (!hadithId || typeof hadithId !== 'string') {
      return NextResponse.json(
        { success: false, error: 'hadithId is required' },
        { status: 400 }
      );
    }

    // Accept "azami-42", "sevenbooks-42", or a bare "42".
    const dashIndex = hadithId.indexOf('-');
    const numericIdRaw = dashIndex === -1 ? hadithId : hadithId.slice(dashIndex + 1);
    const numericId = parseInt(numericIdRaw, 10);

    if (Number.isNaN(numericId)) {
      return NextResponse.json(
        { success: false, error: "Invalid hadithId. Expected '<source>-<id>' or '<id>'." },
        { status: 400 }
      );
    }

    const result = await pool.query(`
      SELECT
        CASE WHEN h.compiler = $2 THEN 'azami-' ELSE 'sevenbooks-' END
          || h.id::text            AS hadith_id,
        h.hadith_number,
        h.compiler,
        h.volume,
        h.book,
        h.section,
        h.chapter,
        h.book_stripped,
        h.chapter_stripped,
        h.section_stripped,
        h.book_stripped_english,
        h.chapter_stripped_english,
        h.section_stripped_english,
        h.final_grade              AS grade,
        COALESCE(NULLIF(TRIM(h.final_grader), ''), 'Unknown') AS final_grader,
        h.commentary_1             AS commentary,
        NULL::text                 AS reference,
        h.matched_hadith           AS matched_hadith,
        h.ayat                     AS ayat,
        NULL::text                 AS duplicates,
        NULLIF(TRIM(h.post_clause_english), '') AS hadith_text,
        NULLIF(TRIM(h.post_clause_english), '') AS hadith_text_english,
        h.final_hadith             AS hadith_text_arabic,
        h.machine_clause,
        h.intro_clause             AS arabic_intro_clause,
        m.english                  AS english_narrator,
        CASE WHEN h.compiler = $2 THEN 'azami' ELSE 'sevenbooks' END AS source
      FROM hadiths h
      LEFT JOIN machine_clauses m ON h.machine_clause = m.machine_clause
      WHERE h.id = $1
      LIMIT 1
    `, [numericId, AZAMI]);

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