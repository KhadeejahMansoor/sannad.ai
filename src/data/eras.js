/* Era slugs live in a plain module, not in EraTimeline.js.
 *
 * EraTimeline is a client component ('use client'). Importing these from
 * there into a server component's generateStaticParams left them
 * undefined at build time, so the function returned an empty array —
 * which builds the route successfully but generates no pages, and every
 * /timelines/<slug> 404s with no error in the log.
 *
 * This file has no directive and no React, so it's safe on both sides. */

export const ERA_SLUGS = {
  Companions: 'companions',
  'After the Companions': 'after-the-companions',
  'Hadith compilers': 'hadith-compilers',
  'Classical scholars': 'classical-scholars',
  'Contemporary scholars': 'contemporary-scholars',
};

export const ERA_BY_SLUG = Object.fromEntries(
  Object.entries(ERA_SLUGS).map(([name, slug]) => [slug, name])
);

export const DEFAULT_ERA = 'Companions';