import { notFound } from 'next/navigation';
import { ArticleDetail } from '../../../../component/ArticlesView';
import { ARTICLES } from '../../../../data/articles';

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

  if (!article) notFound();

  return <ArticleDetail article={article} />;
}