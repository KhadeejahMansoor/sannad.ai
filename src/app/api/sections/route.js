// src/app/api/sections/route.js
import { pool } from '../../../lib/db';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    // Only Azami rows carry a section — every other compiler is NULL here.
    // The WHERE clause below filters them out on its own; no need to name Azami.
    const result = await pool.query(`
      SELECT DISTINCT TRIM(section) AS section
      FROM hadiths
      WHERE section IS NOT NULL AND TRIM(section) != ''
      ORDER BY section
    `);

    return NextResponse.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch sections', details: error.message },
      { status: 500 }
    );
  }
}