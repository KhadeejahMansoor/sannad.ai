// src/app/api/search/route.js
import { pool } from '../../../lib/db';
import { NextResponse } from 'next/server';
import { compilerToDb, COMPILER_KEYS } from '../../../lib/i18n';

const AZAMI = 'الأعظمي';

// Semantic half of the search. Full-text matches words; this matches meaning,
// which is the only way 'salah' finds الصلاة or 'charity' finds زكاة — no
// amount of stemming or normalisation crosses scripts.
//
// input_type MUST be 'query' here. The corpus was embedded with 'document';
// Voyage places the two in deliberately different regions, and mismatching
// them degrades results without producing any error.
const VOYAGE_URL = 'https://api.voyageai.com/v1/embeddings';

async function embedQuery(text) {
  const key = process.env.VOYAGE_API_KEY;
  if (!key) {
    console.warn('[search] VOYAGE_API_KEY not set — semantic search disabled');
    return null;
  }

  try {
    // Bounded wait. A slow embedding API must not hold up a search that
    // full-text can already answer.
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 8000);

    const res = await fetch(VOYAGE_URL, {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ input: [text], model: 'voyage-3', input_type: 'query' }),
      signal: ctrl.signal,
    });
    clearTimeout(timer);

    if (!res.ok) {
      console.warn('[search] voyage', res.status, (await res.text()).slice(0, 200));
      return null;
    }
    const json = await res.json();
    const vec = json?.data?.[0]?.embedding;
    return Array.isArray(vec) ? `[${vec.join(',')}]` : null;
  } catch (e) {
    // Every failure path returns null rather than throwing: semantic search is
    // an enhancement, and losing it should degrade the results, not the page.
    // Logged, though — a silent null is indistinguishable from a missing key.
    console.warn('[search] embed failed:', e.name, e.message);
    return null;
  }
}

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

    // Embedded up front because the WHERE clause below needs the vector.
    // Costs one API round trip (~100-300ms) on every text search; returns null
    // on failure or timeout, in which case everything downstream behaves
    // exactly as it did before semantic search existed.
    //
    // Skipped for a bare filter query, which has no text to embed, and for a
    // 'Tirmidhi 1' style lookup, where the answer is exact and semantic
    // neighbours would be noise.
    const queryVector = hasText ? await embedQuery(searchQuery) : null;

    // Nearest neighbours are fetched HERE, as their own statement, and passed
    // into the main query as a plain id array.
    //
    // The obvious formulation — OR h.id IN (SELECT ... ORDER BY embedding <=> v
    // LIMIT 200) — is a trap. Postgres cannot use an index for one side of an
    // OR while using a different index for the other, so it abandoned both and
    // sequentially scanned all 80,661 rows: 10.9 seconds, of which 10.8 was
    // discarding 80,454 non-matches. Splitting the two apart lets each use its
    // own index and brought the same search to 61ms.
    let semanticIds = [];
    if (queryVector) {
      try {
        const vecRes = await pool.query(
          `SELECT id FROM hadiths
           WHERE embedding IS NOT NULL
           ORDER BY embedding <=> $1::vector
           LIMIT 200`,
          [queryVector]
        );
        semanticIds = vecRes.rows.map((r) => r.id);
      } catch (e) {
        console.warn('[search] vector lookup failed:', e.message);
      }
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
      // A literal id array, resolved above. An = ANY(array) on the primary key
      // is an index lookup even inside an OR, which the equivalent subquery was
      // not.
      let semanticBranch = '';
      if (semanticIds.length) {
        params.push(semanticIds);
        semanticBranch = `
        OR h.id = ANY($${params.length}::bigint[])`;
      }

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
        ${semanticBranch}
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

    // Snapshot HERE, the moment the WHERE stops changing. The count query below
    // reuses this clause but not the SELECT, ranking or LIMIT, so it must be
    // bound to exactly the parameters the clause references — Postgres rejects
    // a bind carrying more than the statement uses rather than ignoring them.
    const whereParams = [...params];

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

    // Blend, rather than choosing one or the other. ts_rank scores 0 for a row
    // found only semantically, and cosine distance says nothing about how many
    // query words a row contains — so each is blind where the other sees.
    //
    // Weighted toward lexical (1.0 vs 0.6): an exact word match is a stronger
    // signal of intent than semantic proximity, and someone typing 'knife'
    // should get hadiths containing 'knife' before hadiths merely about
    // slaughtering.
    //
    // 1 - distance so both terms point the same way: higher is better.
    const hybridRank = (baseRank, vecParam) => vecParam
      ? `(${baseRank}) + 0.6 * (1 - (h.embedding <=> ${vecParam}))`
      : baseRank;

    // The vector param was pushed while building the WHERE, so its index is
    // known only if the semantic branch was actually added.
    // Pushed separately for the ranking expression. The WHERE no longer carries
    // the vector — it carries the resolved id array — but ranking still needs the
    // vector itself to score each row by distance. Only bothered with when the
    // semantic lookup actually returned something.
    let vecParam = null;
    if (queryVector && semanticIds.length) {
      params.push(queryVector);
      vecParam = `$${params.length}::vector`;
    }

    const orderBy = hasText && !compilerNumberHit
      ? `${hybridRank(strictRank, vecParam)} DESC,
         ${numericOrder},
         h.hadith_number`
      : `h.compiler,
         ${numericOrder},
         h.hadith_number`;

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

    // The header's total comes from the query planner, not from counting.
    //
    // COUNT(*) over a broad match is genuinely expensive here: the index finds
    // 12,678 rows for 'prayer' in 23ms, then reading them to count takes 3.8
    // seconds. Paid on every search, for a number the reader glances at.
    //
    // EXPLAIN gives the planner's own row estimate in about a millisecond. It's
    // derived from the same statistics the planner uses to choose a plan, so
    // it's an informed guess rather than a shrug: measured against 'prayer' it
    // said 12,080 where the true figure was 11,933, off by 1.2%.
    //
    // The header rounds it (see the client), so the last digits — which are the
    // ones that would be wrong — are never shown.
    const explainQuery = `
      EXPLAIN (FORMAT JSON)
      SELECT 1
      FROM hadiths h
      LEFT JOIN machine_clauses m ON h.machine_clause = m.machine_clause
      WHERE __WHERE__
    `;

    async function estimateTotal(whereClause) {
      try {
        const res = await pool.query(explainQuery.replace('__WHERE__', whereClause), whereParams);
        // EXPLAIN returns one row holding the plan tree as JSON. The top node's
        // 'Plan Rows' is the estimate for the whole query.
        const plan = res.rows[0]?.['QUERY PLAN'];
        const tree = Array.isArray(plan) ? plan[0] : plan;
        const n = tree?.Plan?.['Plan Rows'];
        return Number.isFinite(n) ? n : null;
      } catch (e) {
        console.warn('[search] estimate failed:', e.message);
        return null;
      }
    }

    // Sequential, not Promise.all. Each parallel pair holds two pool
    // connections at once, and with the OR pass that was four per request plus
    // a SET — enough to exhaust the pool under any concurrency and fail with
    // 'timeout exceeded when trying to connect' rather than a slow response.
    // One at a time is marginally slower per request and survives load.
    const result = await pool.query(
      baseQuery.replace('__WHERE__', where).replace('__ORDER__', orderBy),
      params
    );
    const estimated = await estimateTotal(where);

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
    // Never report fewer than were actually returned: on a narrow match the
    // estimate can undershoot, and a header reading '12 hadith' above 50 cards
    // is obviously wrong in a way a rounded number isn't.
    let total = Math.max(estimated ?? 0, rows.length + offset);
    let estimatedFlag = estimated !== null;

    // Word count decides whether the OR pass is worth running at all.
    //
    // The pass works by swapping plainto_tsquery's & for |. With a single term
    // there is no & to swap, so the OR query is character-for-character the
    // strict query that just returned zero — it cannot find anything, and it
    // runs a count alongside itself while failing to. That was two full scans
    // burned before the fuzzy pass below even started, which is why a one-word
    // typo like 'slaugter' timed out while it was really only the third pass
    // that needed the time.
    const termCount = searchQuery.split(/\s+/).filter(Boolean).length;

    if (rows.length === 0 && hasText && !compilerNumberHit && termCount > 1) {
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

      const orResult = await pool.query(
        baseQuery
          .replace('__WHERE__', orWhere)
          .replace('__ORDER__', `${hybridRank(rankExpr(orAr, orEn), vecParam)} DESC, ${numericOrder}, h.hadith_number`),
        params
      );
      const orEstimate = await estimateTotal(orWhere);
      rows = orResult.rows;
      total = Math.max(orEstimate ?? 0, rows.length + offset);
      estimatedFlag = orEstimate !== null;
    }

    // Third and last pass: typo tolerance. Full-text matches lexemes, so a
    // misspelling ('slaugter', 'Hurairh') tokenises to a word that simply isn't
    // in the index and both passes above return nothing.
    //
    // pg_trgm compares three-character shingles instead, so a word survives a
    // dropped or transposed letter. The % operator is index-backed by the
    // idx_trgm_* indexes already on the table.
    //
    // Deliberately last, and only on zero results: trigram similarity across
    // 80,661 rows of hadith text is the most expensive thing this route can do.
    // A correctly-spelled query never reaches it.
    //
    // English only. Arabic misspelling is a different problem — the script has
    // no casing and its ambiguity is in the letter forms, which norm_ar()
    // already collapses — and trigram matching on Arabic returns mostly noise.
    if (rows.length === 0 && hasText && !compilerNumberHit) {
      // word_similarity(...) >= 0.70 rather than the %> operator.
      //
      // %> reads its threshold from a GUC, which meant a separate SET on its
      // own pool connection — and on a pooled connection there's no guarantee
      // the SET and the query even land on the same one, so the threshold might
      // silently not apply. Spelling the comparison out removes both problems.
      //
      // The %> in the first term stays: it's what lets the trigram index
      // propose candidates. The >= then filters them at the default 0.6, and
      // the explicit 0.70 tightens it without a session variable. Measured: real
      // matches for a one-letter typo land at 0.70-0.72, so 0.75 excluded
      // everything and 0.6 let through ~1,161 candidates to recheck.
      const fuzzy = `(
        (h.post_clause_english %> $1 AND word_similarity($1, h.post_clause_english) >= 0.70)
        OR (m.english %> $1 AND word_similarity($1, m.english) >= 0.70)
      )`;

      const fuzzyConditions = conditions.map((c) =>
        c.includes('websearch_to_tsquery') ? fuzzy : c
      );
      const fuzzyWhere = fuzzyConditions.join(' AND ');

      // Ranked on ONE column, not GREATEST of two. word_similarity is the
      // expensive part of this pass — the index proposes ~1,200 candidates and
      // every one is rechecked against the full hadith text — so computing it
      // twice per row roughly doubled the cost for a tiebreak that rarely
      // changed the order.
      const fuzzyRank = `word_similarity($1, h.post_clause_english)`;

      try {
        // Tighter than the 0.6 default, for this connection only. At 0.6 the
        // index proposed 1,161 candidates of which 74 survived the recheck; the
        // 1,087 rejects were most of the runtime. 0.7 still catches a dropped or
        // transposed letter, which is what this pass is for.
        // No count query here. It re-runs the identical scan a second time in
        // parallel, doubling the cost of the slowest path in the route to learn
        // a number nobody needs precisely on a misspelled search. The page's own
        // row count stands in — honest, if capped at the page size.
        const fzResult = await pool.query(
          baseQuery
            .replace('__WHERE__', fuzzyWhere)
            .replace('__ORDER__', `${fuzzyRank} DESC, ${numericOrder}, h.hadith_number`),
          params
        );
        rows = fzResult.rows;
        total = rows.length;
        estimatedFlag = false;   // this one really is the row count
      } catch (fuzzyError) {
        // %> needs pg_trgm. If it isn't installed this throws rather than
        // returning nothing, and an empty result is a better outcome than a
        // 500 on a search that was already going to find nothing.
        console.warn('fuzzy pass skipped:', fuzzyError.message);
      }
    }

    return NextResponse.json({
      success: true,
      data: rows,
      count: rows.length,
      total,
      // So the header can say 'about 2,300' rather than implying 2,278 was
      // counted. Exact when the fuzzy pass answered, estimated otherwise.
      estimated: estimatedFlag,
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