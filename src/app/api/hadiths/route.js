// src/app/api/hadiths/route.js
import { pool } from '../../../lib/db';
import { NextResponse } from 'next/server';

const AZAMI = 'الأعظمي';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    const language = searchParams.get('lang') || 'en';
    const compiler = searchParams.get('compiler');
    const grade    = searchParams.get('grade');
    const chapter  = searchParams.get('chapter');
    const section  = searchParams.get('section');
    const limit    = parseInt(searchParams.get('limit'))  || 20;
    const offset   = parseInt(searchParams.get('offset')) || 0;

    const textColumn = language === 'ar' ? 'final_hadith' : 'post_clause_english';

    // One table. The UNION is gone.
    //
    // Column renames from the old schema:
    //   grade                 -> final_grade
    //   commentary            -> commentary_1
    //   commentary_darussalam -> commentary_1
    //   hadith_sources        -> gone (returned as NULL)
    const params = [];
    const conditions = [
      `h.${textColumn} IS NOT NULL`,
      `TRIM(h.${textColumn}) != ''`,
    ];

    if (compiler) {
      params.push(compiler);
      conditions.push(`LOWER(h.compiler) = LOWER($${params.length})`);
    }
    if (grade) {
      params.push(grade);
      conditions.push(`LOWER(h.final_grade) = LOWER($${params.length})`);
    }
    if (chapter) {
      params.push(`%${chapter}%`);
      conditions.push(`LOWER(h.chapter) LIKE LOWER($${params.length})`);
    }
    if (section) {
      params.push(`%${section}%`);
      conditions.push(`LOWER(h.section) LIKE LOWER($${params.length})`);
    }

    const where = conditions.join(' AND ');

    // Count first, with the same params and no limit/offset.
    const countResult = await pool.query(
      `SELECT COUNT(*) AS total FROM hadiths h WHERE ${where}`,
      params
    );
    const total = parseInt(countResult.rows[0].total);

    // hadith_number is TEXT — sort numerically, tiebreak on the raw value
    // so 7008A / 7008B stay together and in order.
    params.push(limit, offset);

    const result = await pool.query(`
      SELECT
        CASE WHEN h.compiler = '${AZAMI}' THEN 'azami-' ELSE 'sevenbooks-' END || h.id::text AS id,
        h.hadith_number,
        h.compiler,
        h.volume,
        h.book,
        h.section,
        h.chapter,
        h.final_grade         AS grade,
        h.commentary_1        AS commentary,
        NULL::text            AS reference,
        h.${textColumn}       AS hadith_text,
        NULL::boolean         AS is_verified,
        CASE WHEN h.compiler = '${AZAMI}' THEN 'azami' ELSE 'sevenbooks' END AS source
      FROM hadiths h
      WHERE ${where}
      ORDER BY
        NULLIF(regexp_replace(h.hadith_number, '\\D', '', 'g'), '')::bigint,
        h.hadith_number
      LIMIT $${params.length - 1} OFFSET $${params.length}
    `, params);

    return NextResponse.json({
      success: true,
      data: result.rows,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch hadiths', details: error.message },
      { status: 500 }
    );
  }
}