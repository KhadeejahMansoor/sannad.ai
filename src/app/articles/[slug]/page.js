import { notFound } from 'next/navigation';
import AboutShell from '../../../component/AboutShell';
import { ArticleDetail } from '../../../component/ArticlesView';
import { ARTICLES } from '../../../data/articles';

/* Every article is known at build time, so Next can render each one as a
   static page rather than on demand. */
export function generateStaticParams() {
  return ARTICLES.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const article = ARTICLES.find((a) => a.slug === slug);
  if (!article) return {};

  return {
    title: `${article.title} — Sannad`,
    description: article.subtitle ?? undefined,
  };
}

export default async function Page({ params }) {
  const { slug } = await params;
  const article = ARTICLES.find((a) => a.slug === slug);

  // An unknown slug is a 404, not an empty page.
  if (!article) notFound();

  return (
    <AboutShell>
      <ArticleDetail article={article} />
    </AboutShell>
  );
}