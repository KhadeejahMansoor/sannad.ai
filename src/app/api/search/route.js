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
    // Paged. Returning every match at once killed the phone browser on broad
    // queries — 'salah' matches thousands of rows, and the page renders a card
    // for each. The count below is still computed over the WHOLE match set, so
    // the header can say '2,278 hadith' while only 50 are in the DOM.
    const limit = Math.min(parseInt(searchParams.get('limit'), 10) || 50, 500);
    const offset = Math.max(parseInt(searchParams.get('offset'), 10) || 0, 0);

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

      // websearch_to_tsquery ANDs every unquoted word. Fine for two or three
      // terms; fatal for a pasted paragraph, where requiring all ~50 words in
      // one hadith matches nothing. So: keep the AND form (it honours "quoted
      // phrases" and -exclusions), and OR in a term-by-term query built by
      // swapping plainto_tsquery's & for |. A row matching ANY term is a
      // candidate; ts_rank below sorts by how many it matched, so the pasted
      // hadith still lands first.
      //
      // No rank threshold — a low-scoring tail is the price of finding the
      // row at all, and cutting it risks cutting a real match.
      //
      // NULLIF guards the empty query: plainto_tsquery('') is '', and ''::tsquery
      // matches nothing rather than erroring, but being explicit is cheaper to
      // read than being clever.
      // machine_clauses.english is the narrator name ("Abu Hurairah"), which
      // lives in a joined table and is in neither search_vector. Matched with
      // ILIKE, which the existing idx_trgm_machine_clause makes cheap.
      conditions.push(`(
        h.search_vector    @@ websearch_to_tsquery('arabic',  norm_ar(${q}))
        OR
        h.search_vector_en @@ websearch_to_tsquery('english', ${q})
        OR
        m.english ILIKE '%' || ${q} || '%'
        OR
        h.machine_clause ILIKE '%' || ${q} || '%'
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

    // Rank against the OR forms, not the AND forms. ts_rank scores by how many
    // query terms a row matched, so the hadith sharing 40 words with a pasted
    // paragraph outranks one sharing 'the'. Ranking on the AND query instead
    // would score every OR-matched row at 0 and leave the order arbitrary.
    //
    // The narrator match is added rather than GREATEST-ed: a row hitting both
    // the text and the narrator should beat one hitting only the text.
    // rankExpr is a function of the tsquery form so the two passes can share
    // it: pass 1 ranks against the AND query it filtered on, pass 2 against
    // the OR query. Ranking on the other pass's form would score every row 0.
    const rankExpr = (arQ, enQ) => `GREATEST(
           ts_rank(h.search_vector,    ${arQ}),
           ts_rank(h.search_vector_en, ${enQ})
         )
         + CASE WHEN m.english ILIKE '%' || $1 || '%'
                  OR h.machine_clause ILIKE '%' || $1 || '%' THEN 0.5 ELSE 0 END`;

    const strictRank = rankExpr(
      `websearch_to_tsquery('arabic',  norm_ar($1))`,
      `websearch_to_tsquery('english', $1)`,
    );

    const orderBy = hasText && !compilerNumberHit
      ? `${strictRank} DESC,
         ${numericOrder},
         h.hadith_number`
      : `h.compiler,
         ${numericOrder},
         h.hadith_number`;

    // Everything pushed so far belongs to the WHERE clause. The count query
    // below reuses that clause but not the SELECT or LIMIT, so it must be given
    // exactly these and no more: Postgres rejects a bind with more parameters
    // than the statement references, rather than ignoring the extras.
    const whereParams = [...params];

    params.push(language);
    const langIdx = params.length;
    params.push(limit);
    const limitIdx = params.length;
    params.push(offset);
    const offsetIdx = params.length;

    // One template, two passes. The strict pass fills it with the AND query;
    // the fallback below refills the same string with the OR query, so the
    // SELECT list and joins can never drift between them.
    const baseQuery = `      SELECT
        CASE WHEN h.compiler = '${AZAMI}' THEN 'azami-' ELSE 'sevenbooks-' END
          || h.id::text             AS hadith_id,
        h.hadith_number,
        h.compiler,
        h.volume,
        h.red_flag,
        h.final_hadith,
        h.collection,
        h.collection_english,
        h.book,
        h.section,
        h.chapter,
        h.final_grade               AS grade,
        COALESCE(NULLIF(TRIM(h.final_grader), ''), 'Unknown') AS final_grader,
        h.final_grader_description AS final_grader_description,
        -- The six commentary bodies are deliberately NOT selected here.
        --
        -- They run to thousands of characters each (one row's is 8,664), so a
        -- broad search like 'Abu Hurairah' — 5,792 rows — was pushing megabytes
        -- to the browser before anything could render. None of it is visible
        -- until the reader expands a card, so the list paid for it on every
        -- search and used it almost never.
        --
        -- commentary_person_1 stays: it's a short name, and the Details panel
        -- uses it to decide whether a Commentary tab is worth offering at all.
        -- The bodies themselves come from /api/hadith-by-id when a card opens.
        h.commentary_person_1      AS commentary_person_1,
        NULL::text                  AS reference,
        h.matched_hadith            AS matched_hadith,
        h.ayat                      AS ayat,
        NULL::text                  AS duplicates,
        NULL::boolean               AS is_verified,
        h.${textColumn}             AS hadith_text,
        -- The Arabic body is the POST clause, not final_hadith. final_hadith is
        -- chain + intro + post already concatenated, so returning it here put
        -- the isnad inline at the top of the body while the card's separate
        -- bold chain line sat empty. Falls back to final_hadith for the ~0.5%
        -- of rows with no post_clause.
        COALESCE(NULLIF(TRIM(h.post_clause), ''), h.final_hadith)
                                    AS hadith_text_arabic,
        -- Was never selected at all, so HadithCard's chainAr was always
        -- undefined and the bold chain line never rendered.
        h.chain_clause              AS chain_clause,
        h.post_clause_english       AS hadith_text_english,
        h.machine_clause,
        h.qasim_number,
        h.shaybani_number,
        h.zuhri_number,
        h.shakir_hadith_number,
        h.sunnah_com_number,
        h.daraqutni_hadith_number,
        h.book_stripped_english,
        h.chapter_stripped_english,
        h.intro_clause              AS arabic_intro_clause,
        m.english                   AS english_narrator,
        CASE WHEN h.compiler = '${AZAMI}' THEN 'azami' ELSE 'sevenbooks' END AS source,
        $${langIdx}::text           AS language_code,
        CASE WHEN $${langIdx} = 'ar' THEN 'Arabic' ELSE 'English' END AS language_name,
        CASE WHEN $${langIdx} = 'ar' THEN 'rtl'    ELSE 'ltr'     END AS text_direction
      FROM hadiths h
      LEFT JOIN machine_clauses m ON h.machine_clause = m.machine_clause
      WHERE __WHERE__
      ORDER BY __ORDER__
      LIMIT $${limitIdx} OFFSET $${offsetIdx}
    `;

    // Count and page in parallel. The count ignores LIMIT/OFFSET, so it reports
    // the true size of the match set however small a slice is being returned.
    // It reuses `params` unchanged — the extra limit/offset entries at the end
    // are simply unreferenced by this SQL, which Postgres allows.
    const countQuery = `
      SELECT COUNT(*)::int AS total
      FROM hadiths h
      LEFT JOIN machine_clauses m ON h.machine_clause = m.machine_clause
      WHERE __WHERE__
    `;

    const [result, countResult] = await Promise.all([
      pool.query(
        baseQuery.replace('__WHERE__', where).replace('__ORDER__', orderBy),
        params
      ),
      pool.query(countQuery.replace('__WHERE__', where), whereParams),
    ]);

    // websearch_to_tsquery ANDs every unquoted word, which is right for two or
    // three terms and fatal for a pasted paragraph: requiring all ~50 words in
    // one hadith matches nothing.
    //
    // The fix is a second pass that ORs the terms (swap plainto_tsquery's & for
    // |) and ranks by how many matched, so the pasted hadith still lands first.
    //
    // Run only when the strict pass found nothing. Running both every time is
    // what made 'Abu Hurairah' crawl — that query succeeds strictly, but the OR
    // arm was still dragging in every row containing 'abu' to be ranked and
    // sorted. Queries that match strictly never pay for this.
    let rows = result.rows;
    let total = countResult.rows[0]?.total ?? rows.length;

    if (rows.length === 0 && hasText && !compilerNumberHit) {
      const orAr = `NULLIF(replace(plainto_tsquery('arabic',  norm_ar($1))::text, '&', '|'), '')::tsquery`;
      const orEn = `NULLIF(replace(plainto_tsquery('english', $1)::text, '&', '|'), '')::tsquery`;

      // Same filters as the strict pass, with the text condition swapped for
      // the OR form. conditions[] can't be reused directly — its text clause is
      // baked in — so the query is rebuilt from the parts that don't change.
      const orConditions = conditions.map((c) =>
        c.includes('websearch_to_tsquery')
          ? `(h.search_vector @@ ${orAr} OR h.search_vector_en @@ ${orEn})`
          : c
      );

      const orWhere = orConditions.join(' AND ');

      const [orResult, orCount] = await Promise.all([
        pool.query(
          baseQuery
            .replace('__WHERE__', orWhere)
            .replace('__ORDER__', `${rankExpr(orAr, orEn)} DESC, ${numericOrder}, h.hadith_number`),
          params
        ),
        pool.query(countQuery.replace('__WHERE__', orWhere), whereParams),
      ]);
      rows = orResult.rows;
      total = orCount.rows[0]?.total ?? rows.length;
    }

    return NextResponse.json({
      success: true,
      data: rows,
      count: rows.length,
      total,
      offset,
      limit,
      hasMore: offset + rows.length < total,
    });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { success: false, error: 'Search failed', details: error.message },
      { status: 500 }
    );
  }
}