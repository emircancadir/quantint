import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import type { Locale } from '@/i18n/routing';
import { getPostBySlug } from '@/lib/posts';
import { renderMarkdown } from '@/lib/markdown';
import Reveal from '@/components/Reveal';
import Comments from '@/components/comments/Comments';

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const post = await getPostBySlug(locale as Locale, slug);
  if (!post) return {};

  const site = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
  const trSlug = locale === 'tr' ? post.slug : post.otherLocaleSlug;
  const enSlug = locale === 'en' ? post.slug : post.otherLocaleSlug;

  return {
    // Bare title — the layout's `%s — quantint` template appends the brand.
    title: post.title,
    description: post.excerpt,
    alternates: {
      canonical: `${site}/${locale}/blog/${post.slug}`,
      languages: {
        tr: `${site}/tr/blog/${trSlug}`,
        en: `${site}/en/blog/${enSlug}`,
      },
    },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      publishedTime: post.publishedAt?.toISOString(),
      images: [
        {
          url: `${site}/api/og/${locale}/${post.slug}`,
          width: 1200,
          height: 630,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
    },
  };
}

export default async function PostPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const post = await getPostBySlug(locale as Locale, slug);
  if (!post) notFound();

  const t = await getTranslations('common');
  const html = await renderMarkdown(post.body);

  const site = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    datePublished: post.publishedAt?.toISOString(),
    inLanguage: locale,
    mainEntityOfPage: `${site}/${locale}/blog/${post.slug}`,
    author: { '@type': 'Organization', name: 'quantint' },
    publisher: { '@type': 'Organization', name: 'quantint' },
  };

  return (
    <main
      data-q-p="1"
      style={{
        flex: 1,
        maxWidth: '920px',
        margin: '0 auto',
        padding: '64px 32px 88px',
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      <Reveal />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Link
        href={{ pathname: '/blog', query: { cat: post.key } }}
        style={{
          fontFamily: 'var(--font-plex-mono), monospace',
          fontSize: '13px',
          letterSpacing: '.14em',
          textTransform: 'uppercase',
          color: '#3168B4',
        }}
      >
        {post.cat}
      </Link>
      <h1
        data-q="pageh1"
        style={{
          margin: '14px 0 18px',
          fontSize: '44px',
          fontWeight: 700,
          letterSpacing: '-0.03em',
          lineHeight: 1.12,
          textWrap: 'balance',
        }}
      >
        {post.title}
      </h1>
      <div
        style={{
          display: 'flex',
          gap: '14px',
          fontFamily: 'var(--font-plex-mono), monospace',
          fontSize: '12.5px',
          color: '#8A94A3',
          paddingBottom: '28px',
          borderBottom: '1px solid #E4E8EE',
          marginBottom: '36px',
        }}
      >
        <span>{post.date}</span>
        <span>·</span>
        <span>
          {post.min} {t('minRead')}
        </span>
      </div>

      {/* Rendered server-side by lib/markdown (sanitized; Shiki + KaTeX). */}
      <article
        className="q-article"
        dangerouslySetInnerHTML={{ __html: html }}
      />

      <Comments
        postId={post.id}
        locale={locale as Locale}
        currentPath={`/blog/${post.slug}`}
      />
    </main>
  );
}
