// src/app/api/books-by-compiler/route.js
import { pool } from '../../../lib/db';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const compiler = searchParams.get('compiler');

    if (!compiler) {
      return NextResponse.json(
        { success: false, error: 'compiler parameter required' },
        { status: 400 }
      );
    }

    // Returns three things per book:
    //
    //   value     — the RAW `book` column. This is the identity. It's what gets
    //               sent back as a filter, and what the hadiths table stores.
    //   label_ar  — `book_stripped`: the same name minus the leading "كتاب".
    //   label_en  — `book_stripped_english`.
    //
    // The labels are for READING ONLY. Do not filter on them.
    //
    // Why: 1,277 distinct raw books collapse into only 1,272 stripped names —
    // five different books share a stripped name. Filtering on the stripped
    // value would silently merge those and return the wrong hadiths. The raw
    // value stays the key; stripped is cosmetic.
    const result = await pool.query(`
      SELECT DISTINCT
        book                  AS value,
        book_stripped         AS label_ar,
        book_stripped_english AS label_en
      FROM hadiths
      WHERE compiler = $1
        AND book IS NOT NULL
        AND TRIM(book) != ''
      ORDER BY book
    `, [compiler]);

    return NextResponse.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch books', details: error.message },
      { status: 500 }
    );
  }
}