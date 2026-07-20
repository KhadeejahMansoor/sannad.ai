// src/app/api/chapters-by-book/route.js
import { pool } from '../../../lib/db';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const compiler = searchParams.get('compiler');
    const book = searchParams.get('book');   // raw `book` value, not a label

    if (!compiler || !book) {
      return NextResponse.json(
        { success: false, error: 'compiler and book parameters both required' },
        { status: 400 }
      );
    }

    // Same shape as /api/books-by-compiler:
    //
    //   value     — raw `chapter`. The identity. Filter on this.
    //   label_ar  — `chapter_stripped`  (prefix removed, e.g. "خصال الإيمان")
    //   label_en  — `chapter_stripped_english`  (e.g. "Qualities of faith")
    //
    // Labels are display-only. 13,034 raw chapters collapse to 13,016 stripped
    // names — 18 stripped names are shared by more than one chapter — so
    // filtering on a label would merge distinct chapters.
    const result = await pool.query(`
      SELECT DISTINCT
        chapter                  AS value,
        chapter_stripped         AS label_ar,
        chapter_stripped_english AS label_en
      FROM hadiths
      WHERE compiler = $1
        AND book = $2
        AND chapter IS NOT NULL
        AND TRIM(chapter) != ''
      ORDER BY chapter
    `, [compiler, book]);

    return NextResponse.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch chapters', details: error.message },
      { status: 500 }
    );
  }
}