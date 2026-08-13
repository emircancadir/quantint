import { NextResponse } from 'next/server';
import { locales, type Locale } from '@/i18n/routing';
import { getPublishedPosts } from '@/lib/posts';
import { prisma } from '@/lib/db';
import { getSiteUrl } from '@/lib/site-url';

const esc = (s: string) =>
  s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

/** RSS 2.0 feed per locale: /api/rss/tr, /api/rss/en */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ locale: string }> },
) {
  const { locale } = await params;
  if (!locales.includes(locale as Locale)) {
    return new NextResponse('Not found', { status: 404 });
  }
  const loc = locale as Locale;
  const site = getSiteUrl();

  const posts = await getPublishedPosts(loc);
  // publishedAt for pubDate (the summary type formats dates for display only).
  const raw = await prisma.post.findMany({
    where: {
      status: { in: ['PUBLISHED', 'SCHEDULED'] },
      publishedAt: { lte: new Date() },
    },
    select: { slugTr: true, slugEn: true, publishedAt: true },
  });
  const dateBySlug = new Map(
    raw.map((p) => [loc === 'en' ? p.slugEn : p.slugTr, p.publishedAt]),
  );

  const title =
    loc === 'en'
      ? 'quantint — quantitative finance, data science and machine learning'
      : 'quantint — kantitatif finans, veri bilimi ve makine öğrenmesi';
  const description =
    loc === 'en'
      ? 'In-depth writing on quantitative finance, statistics, machine learning and software.'
      : 'Kantitatif finans, istatistik, makine öğrenmesi ve yazılım üzerine derinlemesine Türkçe içerik.';

  const items = posts
    .map((p) => {
      const url = `${site}/${loc}/blog/${p.slug}`;
      const pub = dateBySlug.get(p.slug);
      return `    <item>
      <title>${esc(p.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <description>${esc(p.excerpt)}</description>
      <category>${esc(p.cat)}</category>${
        pub ? `\n      <pubDate>${pub.toUTCString()}</pubDate>` : ''
      }
    </item>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${esc(title)}</title>
    <link>${site}/${loc}</link>
    <description>${esc(description)}</description>
    <language>${loc}</language>
    <atom:link href="${site}/api/rss/${loc}" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>
`;

  return new NextResponse(xml, {
    headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' },
  });
}
