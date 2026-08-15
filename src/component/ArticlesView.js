'use client';
import React, { useState } from 'react';
import { ReferenceProvider, Citation, ReferencesList } from './ReferenceSystem';
import ArticleVideo from './ArticleVideo';

export default function ArticlesView() {
  const [selectedArticle, setSelectedArticle] = useState(null);

  const articlesData = [
    {
      id: 1,
      title: 'Breakdown of Hadith\ngrades in the Sunan\nbooks',
      description:
        'Classification of Hadith in Ibn Majah, Abu Dawood, Tirmidhi, Nasai, and Ahmad',
      date: 'JUNE 10, 2024',
      author: 'MOHAMMED ZAIN',
      videoId: 'QA9ckJYMXbQ',
      videoTitle: 'Surah Al-Ikhlas',
      content: {
        subtitle:
          'Classification of Hadiths in Ibn Majah, Abu Dawud, Tirmidhi, Nasai, and Ahmad',
        sections: [
          {
            title: 'Exercitationem ullam corporis suscipit',
            content:
              'Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur?',
          },
        ],
      },
    },
    ...Array(15)
      .fill(0)
      .map((_, index) => ({
        id: index + 2,
        title: 'Sed ut perspiciatis unde omnis iste natus error sit voluptatem',
        description: 'Eaque ipsa quae ab illo inventore veritatis et quasi',
        date: 'JUNE 10, 2024',
        author: 'MOHAMMED ZAIN',
        videoId: index % 3 === 0 ? 'QA9ckJYMXbQ' : null,
        videoTitle: index % 3 === 0 ? 'Surah Al-Ikhlas' : null,
        content: {
          subtitle: 'Sample article content',
          sections: [
            { title: 'Sample Section', content: 'This is sample content for the article.' },
          ],
        },
      })),
  ];


  return (
    <>
      {!selectedArticle && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {articlesData.map((articleItem) => (
            <div
              key={articleItem.id}
              className="min-h-[176px] p-5 bg-white border border-[#E7E1DC] rounded-[8px] flex flex-col gap-4 cursor-pointer hover:border-[#CFC7C1] transition-colors"
              onClick={() => setSelectedArticle(articleItem)}
            >
              <div className="text-[#1C1917] text-base font-medium leading-tight">
                {articleItem.title}
              </div>
              <div className="text-[#57534E] text-sm leading-snug">
                {articleItem.description}
              </div>
              <div className="mt-auto text-[#A8A29E] text-xs">
                {articleItem.date} — {articleItem.author}
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedArticle && (
        <ReferenceProvider>
          <div className="flex justify-center">
            <div className="w-full max-w-[900px] bg-white border border-[#E7E1DC] rounded-[8px] p-6 sm:p-8 flex flex-col gap-5">
              <button
                className="text-sm text-[#A8A29E] hover:text-[#1C1917] text-start"
                onClick={() => setSelectedArticle(null)}
              >
                ← Back to articles
              </button>

              <div className="text-[#1C1917] text-2xl font-medium leading-tight">
                {selectedArticle.title.replace(/\n/g, ' ')}
              </div>

              <div className="text-[#78716C] text-base leading-normal -mt-2">
                {selectedArticle.content.subtitle}
              </div>

              <div className="flex flex-col gap-1">
                <div className="text-[#1C1917] text-sm font-medium uppercase">
                  {selectedArticle.author}
                </div>
                <div className="text-[#A8A29E] text-sm">{selectedArticle.date}</div>
              </div>

              {selectedArticle.videoId && (
                <ArticleVideo
                  videoId={selectedArticle.videoId}
                  title={selectedArticle.videoTitle || 'Related Video'}
                />
              )}

              <div className="text-[#1C1917] text-base leading-relaxed">
                Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis
                suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur
                <Citation id="1">
                  Sahih al-Bukhari, Book 3, Hadith 134: &quot;The Book of Knowledge&quot;
                </Citation>
                .
              </div>

              <ReferencesList />
            </div>
          </div>
        </ReferenceProvider>
      )}
    </>
  );
}