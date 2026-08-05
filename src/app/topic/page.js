// src/app/topic/page.js
//
// /topic — the index of every topic.
//
// Two jobs. It gives a reader a way in that isn't a search box, and it gives
// every topic page a link from somewhere: a page nothing links to is a page a
// crawler reaches only through the sitemap, and treats accordingly.

import Link from 'next/link';
import Header from '@/component/Header';
import { getTopics } from '@/lib/topics';

const SITE = 'https://sannad.ai';

export const revalidate = 86400;

export const metadata = {
  title: 'Hadith by topic',
  description:
    'Browse hadith by subject — patience, charity, prayer, parents, and more, ' +
    'in Arabic and English with narrator, grading and commentary.',
  alternates: { canonical: `${SITE}/topic` },
  openGraph: {
    title: 'Hadith by topic',
    url: `${SITE}/topic`,
    siteName: 'Sannad',
    type: 'website',
  },
};

export default async function TopicIndexPage() {
  const topics = await getTopics();

  return (
    <div className="min-h-screen w-full bg-[#F6F4F1]">
      <Header />

      <div className="max-w-[900px] mx-auto px-4 md:px-8 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Topics</h1>
        <p className="text-sm text-[#6B5B55] mb-8">
          {topics.length} subjects across the collections
        </p>

        <ul className="flex flex-wrap gap-2">
          {topics.map((topic) => (
            <li key={topic.slug}>
              <Link
                href={`/topic/${topic.slug}`}
                className="h-[36px] px-4 inline-flex items-center justify-center bg-white rounded-[10px] text-sm no-underline hover:bg-[#EFE7E4] transition-colors"
                style={{ color: '#523230' }}
              >
                {topic.label}
                <span className="ml-2 text-xs" style={{ color: '#9A8A85' }}>
                  {topic.total}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}