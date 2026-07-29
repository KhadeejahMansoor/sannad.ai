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
    // Numbers are not always single values. Some rows store a range as text,
    // e.g. "7350-7351". Typing either endpoint should find that row, and so
    // should typing the whole range. Collapse spaces around the dash first so
    // "7350 - 7351" and "7350-7351" are treated identically.
    const num = hit.number.trim().replace(/\s*[-\u2013]\s*/g, '-');

    // eq covers an exact hit; the three like patterns cover the typed number
    // sitting at the start, end, or middle of a stored range.
    const orFilter = [
      `hadith_number.eq.${num}`,
      `hadith_number.like.${num}-*`,
      `hadith_number.like.*-${num}`,
      `hadith_number.like.*-${num}-*`,
    ].join(',');

    let { data, error } = await supabase
      .from(HADITH_TABLE)
      .select('*')
      .eq('compiler', dbCompiler)
      .or(orFilter)
      .limit(50);

    // If hadith_number turns out to be a numeric column, `like` is invalid.
    // Fall back to a plain exact match rather than giving up.
    if (error) {
      const retry = await supabase
        .from(HADITH_TABLE)
        .select('*')
        .eq('compiler', dbCompiler)
        .eq('hadith_number', num)
        .limit(50);
      if (retry.error) {
        console.warn('[useSearchHadiths] direct lookup failed -', error.message);
        return null;
      }
      data = retry.data;
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

    // Back on /api/search rather than supabase.rpc.
    //
    // The RPC goes through PostgREST, which clamps every response to
    // db_max_rows. That is stuck at 1000 on this project and the `authenticator`
    // role is reserved, so it cannot be raised from SQL. The route runs the
    // search over the pg pool instead, which PostgREST never sees, and takes a
    // `limit` param — so the page gets the whole result set.
    //
    // Two things that used to live here are gone because the route already does
    // them server-side: the "compiler + hadith number" parsing, and the row
    // mapping. The route returns the field names the cards read directly
    // (hadith_id, grade, hadith_text_arabic, chain_clause, ...), so re-mapping
    // would only rename them into fields that no longer exist.
    const ctrl = new AbortController();

    // Chips carry ENGLISH keys ('Bukhari','Sahih'); the DB stores Arabic
    // ('البخاري','صحيح'). Translate right before the call so the URL and chip
    // state stay English and shared links keep working.
    import('../lib/i18n')
      .then(async ({ compilerToDb, gradeToDb }) => {
        const params = new URLSearchParams();
        if (hasText) params.set('q', searchText.trim());
        params.set('lang', lang);
        if (compilersArr.length) {
          params.set('compiler', compilersArr.map(compilerToDb).join(','));
        }
        if (gradesArr.length) {
          params.set('grade', gradesArr.map(gradeToDb).join(','));
        }
        params.set('limit', '100000');

        const res = await fetch('/api/search?' + params.toString(), { signal: ctrl.signal });

        // Read as text first. A crashed or truncated response is not JSON, and
        // res.json() would throw "Unexpected end of JSON input" with nothing
        // said about the status that caused it.
        const raw = await res.text();
        let payload;
        try {
          payload = JSON.parse(raw);
        } catch {
          throw new Error('Search failed (HTTP ' + res.status + ', ' + raw.length + ' bytes)');
        }
        if (!res.ok || !payload.success) {
          throw new Error(payload.details || payload.error || 'Search failed');
        }

        setData({ success: true, data: payload.data || [] });
      })
      .catch((err) => {
        if (err.name === 'AbortError') return;
        setError(err.message || 'Search failed');
      })
      .finally(() => setLoading(false));

    return () => ctrl.abort();
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