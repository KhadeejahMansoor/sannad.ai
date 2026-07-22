// hooks/useData.js
import { useState, useEffect, useCallback } from 'react';

// Enhanced Hadith hooks - SIMPLE VERSION
export function useHadiths() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHadiths = async () => {
      try {
        setLoading(true);
        setError(null);
        const { hadithAPI } = await import('../lib/api');
        const result = await hadithAPI.getAll({ limit: 10 });
        setData(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchHadiths();
  }, []);

  return { data, loading, error };
}

// Hadiths by compiler - SIMPLE VERSION
export function useHadithsByCompiler(compiler) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!compiler) {
      setData(null);
      setLoading(false);
      return;
    }

    const fetchHadiths = async () => {
      try {
        setLoading(true);
        setError(null);
        const { hadithAPI } = await import('../lib/api');
        const result = await hadithAPI.getByCompiler(compiler, { limit: 10 });
        setData(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchHadiths();
  }, [compiler]);

  return { data, loading, error };
}

// Languages hook
export function useLanguages() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        const { languagesAPI } = await import('../lib/api');
        const result = await languagesAPI.getAll();
        setData(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLanguages();
  }, []);

  return { data, loading, error };
}

// Single hadith hook
export function useHadith(hadithNumber) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!hadithNumber) {
      setData(null);
      setLoading(false);
      return;
    }

    const fetchHadith = async () => {
      try {
        setLoading(true);
        setError(null);
        const { hadithAPI } = await import('../lib/api');
        const result = await hadithAPI.getByNumber(hadithNumber);
        setData(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchHadith();
  }, [hadithNumber]);

  return { data, loading, error };
}

// Compilers hook
export function useCompilers() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCompilers = async () => {
      try {
        const { utilityAPI } = await import('../lib/api');
        const result = await utilityAPI.getCompilers();
        setData(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCompilers();
  }, []);

  return { data, loading, error };
}

// Generic entity hooks
export function useScholars() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchScholars = async () => {
      try {
        const { scholarsAPI } = await import('../lib/api');
        const result = await scholarsAPI.getAll();
        setData(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchScholars();
  }, []);

  return { data, loading, error };
}

export function useGrades() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGrades = async () => {
      try {
        const { gradesAPI } = await import('../lib/api');
        const result = await gradesAPI.getAll();
        setData(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchGrades();
  }, []);

  return { data, loading, error };
}

export function useChapters() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchChapters = async () => {
      try {
        const { chaptersAPI } = await import('../lib/api');
        const result = await chaptersAPI.getAll();
        setData(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchChapters();
  }, []);

  return { data, loading, error };
}

// Search Hadiths hook
//
// CHANGED: now accepts arrays for compilers + grades (was scalar single values).
// Backwards-compatible: a string still works because the API client coerces to arrays.
// Triggers a fetch when ANY of (searchText, compilers, grades) is non-empty.
// Arabic DB value for the Azami collection.
const AZAMI_DB = 'الأعظمي';

// Single table holding every collection.
const HADITH_TABLE = 'hadiths';

// Exact lookup for "compiler + hadith number".
//
// Why this exists: search_hadiths caps results at max_rows, so filtering its
// output for a hadith number only ever worked for numbers that happened to
// land inside that first page (roughly 1-100). "bukhari 110" and above always
// came back empty. This asks the database for the exact row instead, so the
// cap is irrelevant.
//
// Returns null (not []) when it cannot answer, so the caller can fall back.
async function fetchByCompilerAndNumber(supabase, compilerToDb, hit) {
  const dbCompiler = compilerToDb(hit.compiler);

  try {
    // PostgREST coerces the string to the column's type, so this works whether
    // hadith_number is integer or text.
    const { data, error } = await supabase
      .from(HADITH_TABLE)
      .select('*')
      .eq('compiler', dbCompiler)
      .eq('hadith_number', hit.number)
      .limit(50);

    if (error) {
      console.warn('[useSearchHadiths] direct lookup failed -', error.message);
      return null;
    }

    if (!data || data.length === 0) return null;
    return data.map((r) => ({ ...r, score: 1 }));
  } catch (err) {
    console.warn('[useSearchHadiths] direct lookup threw:', err.message);
    return null;
  }
}

