import { notFound } from 'next/navigation';
import AboutShell from '../../../component/AboutShell';
import EraTimeline, { ERA_SLUGS, ERA_BY_SLUG } from '../../../component/EraTimeline';

// Every era is known ahead of time, so each renders as a static page.
export function generateStaticParams() {
  return Object.values(ERA_SLUGS).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const era = ERA_BY_SLUG[slug];
  if (!era) return {};

  return {
    title: `${era} — Sannad`,
    description: `Scholars and narrators of the ${era.toLowerCase()}, by year of death.`,
  };
}

export default async function Page({ params }) {
  const { slug } = await params;
  const era = ERA_BY_SLUG[slug];

  if (!era) notFound();

  return (
    <AboutShell>
      <EraTimeline era={era} />
    </AboutShell>
  );
}