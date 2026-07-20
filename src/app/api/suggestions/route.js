// src/app/api/suggestions/route.js
import { pool } from '../../../lib/db';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const term = searchParams.get('term') || '';
    const language = searchParams.get('lang') || 'en';

    if (term.trim().length < 2) {
      return NextResponse.json({ success: true, data: [] });
    }

    // Which text to show back to the user.
    const textColumn = language === 'ar' ? 'final_hadith' : 'post_clause_english';

    // Match against BOTH vectors — same reasoning as /api/search. Picking one
    // by `lang` meant Arabic typed while the UI was on English matched nothing.
    //
    // This also replaces the old ILIKE '%term%', which scanned all 80,661 rows
    // on every keystroke. Autocomplete is the worst possible place for a full
    // table scan — it fires constantly. Now it's two GIN index lookups.
    const result = await pool.query(`
      SELECT DISTINCT ${textColumn} AS suggestion
      FROM hadiths h
      WHERE (
              h.search_vector    @@ websearch_to_tsquery('arabic',  $1)
              OR
              h.search_vector_en @@ websearch_to_tsquery('english', $1)
            )
        AND h.${textColumn} IS NOT NULL
        AND TRIM(h.${textColumn}) != ''
      LIMIT 10
    `, [term]);

    return NextResponse.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Suggestions error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch suggestions' },
      { status: 500 }
    );
  }
} 