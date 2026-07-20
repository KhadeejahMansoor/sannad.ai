// src/app/api/sections-by-chapter/route.js
//
// Distinct sections for a given (compiler, book, chapter).
//
// Only Azami has sections — all 16,546 of them. The other eight compilers have
// section = NULL throughout, so this returns an empty array for them. That's
// correct, not a failure.

import { pool } from '../../../lib/db';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const compiler = searchParams.get('compiler');
    const book     = searchParams.get('book');      // raw value
    const chapter  = searchParams.get('chapter');   // raw value

    if (!compiler || !book || !chapter) {
      return NextResponse.json(
        { success: false, error: 'compiler, book, and chapter parameters are all required' },
        { status: 400 }
      );
    }

    // Same shape as books and chapters:
    //
    //   value     — raw `section`. The identity. Filter on this.
    //   label_ar  — `section_stripped`  ("باب إنما الأعمال بالنيات" -> "إنما الأعمال بالنيات")
    //   label_en  — `section_stripped_english`  ("Actions are but by intentions")
    //
    // Sections happen to be 1:1 raw-to-stripped (5,967 either way), unlike books
    // and chapters. Still filter on `value` — the labels are for reading, and
    // keeping all three routes identical means one fewer thing to remember.
    const result = await pool.query(`
      SELECT DISTINCT
        section                  AS value,
        section_stripped         AS label_ar,
        section_stripped_english AS label_en
      FROM hadiths
      WHERE compiler = $1
        AND book = $2
        AND chapter = $3
        AND section IS NOT NULL
        AND TRIM(section) != ''
      ORDER BY section
    `, [compiler, book, chapter]);

    return NextResponse.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch sections', details: error.message },
      { status: 500 }
    );
  }
}