// hooks/useData.js
import { useState, useEffect, useCallback, useRef } from 'react';

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
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [total, setTotal] = useState(0);
  // True when `total` is the planner's estimate rather than a real count, so
  // the header can say 'about 2,300' instead of implying 2,278 was counted.
  const [estimated, setEstimated] = useState(false);
  const [hasMore, setHasMore] = useState(false);

  // Rows accumulate across pages, so the offset can't be derived from `data` in
  // a callback that also sets it. A ref keeps the two from racing when someone
  // scrolls fast enough to trigger a second page before the first lands.
  const offsetRef = useRef(0);
  const ctrlRef = useRef(null);

  const PAGE_SIZE = 50;

  // Built once per query so the first page and every later page ask for exactly
  // the same filters. Drifting between them would silently paginate a different
  // result set than the one being counted.
  const buildParams = useCallback(async (offset) => {
    const { compilerToDb, gradeToDb } = await import('../lib/i18n');
    const params = new URLSearchParams();
    if (searchText && searchText.trim()) params.set('q', searchText.trim());
    params.set('lang', lang);
    if (compilersArr.length) params.set('compiler', compilersArr.map(compilerToDb).join(','));
    if (gradesArr.length)    params.set('grade',    gradesArr.map(gradeToDb).join(','));
    params.set('limit', String(PAGE_SIZE));
    params.set('offset', String(offset));
    return params;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchText, compilersKey, gradesKey, lang]);

  const fetchPage = useCallback(async (offset, signal) => {
    const params = await buildParams(offset);
    const res = await fetch('/api/search?' + params.toString(), { signal });

    // Read as text first. A crashed or truncated response is not JSON, and
    // res.json() would throw "Unexpected end of JSON input" while saying
    // nothing about the status that caused it.
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
    return payload;
  }, [buildParams]);

  // First page. Runs on every query change and resets everything.
  useEffect(() => {
    const hasFilters = compilersArr.length > 0 || gradesArr.length > 0;
    const hasText = !!(searchText && searchText.trim());

    if (!hasText && !hasFilters) {
      setData(null);
      setLoading(false);
      setError(null);
      setTotal(0);
      setHasMore(false);
      offsetRef.current = 0;
      return;
    }

    const ctrl = new AbortController();
    ctrlRef.current = ctrl;

    setLoading(true);
    setError(null);
    offsetRef.current = 0;

    fetchPage(0, ctrl.signal)
      .then((payload) => {
        const rows = payload.data || [];
        offsetRef.current = rows.length;
        setData({ success: true, data: rows });
        // The route counts the whole match set, not the page, so the header can
        // say "2,278 hadith" while 50 cards exist.
        setTotal(payload.total ?? rows.length);
        setEstimated(!!payload.estimated);
        setHasMore(!!payload.hasMore);
      })
      .catch((err) => {
        if (err.name === 'AbortError') return;
        setError(err.message || 'Search failed');
      })
      .finally(() => setLoading(false));

    return () => ctrl.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchText, compilersKey, gradesKey, lang]);

  // Next page, appended. Guarded on loadingMore so a fast scroll past the
  // sentinel can't fire three overlapping requests for the same offset.
  const loadMore = useCallback(() => {
    if (loading || loadingMore || !hasMore) return;

    setLoadingMore(true);
    const ctrl = new AbortController();

    fetchPage(offsetRef.current, ctrl.signal)
      .then((payload) => {
        const rows = payload.data || [];
        offsetRef.current += rows.length;
        setData((prev) => ({ success: true, data: [...(prev?.data || []), ...rows] }));
        setTotal(payload.total ?? 0);
        setEstimated(!!payload.estimated);
        // Trust the row count over hasMore: a page returning nothing means the
        // end regardless of what the flag says.
        setHasMore(rows.length > 0 && !!payload.hasMore);
      })
      .catch((err) => {
        if (err.name === 'AbortError') return;
        setError(err.message || 'Search failed');
      })
      .finally(() => setLoadingMore(false));
  }, [loading, loadingMore, hasMore, fetchPage]);

  return { data, loading, loadingMore, error, total, estimated, hasMore, loadMore };
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