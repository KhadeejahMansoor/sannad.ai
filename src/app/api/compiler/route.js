// src/app/api/compiler/route.js
import { pool } from '../../../lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Nine compilers now, not two collections.
    const result = await pool.query(`
      SELECT DISTINCT compiler
      FROM hadiths
      WHERE compiler IS NOT NULL
      ORDER BY compiler
    `);

    return NextResponse.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch compiler' },
      { status: 500 }
    );
  }
}