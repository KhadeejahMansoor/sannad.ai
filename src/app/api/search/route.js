// src/app/api/search/route.js
import { pool } from '../../../lib/db';
import { NextResponse } from 'next/server';
import { compilerToDb, COMPILER_KEYS } from '../../../lib/i18n';

const AZAMI = 'الأعظمي';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const searchQuery = (searchParams.get('q') || '').trim();
    const language = searchParams.get('lang') || 'en';

    const compilerCsv = (searchParams.get('compiler') || '').trim();
    const gradeCsv    = (searchParams.get('grade')    || '').trim();
    const compilers = compilerCsv ? compilerCsv.split(',').map(s => s.trim()).filter(Boolean) : [];
    const grades    = gradeCsv    ? gradeCsv.split(',').map(s => s.trim()).filter(Boolean)    : [];

    const hasText = searchQuery.length > 0;
    const hasFilters = compilers.length > 0 || grades.length > 0;

    if (!hasText && !hasFilters) {
      return NextResponse.json({ success: true, data: [] });
    }

    const isArabic = language === 'ar';

    // `lang` still decides which text is DISPLAYED. That part was always right.
    const textColumn = isArabic ? 'final_hadith' : 'post_clause_english';

    const params = [];
    const conditions = [];

    // ── Search both languages, always ─────────────────────────────────
    //
    // The previous version picked ONE vector from the `lang` param:
    //
    //     isArabic ? 'search_vector' : 'search_vector_en'
    //
    // So an Arabic query, while the UI sat on its default lang=en, got matched
    // against search_vector_en — an index built only from the English
    // translation column. Arabic word, English index, zero results. Correctly
    // zero, and completely useless.
    //
    // Verified in SQL: 'صلاة' against search_vector returns 7,546 rows. The
    // database was never the problem.
    //
    // Now we check both vectors and take a hit in either. Someone typing Arabic
    // finds Arabic hadiths whether or not they flipped a toggle first, and the
    // same for English. The user shouldn't have to tell the search engine what
    // alphabet they're using — it can see that.
    //
    // Cost: two GIN lookups instead of one. A word in one script simply isn't
    // in the other's index, so the "wrong" half costs almost nothing.
    // ── "Compiler name + hadith number" typed into the single search box ──
    // e.g. "Tirmidhi 1234" or "1234 Tirmidhi". search_vector / search_vector_en
    // are built from hadith CONTENT only — they never contain the compiler name
    // or hadith_number, so this pattern always matched zero rows below. Detect
    // it here and match h.compiler + h.hadith_number directly instead.
    let compilerNumberHit = null;
    if (hasText) {
      const m =
        searchQuery.match(/^(\D+?)\s*#?\s*(\d+[A-Za-z]?)$/) ||
        searchQuery.match(/^(\d+[A-Za-z]?)\s*#?\s*(\D+)$/);
      if (m) {
        const [, part1, part2] = m;
        const namePart = /^\d/.test(part1) ? part2 : part1;
        const numberPart = /^\d/.test(part1) ? part1 : part2;
        const matchedKey = COMPILER_KEYS.find(
          (k) => k.toLowerCase() === namePart.trim().toLowerCase()
        );
        if (matchedKey) {
          compilerNumberHit = { compiler: compilerToDb(matchedKey), number: numberPart.trim() };
        }
      }
    }

    if (compilerNumberHit) {
      params.push(compilerNumberHit.compiler);
      conditions.push(`h.compiler = $${params.length}`);
      params.push(compilerNumberHit.number);
      conditions.push(`h.hadith_number = $${params.length}`);
    } else if (hasText) {
      params.push(searchQuery);
      const q = `$${params.length}`;
      conditions.push(`(
        h.search_vector    @@ websearch_to_tsquery('arabic',  ${q})
        OR
        h.search_vector_en @@ websearch_to_tsquery('english', ${q})
      )`);
    }

    if (compilers.length > 0) {
      params.push(compilers);
      conditions.push(`h.compiler = ANY($${params.length}::text[])`);
    }
    if (grades.length > 0) {
      params.push(grades);
      conditions.push(`h.final_grade = ANY($${params.length}::text[])`);
    }

    const where = conditions.join(' AND ');

    // Rank across both vectors. GREATEST takes whichever language actually
    // matched — a hit in one and a miss in the other scores on the hit.
    //
    // hadith_number is TEXT ("7008A" exists), so strip the letters and cast the
    // digits, or the fallback order comes out 1, 10, 100, 2.
    const numericOrder = `NULLIF(regexp_replace(h.hadith_number, '\\D', '', 'g'), '')::bigint`;

    const orderBy = hasText && !compilerNumberHit
      ? `GREATEST(
           ts_rank(h.search_vector,    websearch_to_tsquery('arabic',  $1)),
           ts_rank(h.search_vector_en, websearch_to_tsquery('english', $1))
         ) DESC,
         ${numericOrder},
         h.hadith_number`
      : `h.compiler,
         ${numericOrder},
         h.hadith_number`;

    params.push(language);
    const langIdx = params.length;

    const result = await pool.query(`
      SELECT
        CASE WHEN h.compiler = '${AZAMI}' THEN 'azami-' ELSE 'sevenbooks-' END
          || h.id::text             AS hadith_id,
        h.hadith_number,
        h.compiler,
        h.volume,
        h.book,
        h.section,
        h.chapter,
        h.final_grade               AS grade,
        COALESCE(NULLIF(TRIM(h.final_grader), ''), 'Unknown') AS final_grader,
        h.commentary_1              AS commentary,
        NULL::text                  AS reference,
        h.matched_hadith            AS matched_hadith,
        h.ayat                      AS ayat,
        NULL::text                  AS duplicates,
        NULL::boolean               AS is_verified,
        h.${textColumn}             AS hadith_text,
        h.final_hadith              AS hadith_text_arabic,
        h.post_clause_english       AS hadith_text_english,
        h.machine_clause,
        h.intro_clause              AS arabic_intro_clause,
        m.english                   AS english_narrator,
        CASE WHEN h.compiler = '${AZAMI}' THEN 'azami' ELSE 'sevenbooks' END AS source,
        $${langIdx}::text           AS language_code,
        CASE WHEN $${langIdx} = 'ar' THEN 'Arabic' ELSE 'English' END AS language_name,
        CASE WHEN $${langIdx} = 'ar' THEN 'rtl'    ELSE 'ltr'     END AS text_direction
      FROM hadiths h
      LEFT JOIN machine_clauses m ON h.machine_clause = m.machine_clause
      WHERE ${where}
      ORDER BY ${orderBy}
      LIMIT 200
    `, params);

    return NextResponse.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { success: false, error: 'Search failed', details: error.message },
      { status: 500 }
    );
  }
}