export function useSearchHadiths(searchText, compilers, grades, lang = 'en') {
  // Normalize to arrays for stable dependency comparison
  const compilersArr = Array.isArray(compilers) ? compilers : (compilers ? [compilers] : []);
  const gradesArr    = Array.isArray(grades)    ? grades    : (grades    ? [grades]    : []);

  // Stable string keys so useEffect fires only on actual content change
  const compilersKey = compilersArr.join(',');
  const gradesKey    = gradesArr.join(',');

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const hasFilters = compilersArr.length > 0 || gradesArr.length > 0;
    const hasText = !!(searchText && searchText.trim());

    // Need EITHER text OR filters to do a search
    if (!hasText && !hasFilters) {
      setData(null);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    // Was: searchAPI.searchHadiths -> /api/search (a Next.js route).
    // Now: supabase.rpc('search_hadiths') straight from the browser. No route,
    // no cost. That function does Arabic+English full-text, fuzzy fallback, and
    // the metadata filters in one query, returning a relevance `score`.
    //
    // The chips carry ENGLISH keys ('Bukhari','Sahih'); the DB stores Arabic
    // ('البخاري','صحيح'). The old route translated server-side; the hook does it
    // now, via compilerToDb/gradeToDb, right before the call. URL and chip state
    // stay English, so shared links keep working.
    Promise.all([
      import('../lib/supabaseClient'),
      import('../lib/i18n'),
    ])
      .then(async ([{ supabase }, { compilerToDb, gradeToDb, COMPILER_KEYS }]) => {
        // ── "Compiler name + hadith number" typed into the search box ──
        // e.g. "azami 1" or "1 azami". search_hadiths does text/metadata
        // search only — hadith_number was never part of that, so this
        // pattern always came back empty. Detect it, fetch by compiler
        // filter alone, then match hadith_number client-side.
        let compilerNumberHit = null;
        const trimmedText = searchText ? searchText.trim() : '';
        if (trimmedText) {
          const m =
            trimmedText.match(/^(\D+?)\s*#?\s*(\d+[A-Za-z]?)$/) ||
            trimmedText.match(/^(\d+[A-Za-z]?)\s*#?\s*(\D+)$/);
          if (m) {
            const [, part1, part2] = m;
            const namePart = /^\d/.test(part1) ? part2 : part1;
            const numberPart = /^\d/.test(part1) ? part1 : part2;
            const matchedKey = COMPILER_KEYS.find(
              (k) => k.toLowerCase() === namePart.trim().toLowerCase()
            );
            if (matchedKey) {
              compilerNumberHit = { compiler: matchedKey, number: numberPart.trim() };
            }
          }
        }

        let filteredRows = null;

        // Exact compiler+number lookup goes straight to the table. This is not
        // subject to max_rows, so it works for hadith 7563 as well as hadith 2.
        if (compilerNumberHit) {
          filteredRows = await fetchByCompilerAndNumber(supabase, compilerToDb, compilerNumberHit);
        }

        // Everything else — and any lookup the direct query could not answer —
        // goes through the normal relevance search.
        if (filteredRows === null) {
          const { data: rows, error: rpcError } = await supabase.rpc('search_hadiths', {
            q: compilerNumberHit ? null : (searchText ? searchText.trim() : null),
            f_compilers: compilerNumberHit
              ? [compilerToDb(compilerNumberHit.compiler)]
              : (compilersArr.length ? compilersArr.map(compilerToDb) : null),
            f_grades:    gradesArr.length    ? gradesArr.map(gradeToDb)        : null,
            f_book: null,
            f_chapter: null,
            max_rows: 100,
          });

          if (rpcError) throw rpcError;

          filteredRows = compilerNumberHit
            ? (rows || []).filter(
                (r) => String(r.hadith_number).trim().toLowerCase() === compilerNumberHit.number.toLowerCase()
              )
            : rows;
        }

        // Shape rows to the fields the cards read — same names /api/search used,
        // so ResultsScreen needs no changes.
        const data = (filteredRows || []).map((r) => ({
          hadith_id: `${r.compiler === AZAMI_DB ? 'azami' : 'sevenbooks'}-${r.id}`,
          hadith_number: r.hadith_number,
          compiler: r.compiler,
          grade: r.final_grade,
          hadith_text: lang === 'ar' ? r.post_clause : r.post_clause_english,
          hadith_text_arabic: r.post_clause,
          hadith_text_english: r.post_clause_english,
          chain_clause: r.chain_clause,
          arabic_intro_clause: r.intro_clause,
          english_narrator: r.english_narrator,
          book: r.book,
          book_stripped_english: r.book_stripped_english,
          chapter: r.chapter,
          chapter_stripped_english: r.chapter_stripped_english,
          machine_clause: r.machine_clause,
          ayat: r.ayat,
          matched_hadith: r.matched_hadith,
          final_grader: r.final_grader,
          commentary: r.commentary_1,
          score: r.score,
        }));

        setData({ success: true, data });
      })
      .catch((err) => setError(err.message || 'Search failed'))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchText, compilersKey, gradesKey, lang]);

  return { data, loading, error };
}

// =================================================================
// NEW HOOKS for the categorized "Browse by collection" feature
// =================================================================

// Books for a given compiler. Returns an array of book names (Arabic strings).
export function useBooksByCompiler(compiler) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!compiler) {
      setData(null);
      setLoading(false);
      return;
    }

    const fetchBooks = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(
          `/api/books-by-compiler?compiler=${encodeURIComponent(compiler)}`
        );
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, [compiler]);

  return { data, loading, error };
}

