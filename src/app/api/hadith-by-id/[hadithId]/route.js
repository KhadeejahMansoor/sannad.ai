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
        h.red_flag,
        h.final_hadith,
        h.collection,
        h.collection_english,
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
        h.final_grader_description AS final_grader_description,
        -- Commentary comes as up to two attributed entries. Slot 1 is one of
        -- three scholars, named in commentary_person_1. Slots 2 and 3 were
        -- pivoted into named columns on import, so their author is implied by
        -- the column itself (ibn_hajar / hadi) and needs no person field.
        --
        -- The _english columns were already in the table and never selected,
        -- which is why the panel could only ever render Arabic.
        h.commentary_1             AS commentary,
        h.commentary_person_1      AS commentary_person_1,
        h.commentary_1             AS commentary_1,
        h.commentary_1_english     AS commentary_1_english,
        h.ibn_hajar                AS commentary_2,
        h.commentary_2_english     AS commentary_2_english,
        h.hadi                     AS commentary_3,
        h.commentary_3_english     AS commentary_3_english,
        NULL::text                 AS reference,
        h.matched_hadith           AS matched_hadith,
        h.ayat                     AS ayat,
        NULL::text                 AS duplicates,
        NULLIF(TRIM(h.post_clause_english), '') AS hadith_text,
        NULLIF(TRIM(h.post_clause_english), '') AS hadith_text_english,
        -- final_hadith is chain + intro + post already concatenated. Returning
        -- it here put the isnad inline at the top of the Arabic body instead of
        -- on its own bold line. Falls back to final_hadith where post_clause
        -- is empty (~0.5% of rows).
        COALESCE(NULLIF(TRIM(h.post_clause), ''), h.final_hadith)
                                   AS hadith_text_arabic,
        h.chain_clause             AS chain_clause,
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