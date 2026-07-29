// src/app/api/search/route.js
//
// Calls search_hadiths over the direct pg pool instead of supabase.rpc.
// PostgREST clamps every response to db_max_rows (stuck at 1000 here, and the
// authenticator role is reserved so it can't be raised from SQL). The pool
// connection never touches PostgREST, so there's no cap.
//
// The column list is explicit and deliberately EXCLUDES the commentary bodies:
//   commentary_1 / _2 / _3 and their _english translations
// Those run to thousands of characters each and a full-collection result set
// blew past Vercel's ~4.5MB response limit, which is why the browser got an
// empty body and "Unexpected end of JSON input" rather than an error.
// They're fetched per-hadith when a card expands instead.
import { pool } from '../../../lib/db';
import { NextResponse } from 'next/server';

// Everything useData's mapping reads, minus the commentary bodies. If any of
// these names isn't in the function's return type Postgres will say so by
// name, and you can drop it from this list.
const COLUMNS = [
  'id',
  'hadith_number',
  'compiler',
  'final_grade',
  'final_grader',
  'final_grader_description',
  'intro_clause',
  'chain_clause',
  'machine_clause',
  'post_clause',
  'post_clause_english',
  'english_narrator',
  'book',
  'book_stripped_english',
  'chapter',
  'chapter_stripped_english',
  'ayat',
  'matched_hadith',
  'qasim_number',
  'shaybani_number',
  'zuhri_number',
  'shakir_hadith_number',
  'sunnah_com_number',
  'daraqutni_hadith_number',
  'commentary_person_1',
  'score',
].join(', ');

export async function POST(request) {
  try {
    const body = await request.json();

    // Empty arrays must become NULL. The function reads NULL as "no filter";
    // an empty array would match nothing.
    const arr = (v) => (Array.isArray(v) && v.length ? v : null);

    const sql = `
      SELECT ${COLUMNS} FROM search_hadiths(
        q            => $1,
        f_compilers  => $2,
        f_grades     => $3,
        f_book       => $4,
        f_chapter    => $5,
        max_rows     => $6
      )
    `;

    const params = [
      body.q ? String(body.q).trim() : null,
      arr(body.f_compilers),
      arr(body.f_grades),
      body.f_book ?? null,
      body.f_chapter ?? null,
      Number.isFinite(Number(body.max_rows)) ? Number(body.max_rows) : 1000000,
    ];

    const result = await pool.query(sql, params);

    return NextResponse.json({
      success: true,
      data: result.rows,
      count: result.rows.length,
    });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { success: false, error: 'Search failed', details: error.message },
      { status: 500 }
    );
  }
}