// Chapters for a given (compiler, book). Returns an array of chapter names.
export function useChaptersByBook(compiler, book) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!compiler || !book) {
      setData(null);
      setLoading(false);
      return;
    }

    const fetchChapters = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(
          `/api/chapters-by-book?compiler=${encodeURIComponent(compiler)}&book=${encodeURIComponent(book)}`
        );
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchChapters();
  }, [compiler, book]);

  return { data, loading, error };
}

// Hadiths filtered by compiler/book/chapter/section with pagination.
// book, chapter, and section are optional; pass null to ignore.
export function useHadithsByFilters(compiler, book = null, chapter = null, section = null, limit = 50, offset = 0) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!compiler) {
      setData(null);
      setLoading(false);
      return;
    }

    const fetchHadiths = async () => {
      try {
        setLoading(true);
        setError(null);
        const params = new URLSearchParams({
          compiler,
          limit: String(limit),
          offset: String(offset),
        });
        if (book)    params.set('book', book);
        if (chapter) params.set('chapter', chapter);
        if (section) params.set('section', section);

        const response = await fetch(`/api/hadiths-by-filters?${params.toString()}`);
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchHadiths();
  }, [compiler, book, chapter, section, limit, offset]);

  return { data, loading, error };
}

// Sections for a given (compiler, book, chapter). Returns an array of section names.
// sevenbooks_hadiths has no section column, so this returns nothing for those compilers.
export function useSectionsByChapter(compiler, book, chapter) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!compiler || !book || !chapter) {
      setData(null);
      setLoading(false);
      return;
    }

    const fetchSections = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(
          `/api/sections-by-chapter?compiler=${encodeURIComponent(compiler)}&book=${encodeURIComponent(book)}&chapter=${encodeURIComponent(chapter)}`
        );
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSections();
  }, [compiler, book, chapter]);

  return { data, loading, error };
}