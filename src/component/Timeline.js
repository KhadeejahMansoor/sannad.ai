'use client';
import React, { useState } from 'react';
import Header from './Header';
import { useRouter } from 'next/navigation';
import BottomPopupMenu from './BottomPopupMenu';
import { ReferenceProvider, Citation, ReferencesList } from './ReferenceSystem';
import LanguageMenu from './LanguageMenu';
import HadithCollectionMenu from './HadithCollectionMenu';
import ArticleVideo from './ArticleVideo';
import EraTimeline from './EraTimeline';
import HadithGradeTable from './HadithGradeTable';
import { AnimatePresence } from 'framer-motion';

const Timeline = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('Timelines');
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [showBottomMenu, setShowBottomMenu] = useState(false);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [showHadithCollectionMenu, setShowHadithCollectionMenu] = useState(false);

  const handleEditClick = () => router.push('/');

  /* ---------------------------------------------------------------- *
   * The spine. One node per person, plus one dot per year-group.
   * ---------------------------------------------------------------- */
  // Height is the last row's baseline plus one line — no trailing padding.
  // It used to add 48px, which left the spine dangling below the last name.
  /* ---------------------------------------------------------------- *
   * Articles — unchanged from the previous version.
   * ---------------------------------------------------------------- */
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
    <div className="min-h-screen bg-[#F6F4F1] flex flex-col">
      <Header onEdit={handleEditClick} onMenu={() => setShowBottomMenu(true)} />

      {/* Tabs. Pills replaced with a text underline — the filled grey
          pills were the heaviest element on an otherwise empty page. */}
      <div className="flex gap-7 px-4 sm:px-8 mt-6 border-b border-[#E7E1DC]">
        {['Timelines', 'Grades', 'Articles'].map((tab) => (
          <button
            key={tab}
            className={`text-[15px] pb-3 -mb-px transition-colors ${
              activeTab === tab
                ? 'text-[#1C1917] border-b-2 border-[#523230]'
                : 'text-[#A8A29E] border-b-2 border-transparent hover:text-[#78716C]'
            }`}
            onClick={() => {
              setActiveTab(tab);
              setSelectedArticle(null);
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="flex-1 px-4 sm:px-8 pb-16 pt-8">
        {activeTab === 'Timelines' && (
          <EraTimeline />
        )}

        {activeTab === 'Grades' && (
          <div className="mx-auto w-full max-w-[900px]">
            <HadithGradeTable />
          </div>
        )}

        {activeTab === 'Articles' && !selectedArticle && (
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

        {activeTab === 'Articles' && selectedArticle && (
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
      </div>

      <AnimatePresence>
        {showBottomMenu && (
          <BottomPopupMenu
            onClose={() => setShowBottomMenu(false)}
            onCollectionClick={() => {
              setShowBottomMenu(false);
              setShowHadithCollectionMenu(true);
            }}
            onLanguageClick={() => {
              setShowBottomMenu(false);
              setShowLanguageMenu(true);
            }}
            onAboutHadithClick={() => {
              setShowBottomMenu(false);
              router.push('/about-hadith');
            }}
            onAboutUsClick={() => {}}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showLanguageMenu && <LanguageMenu onClose={() => setShowLanguageMenu(false)} />}
      </AnimatePresence>

      <AnimatePresence>
        {showHadithCollectionMenu && (
          <HadithCollectionMenu onClose={() => setShowHadithCollectionMenu(false)} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Timeline;