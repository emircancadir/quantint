import type { MetadataRoute } from 'next';
import { getAllSlugs } from '@/lib/posts';
import { getSiteUrl } from '@/lib/site-url';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const site = getSiteUrl();

  const staticPages: MetadataRoute.Sitemap = ['', '/blog', '/about'].flatMap(
    (path) => [
      {
        url: `${site}/tr${path}`,
        alternates: {
          languages: { tr: `${site}/tr${path}`, en: `${site}/en${path}` },
        },
        changeFrequency: 'weekly' as const,
        priority: path === '' ? 1 : 0.8,
      },
      {
        url: `${site}/en${path}`,
        alternates: {
          languages: { tr: `${site}/tr${path}`, en: `${site}/en${path}` },
        },
        changeFrequency: 'weekly' as const,
        priority: path === '' ? 1 : 0.8,
      },
    ],
  );

  let postPages: MetadataRoute.Sitemap = [];
  try {
    const slugs = await getAllSlugs();
    postPages = slugs.flatMap((s) => {
      const alternates = {
        languages: {
          tr: `${site}/tr/blog/${s.slugTr}`,
          en: `${site}/en/blog/${s.slugEn}`,
        },
      };
      return [
        {
          url: `${site}/tr/blog/${s.slugTr}`,
          lastModified: s.updatedAt,
          alternates,
          priority: 0.7,
        },
        {
          url: `${site}/en/blog/${s.slugEn}`,
          lastModified: s.updatedAt,
          alternates,
          priority: 0.7,
        },
      ];
    });
  } catch {
    // DB unavailable (e.g. build without database) — static pages still ship.
  }

  return [...staticPages, ...postPages];
}
