// src/app/robots.js
//
// Tells crawlers what to read and where the sitemap index lives.

const SITE = 'https://sannad.ai';

export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Internal endpoints and result pages carry no content worth indexing,
      // and /results in particular would generate endless query-string
      // variants competing with the hadith pages themselves.
      disallow: ['/api/', '/results'],
    },
    sitemap: `${SITE}/sitemap.xml`,
  };
}