// src/app/api/grades/route.js
import { pool } from '../../../lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Old schema had two different column names (azami.grade, sevenbooks.final_grade).
    // Now there is one: final_grade. Aliased back to `grade` so the frontend
    // keeps reading the same field name.
    const result = await pool.query(`
      SELECT DISTINCT final_grade AS grade
      FROM hadiths
      WHERE final_grade IS NOT NULL AND final_grade != ''
      ORDER BY grade
    `);

    return NextResponse.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch grades', details: error.message },
      { status: 500 }
    );
  }
}