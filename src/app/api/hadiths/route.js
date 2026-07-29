// src/app/api/search/route.js
//
// Why this exists: supabase.rpc('search_hadiths') goes through PostgREST,
// which clamps every response to its db_max_rows setting. That setting is
// stuck at 1000 on this project and the `authenticator` role is reserved, so
// it can't be raised from SQL. This route calls the same function over the
// direct pg pool — the connection /api/hadiths already uses — which never
// touches PostgREST and therefore has no cap.
//
// Returns result.rows untouched. useData already maps the RPC's raw column
// names onto the card fields, so that mapping keeps working as-is.
import { pool } from '../../../lib/db';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();

    // Empty arrays must become NULL, not '{}'. The function treats NULL as
    // "no filter"; an empty array would match nothing.
    const arr = (v) => (Array.isArray(v) && v.length ? v : null);

    // Named notation rather than positional. These six names are the ones
    // useData already passes to supabase.rpc successfully, so they're known
    // good; positional order is not something to guess at.
    const sql = `
      SELECT * FROM search_hadiths(
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