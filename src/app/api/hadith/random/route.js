// src/app/api/hadith/random/route.js
import { pool } from '../../../../lib/db';
import { NextResponse } from 'next/server';

const AZAMI = 'الأعظمي';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const language = searchParams.get('lang') || 'en';
    const textColumn = language === 'ar' ? 'final_hadith' : 'post_clause_english';

    // ORDER BY RANDOM() sorts all 80,661 rows to pick one. It's wasteful but
    // it's correct, and this route runs once per page load — not per keystroke.
    // If it ever feels slow, the trick is TABLESAMPLE or an offset on a random
    // id. Not worth the complexity today.
    const result = await pool.query(`
      SELECT
        CASE WHEN h.compiler = '${AZAMI}' THEN 'azami-' ELSE 'sevenbooks-' END || h.id::text AS id,
        h.hadith_number,
        h.compiler,
        h.volume,
        h.book,
        h.section,
        h.chapter,
        h.final_grade     AS grade,
        h.commentary_1    AS commentary,
        NULL::text        AS reference,
        h.${textColumn}   AS hadith_text,
        CASE WHEN h.compiler = '${AZAMI}' THEN 'azami' ELSE 'sevenbooks' END AS source
      FROM hadiths h
      WHERE h.${textColumn} IS NOT NULL
        AND TRIM(h.${textColumn}) != ''
      ORDER BY RANDOM()
      LIMIT 1
    `);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No hadiths found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch random hadith', details: error.message },
      { status: 500 }
    );
  }
}