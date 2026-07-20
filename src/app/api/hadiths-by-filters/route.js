// src/app/api/hadiths-by-filters/route.js
import { pool } from '../../../lib/db';
import { NextResponse } from 'next/server';

const AZAMI = 'الأعظمي';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const compiler = searchParams.get('compiler');
    const book     = searchParams.get('book')    || null;
    const chapter  = searchParams.get('chapter') || null;
    const section  = searchParams.get('section') || null;
    const limit    = parseInt(searchParams.get('limit'))  || 50;
    const offset   = parseInt(searchParams.get('offset')) || 0;

    if (!compiler) {
      return NextResponse.json(
        { success: false, error: 'compiler parameter required' },
        { status: 400 }
      );
    }

    const params = [compiler];
    let where = 'h.compiler = $1';

    if (book) {
      params.push(book);
      where += ` AND h.book = $${params.length}`;
    }
    if (chapter) {
      params.push(chapter);
      where += ` AND h.chapter = $${params.length}`;
    }
    if (section) {
      params.push(section);
      where += ` AND h.section = $${params.length}`;
    }

    const countResult = await pool.query(
      `SELECT COUNT(*) AS total FROM hadiths h WHERE ${where}`,
      params
    );
    const total = parseInt(countResult.rows[0].total);

    params.push(limit, offset);

    // ── The two texts are now kept SEPARATE and honest ────────────────
    //
    // The stopgap COALESCE (english, else arabic) is gone. It solved Malik's
    // blank cards by quietly putting Arabic in the English slot — fine when
    // the card showed one text, actively wrong now that it shows both. The
    // bilingual card would have rendered the same Arabic paragraph twice.
    //
    // So:
    //   hadith_text_arabic   — always present (final_hadith is 100% filled)
    //   hadith_text_english  — NULL when there is no translation
    //
    // Malik has 0 English translations out of 1,952. The component can now see
    // that and say so, instead of pretending.
    //
    // `hadith_text` is kept as an alias of the English for any older component
    // still reading it. New code should use the explicit names.
    const result = await pool.query(`
      SELECT
        CASE WHEN h.compiler = '${AZAMI}' THEN 'azami-' ELSE 'sevenbooks-' END
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
        h.final_hadith             AS hadith_text_arabic,
        NULLIF(TRIM(h.post_clause_english), '') AS hadith_text_english,
        NULLIF(TRIM(h.post_clause_english), '') AS hadith_text,
        h.machine_clause,
        h.intro_clause             AS arabic_intro_clause,
        m.english                  AS english_narrator,
        CASE WHEN h.compiler = '${AZAMI}' THEN 'azami' ELSE 'sevenbooks' END AS source
      FROM hadiths h
      LEFT JOIN machine_clauses m ON h.machine_clause = m.machine_clause
      WHERE ${where}
      ORDER BY
        NULLIF(regexp_replace(h.hadith_number, '\\D', '', 'g'), '')::bigint,
        h.hadith_number
      LIMIT $${params.length - 1} OFFSET $${params.length}
    `, params);

    return NextResponse.json({
      success: true,
      data: result.rows,
      pagination: { total, limit, offset, hasMore: offset + limit < total },
    });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch hadiths', details: error.message },
      { status: 500 }
    );
  }
}