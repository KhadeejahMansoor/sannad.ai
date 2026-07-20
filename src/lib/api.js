// lib/api.js - Complete API client library
// Empty string = relative URLs (e.g. "/api/languages"), which automatically
// hit whatever domain the site is served from — localhost in dev, the live
// domain in production. NEXT_PUBLIC_API_URL can still override if ever needed.
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

// Generic API function
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}/api${endpoint}`;

  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}

// Scholars API functions
export const scholarsAPI = {
  getAll: () => apiRequest('/scholars'),
  getById: (id) => apiRequest(`/scholars/${id}`),
  create: (data) => apiRequest('/scholars', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id, data) => apiRequest(`/scholars/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id) => apiRequest(`/scholars/${id}`, {
    method: 'DELETE',
  }),
};

// Chapters API functions
export const chaptersAPI = {
  getAll: () => apiRequest('/chapters'),
  getById: (id) => apiRequest(`/chapters/${id}`),
  create: (data) => apiRequest('/chapters', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id, data) => apiRequest(`/chapters/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id) => apiRequest(`/chapters/${id}`, {
    method: 'DELETE',
  }),
};

export const compilerAPI = {
  getAll: () => apiRequest('/compiler'),
  getById: (id) => apiRequest(`/compiler/${id}`),
  create: (data) => apiRequest('/compiler', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => apiRequest(`/compiler/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => apiRequest(`/compiler/${id}`, { method: 'DELETE' }),
};

export const sectionsAPI = {
  getAll: () => apiRequest('/sections'),
  getById: (id) => apiRequest(`/sections/${id}`),
  create: (data) => apiRequest('/sections', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => apiRequest(`/sections/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => apiRequest(`/sections/${id}`, { method: 'DELETE' }),
};

export const gradesAPI = {
  getAll: () => apiRequest('/grades'),
  getById: (id) => apiRequest(`/grades/${id}`),
  getByLanguage: (lang) => apiRequest(`/grades/lang?lang=${lang}`),
  create: (data) => apiRequest('/grades', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => apiRequest(`/grades/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => apiRequest(`/grades/${id}`, { method: 'DELETE' }),
};

export const languagesAPI = {
  getAll: () => apiRequest('/languages'),
  getById: (id) => apiRequest(`/languages/${id}`),
  create: (data) => apiRequest('/languages', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => apiRequest(`/languages/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => apiRequest(`/languages/${id}`, { method: 'DELETE' }),
};

export const hadithAPI = {
  getAll: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/hadiths${queryString ? `?${queryString}` : ''}`);
  },
  getById: (id) => apiRequest(`/hadiths/${id}`),
  getByNumber: (number, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/hadith/${number}${queryString ? `?${queryString}` : ''}`);
  },
  getByCompiler: (compiler, params = {}) => {
    const allParams = { ...params, compiler };
    const queryString = new URLSearchParams(allParams).toString();
    return apiRequest(`/hadiths?${queryString}`);
  },
  getByGrade: (grade, params = {}) => {
    const allParams = { ...params, grade };
    const queryString = new URLSearchParams(allParams).toString();
    return apiRequest(`/hadiths?${queryString}`);
  },
  getByLanguage: (language, params = {}) => {
    const allParams = { ...params, lang: language };
    const queryString = new URLSearchParams(allParams).toString();
    return apiRequest(`/hadiths?${queryString}`);
  },
  getByChapter: (chapter, params = {}) => {
    const allParams = { ...params, chapter };
    const queryString = new URLSearchParams(allParams).toString();
    return apiRequest(`/hadiths?${queryString}`);
  },
  getBySection: (section, params = {}) => {
    const allParams = { ...params, section };
    const queryString = new URLSearchParams(allParams).toString();
    return apiRequest(`/hadiths?${queryString}`);
  },
  getWithTranslations: (id, primaryLang = 'en', secondaryLang = 'ar') =>
    apiRequest(`/hadith/${id}?primary=${primaryLang}&secondary=${secondaryLang}`),
  getByCompilerAndGrade: (compiler, grade, params = {}) => {
    const allParams = { ...params, compiler, grade };
    const queryString = new URLSearchParams(allParams).toString();
    return apiRequest(`/hadiths?${queryString}`);
  },
  search: (query, params = {}) => {
    const allParams = { ...params, q: query };
    const queryString = new URLSearchParams(allParams).toString();
    return apiRequest(`/hadiths/search?${queryString}`);
  },
  create: (data) => apiRequest('/hadiths', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => apiRequest(`/hadiths/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => apiRequest(`/hadiths/${id}`, { method: 'DELETE' }),
};

export const translationsAPI = {
  getAll: () => apiRequest('/translations'),
  getById: (id) => apiRequest(`/translations/${id}`),
  getByHadithId: (hadithId, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/translations/hadith/${hadithId}${queryString ? `?${queryString}` : ''}`);
  },
  getByLanguage: (languageId, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/translations/language/${languageId}${queryString ? `?${queryString}` : ''}`);
  },
  getByCompiler: (compiler, params = {}) => {
    const allParams = { ...params, compiler };
    const queryString = new URLSearchParams(allParams).toString();
    return apiRequest(`/translations?${queryString}`);
  },
  create: (data) => apiRequest('/translations', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => apiRequest(`/translations/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => apiRequest(`/translations/${id}`, { method: 'DELETE' }),
};

export const searchAPI = {
  scholars: (query, params = {}) => {
    const allParams = { ...params, q: query };
    const queryString = new URLSearchParams(allParams).toString();
    return apiRequest(`/search/scholars?${queryString}`);
  },
  chapters: (query, params = {}) => {
    const allParams = { ...params, q: query };
    const queryString = new URLSearchParams(allParams).toString();
    return apiRequest(`/search/chapters?${queryString}`);
  },
  hadith: (query, params = {}) => {
    const allParams = { ...params, q: query };
    const queryString = new URLSearchParams(allParams).toString();
    return apiRequest(`/search/hadith?${queryString}`);
  },
  translations: (query, params = {}) => {
    const allParams = { ...params, q: query };
    const queryString = new URLSearchParams(allParams).toString();
    return apiRequest(`/search/translations?${queryString}`);
  },
  all: (query, params = {}) => {
    const allParams = { ...params, q: query };
    const queryString = new URLSearchParams(allParams).toString();
    return apiRequest(`/search?${queryString}`);
  },
  advanced: (query, filters = {}) => {
    const allParams = { q: query, ...filters };
    const queryString = new URLSearchParams(allParams).toString();
    return apiRequest(`/search/advanced?${queryString}`);
  },

  // ─── CHANGED: searchHadiths now accepts compiler/grade ARRAYS ───
  // Sends comma-separated values to the API. Old single-string callers
  // still work because we coerce non-array inputs to a one-element array.
  // Examples of generated query strings:
  //   ?q=prayer&lang=en&compiler=البخاري,مسلم&grade=صحيح,حسن
  //   ?q=&lang=en&grade=صحيح       (filters-only, no text)
  searchHadiths: (query, opts = {}) => {
    const {
      lang = 'en',
      compilers,
      grades,
      compiler,  // legacy single-value support
      grade,     // legacy single-value support
    } = opts;

    const compArr  = Array.isArray(compilers) ? compilers : (compiler ? [compiler] : []);
    const gradeArr = Array.isArray(grades)    ? grades    : (grade    ? [grade]    : []);

    const params = new URLSearchParams({
      q: query || '',
      lang,
    });
    if (compArr.length)  params.set('compiler', compArr.join(','));
    if (gradeArr.length) params.set('grade', gradeArr.join(','));

    return apiRequest(`/search?${params.toString()}`);
  },
};

export const suggestionsAPI = {
  getAll: () => apiRequest('/suggestions'),
  getById: (id) => apiRequest(`/suggestions/${id}`),
  create: (data) => apiRequest('/suggestions', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => apiRequest(`/suggestions/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => apiRequest(`/suggestions/${id}`, { method: 'DELETE' }),
};

export const statsAPI = {
  getOverview: () => apiRequest('/stats'),
  getByCompiler: () => apiRequest('/stats/compiler'),
  getByLanguage: () => apiRequest('/stats/language'),
  getByGrade: () => apiRequest('/stats/grade'),
  getHadithCounts: () => apiRequest('/stats/hadith-counts'),
  getTranslationCounts: () => apiRequest('/stats/translation-counts'),
};

export const utilityAPI = {
  getCompilers: () => apiRequest('/hadiths').then(response => {
    if (response.success && response.data) {
      const compilers = [...new Set(response.data.map(hadith => hadith.compiler).filter(Boolean))];
      return { success: true, data: compilers };
    }
    return { success: false, data: [] };
  }),
  getGrades: () => apiRequest('/hadiths').then(response => {
    if (response.success && response.data) {
      const grades = [...new Set(response.data.map(hadith => hadith.grade).filter(Boolean))];
      return { success: true, data: grades };
    }
    return { success: false, data: [] };
  }),
  getBilingualHadith: (number) => hadithAPI.getByNumber(number, { primary: 'en', secondary: 'ar' }),
  getRandomHadith: (compiler = null) => {
    const params = compiler ? { compiler, limit: 1, offset: Math.floor(Math.random() * 1000) } : { limit: 1, offset: Math.floor(Math.random() * 1000) };
    return hadithAPI.getAll(params);
  },
};

export const api = {
  scholars: scholarsAPI,
  chapters: chaptersAPI,
  compiler: compilerAPI,
  sections: sectionsAPI,
  grades: gradesAPI,
  languages: languagesAPI,
  hadith: hadithAPI,
  translations: translationsAPI,
  search: searchAPI,
  suggestions: suggestionsAPI,
  stats: statsAPI,
  utility: utilityAPI,
};

export default api;