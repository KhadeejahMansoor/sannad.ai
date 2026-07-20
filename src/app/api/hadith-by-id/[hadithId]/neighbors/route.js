// src/app/api/hadith-by-id/[hadithId]/neighbors/route.js
//
// Previous / next hadith within the same compiler. The list is CIRCULAR:
// "back" from the first hadith wraps to the last, "next" from the last wraps to
// the first. Bukhari 1 -> back -> Bukhari 7563.
//
// ⚠️ hadith_number is TEXT — it has to be, because "7008A" and "8571C" exist.
// Comparing text compares alphabetically, so '999' < '9990' and the hadith after
// 999 would be 9990 rather than 1000. Silently wrong, never an error.
//
// So we sort on the pair (digits-as-number, raw-text). Postgres compares tuples
// left to right, which orders numerically first and keeps 7008A / 7008B / 7008C
// adjacent and in sequence — the same ordering the listing page uses, so prev
// and next agree with what the user sees in the list.

import { pool } from '@/lib/db';
import { NextResponse } from 'next/server';

const AZAMI = 'الأعظمي';

// digits only, cast to a number. "7008A" -> 7008
const NUM = `NULLIF(regexp_replace(hadith_number, '\\D', '', 'g'), '')::bigint`;

export async function GET(_request, { params }) {
  try {
    const { hadithId } = await params;

    if (!hadithId || typeof hadithId !== 'string') {
      return NextResponse.json(
        { success: false, error: 'hadithId is required' },
        { status: 400 }
      );
    }

    const dashIndex = hadithId.indexOf('-');
    const numericIdRaw = dashIndex === -1 ? hadithId : hadithId.slice(dashIndex + 1);
    const numericId = parseInt(numericIdRaw, 10);

    if (Number.isNaN(numericId)) {
      return NextResponse.json(
        { success: false, error: "Invalid hadithId. Expected '<source>-<id>' or '<id>'." },
        { status: 400 }
      );
    }

    // Where are we?
    const currentRes = await pool.query(
      `SELECT compiler, hadith_number, ${NUM} AS num FROM hadiths WHERE id = $1 LIMIT 1`,
      [numericId]
    );
    if (currentRes.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Hadith not found' },
        { status: 404 }
      );
    }
    const { compiler, hadith_number, num } = currentRes.rows[0];

    // ── Previous ──────────────────────────────────────────────────────
    // Largest row strictly below us. If there isn't one we're at the start,
    // so wrap to the very last hadith of this compiler.
    const prevRes = await pool.query(`
      SELECT * FROM (
        SELECT id, hadith_number, compiler, 1 AS rank
        FROM hadiths
        WHERE compiler = $1
          AND (${NUM}, hadith_number) < ($2::bigint, $3::text)
        ORDER BY ${NUM} DESC, hadith_number DESC
        LIMIT 1
      ) AS strictly_before
      UNION ALL
      SELECT * FROM (
        SELECT id, hadith_number, compiler, 2 AS rank
        FROM hadiths
        WHERE compiler = $1
        ORDER BY ${NUM} DESC, hadith_number DESC
        LIMIT 1
      ) AS wrap_to_last
      ORDER BY rank
      LIMIT 1
    `, [compiler, num, hadith_number]);

    // ── Next ──────────────────────────────────────────────────────────
    // Smallest row strictly above us, else wrap to the first.
    const nextRes = await pool.query(`
      SELECT * FROM (
        SELECT id, hadith_number, compiler, 1 AS rank
        FROM hadiths
        WHERE compiler = $1
          AND (${NUM}, hadith_number) > ($2::bigint, $3::text)
        ORDER BY ${NUM} ASC, hadith_number ASC
        LIMIT 1
      ) AS strictly_after
      UNION ALL
      SELECT * FROM (
        SELECT id, hadith_number, compiler, 2 AS rank
        FROM hadiths
        WHERE compiler = $1
        ORDER BY ${NUM} ASC, hadith_number ASC
        LIMIT 1
      ) AS wrap_to_first
      ORDER BY rank
      LIMIT 1
    `, [compiler, num, hadith_number]);

    // A compiler with exactly one hadith would wrap onto itself. Return null
    // rather than a button that goes nowhere.
    const formatRow = (row) => {
      if (!row || row.id === numericId) return null;
      return {
        hadith_id: `${row.compiler === AZAMI ? 'azami' : 'sevenbooks'}-${row.id}`,
        hadith_number: row.hadith_number,
      };
    };

    return NextResponse.json({
      success: true,
      data: {
        prev: formatRow(prevRes.rows[0]),
        next: formatRow(nextRes.rows[0]),
      },
    });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch neighbors', details: error.message },
      { status: 500 }
    );
  }
}