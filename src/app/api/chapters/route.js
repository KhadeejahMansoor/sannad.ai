// src/app/api/chapters/route.js
import { pool } from '../../../lib/db';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const result = await pool.query(`
      SELECT DISTINCT TRIM(chapter) AS chapter
      FROM hadiths
      WHERE chapter IS NOT NULL AND TRIM(chapter) != ''
      ORDER BY chapter
    `);

    return NextResponse.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch chapters', details: error.message },
      { status: 500 }
    );
  }
}