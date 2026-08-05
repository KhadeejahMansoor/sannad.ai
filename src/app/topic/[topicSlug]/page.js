// src/app/topic/[topicSlug]/page.js
//
// /topic/patience — every hadith tagged with one topic.
//
// Server-rendered in full. The reader at /desktopcompiler loads fifty hadiths
// at a time as you scroll, which is right for a person and useless to a
// crawler that reads the HTML once. This page is the opposite: everything in
// the first response, no scrolling required.

import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Header from '@/component/Header';
import { getTopic } from '@/lib/topics';
import { hadithSlug as buildHadithSlug } from '@/lib/hadithUrl';
import { translateGrade } from '@/lib/i18n';

const SITE = 'https://sannad.ai';

// Rebuilt daily. The tagging only changes when the script is re-run, so there
// is no reason to query on every request.
export const revalidate = 86400;

// Deliberately not pre-rendered with generateStaticParams. That runs during
// the build, so a build that cannot reach the database fails outright — the
// sitemap was written that way first and did exactly that. The daily revalidate
// above means the query runs at most once a day per topic anyway.

export async function generateMetadata({ params }) {
  const { topicSlug } = await params;
  const topic = await getTopic(topicSlug);
  if (!topic) return { title: 'Topic not found' };

  const title = `Hadith about ${topic.label.toLowerCase()}`;

  return {
    title,
    // Written as the phrase someone would type. The whole reason this page
    // exists is that no hadith page contains the word "patience" in a place
    // Google weighs.
    description:
      `${topic.total} hadith about ${topic.label.toLowerCase()}, ` +
      `in Arabic and English with narrator, grading and commentary.`,
    alternates: { canonical: `${SITE}/topic/${topic.slug}` },
    openGraph: {
      title,
      url: `${SITE}/topic/${topic.slug}`,
      siteName: 'Sannad',
      type: 'website',
    },
  };
}

function truncate(text, max) {
  const t = String(text || '').replace(/\s+/g, ' ').trim();
  if (t.length <= max) return t;
  return t.slice(0, t.lastIndexOf(' ', max) || max).trim() + '…';
}

export default async function TopicPage({ params }) {
  const { topicSlug } = await params;
  const topic = await getTopic(topicSlug);
  if (!topic) notFound();

  return (
    <div className="min-h-screen w-full bg-[#F6F4F1]">
      {/* Header reads useSearchParams, which Next requires be wrapped when the
          page is statically rendered. */}
      <Suspense fallback={<div className="w-full h-[64px] bg-[#523230]" />}>
        <Header />
      </Suspense>

      <div className="max-w-[900px] mx-auto px-4 md:px-8 py-8">
        {/* The h1 is the whole point of the page. Without a heading naming the
            subject, a hundred topic pages look identical to a crawler. */}
        <h1 className="text-2xl font-bold text-gray-900 mb-1">{topic.label}</h1>
        <p className="text-sm text-[#6B5B55] mb-8">
          {topic.total} hadith
        </p>

        <ul className="flex flex-col gap-[10px]">
          {topic.hadiths.map((row) => {
            const target =
              buildHadithSlug(row.compiler, row.hadith_number) || row.composite_id;
            const grade = translateGrade(row.grade);

            return (
              <li key={row.composite_id}>
                <Link
                  href={`/${encodeURIComponent(target)}`}
                  className="block bg-white rounded-[5px] p-4 hover:bg-[#FAF7F5] transition-colors no-underline"
                >
                  {row.english_narrator && (
                    <h2 className="text-[13px] font-semibold text-[#1D1D1D] mb-2">
                      {row.english_narrator} reported,
                    </h2>
                  )}

                  <p className="text-[13px] leading-[22px] text-black mb-3">
                    {truncate(row.text_english, 240) || 'View hadith'}
                  </p>

                  <span className="h-[28px] px-[14px] inline-flex items-center justify-center bg-[#E6DEDA] rounded-[10px] text-xs" style={{ color: '#6B5B55' }}>
                    {buildHadithSlug(row.compiler, row.hadith_number)
                      ? `${row.compiler} ${row.hadith_number}`
                      : row.hadith_number}
                  </span>
                  {grade && (
                    <span className="h-[28px] px-[14px] ml-[6px] inline-flex items-center justify-center bg-[#E6DEDA] rounded-[10px] text-xs" style={{ color: '#6B5B55' }}>
                      {grade}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}