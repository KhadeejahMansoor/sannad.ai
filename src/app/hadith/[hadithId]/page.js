// src/app/hadith/[hadithId]/page.js (Server Component)
import HadithDetailClient from './HadithDetailClient';

export default async function Page({ params }) {
  const { hadithId } = await params;
  return <HadithDetailClient hadithId={hadithId} />;
}