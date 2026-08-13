import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import type { Locale } from '@/i18n/routing';
import { getPostBySlug, getPostSeriesEntries, getRelatedPosts } from '@/lib/posts';
import { renderMarkdown, renderMarkdownDocument } from '@/lib/markdown';
import { getSiteUrl } from '@/lib/site-url';
import Reveal from '@/components/Reveal';
import Avatar from '@/components/Avatar';
import Comments from '@/components/comments/Comments';
import ArticleEnhancements from '@/components/article/ArticleEnhancements';

type Props = { params: Promise<{ locale: string; slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const post = await getPostBySlug(locale as Locale, slug);
  if (!post) return {};
  const site = getSiteUrl();
  const trSlug = locale === 'tr' ? post.slug : post.otherLocaleSlug;
  const enSlug = locale === 'en' ? post.slug : post.otherLocaleSlug;
  return {
    title: post.title,
    description: post.excerpt,
    authors: [{ name: post.author.name }],
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
      modifiedTime: post.updatedAt.toISOString(),
      authors: [post.author.name],
      tags: post.tags.map((tag) => tag.name),
      images: [{ url: `${site}/api/og/${locale}/${post.slug}`, width: 1200, height: 630 }],
    },
    twitter: { card: 'summary_large_image', title: post.title, description: post.excerpt },
  };
}

export default async function PostPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const loc = locale as Locale;
  const post = await getPostBySlug(loc, slug);
  if (!post) notFound();

  const t = await getTranslations('common');
  const [{ html, toc }, referencesHtml, related, seriesEntries] = await Promise.all([
    renderMarkdownDocument(post.body),
    post.references ? renderMarkdown(post.references) : Promise.resolve(''),
    getRelatedPosts(post.id, loc),
    post.series ? getPostSeriesEntries(post.series.slug, loc) : Promise.resolve([]),
  ]);

  const site = getSiteUrl();
  const articleUrl = `${site}/${locale}/blog/${post.slug}`;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    datePublished: post.publishedAt?.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    inLanguage: locale,
    mainEntityOfPage: articleUrl,
    author: { '@type': 'Person', name: post.author.name },
    publisher: { '@type': 'Organization', name: 'quantint', url: site },
    keywords: post.tags.map((tag) => tag.name),
  };
  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: t('navHome'), item: `${site}/${locale}` },
      { '@type': 'ListItem', position: 2, name: t('navBlog'), item: `${site}/${locale}/blog` },
      { '@type': 'ListItem', position: 3, name: post.title, item: articleUrl },
    ],
  };
  const updated = post.publishedAt
    ? post.updatedAt.getTime() - post.publishedAt.getTime() > 86_400_000
    : false;

  return (
    <main data-q-p="1" className="q-post-page">
      <Reveal />
      <ArticleEnhancements copyLabel={t('copyCode')} copiedLabel={t('copiedCode')} />
      {[jsonLd, breadcrumbLd].map((value, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(value).replace(/</g, '\\u003c') }}
        />
      ))}

      <nav className="q-breadcrumbs" aria-label={t('breadcrumbs')}>
        <Link href="/">{t('navHome')}</Link><span>/</span>
        <Link href="/blog">{t('navBlog')}</Link><span>/</span>
        <span aria-current="page">{post.title}</span>
      </nav>

      <header className="q-post-header">
        <Link href={{ pathname: '/blog', query: { cat: post.key } }} className="q-post-category">
          {post.cat}
        </Link>
        <h1 data-q="pageh1">{post.title}</h1>
        <p className="q-post-deck">{post.excerpt}</p>
        <div className="q-post-byline">
          <Avatar size={38} src={post.author.image ?? undefined} alt={post.author.name} />
          <div>
            <strong>{post.author.name}</strong>
            <span>
              {post.date} · {post.min} {t('minRead')}
              {updated ? ` · ${t('updated')} ${new Intl.DateTimeFormat(locale, { day: '2-digit', month: 'short', year: 'numeric' }).format(post.updatedAt)}` : ''}
            </span>
          </div>
        </div>
        {(post.series || post.tags.length > 0) && (
          <div className="q-post-taxonomy">
            {post.series && (
              <Link href={{ pathname: '/blog', query: { series: post.series.slug } }} className="q-series-badge">
                {t('series')} · {post.series.name}{post.series.order ? ` #${post.series.order}` : ''}
              </Link>
            )}
            {post.tags.map((tag) => (
              <Link key={tag.slug} href={{ pathname: '/blog', query: { tag: tag.slug } }}>#{tag.name}</Link>
            ))}
          </div>
        )}
      </header>

      <div className="q-reading-layout">
        {toc.length > 0 && (
          <aside className="q-toc">
            <strong>{t('tableOfContents')}</strong>
            <ol>
              {toc.map((item) => (
                <li key={item.id} data-level={item.level}>
                  <a href={`#${item.id}`}>{item.text}</a>
                </li>
              ))}
            </ol>
          </aside>
        )}
        <div className="q-reading-column">
          <article className="q-article q-article-main" dangerouslySetInnerHTML={{ __html: html }} />

          {referencesHtml && (
            <section className="q-references">
              <h2>{t('references')}</h2>
              <div className="q-article" dangerouslySetInnerHTML={{ __html: referencesHtml }} />
            </section>
          )}

          {seriesEntries.length > 1 && post.series && (
            <section className="q-series-list">
              <span>{t('series')}</span>
              <h2>{post.series.name}</h2>
              <ol>
                {seriesEntries.map((entry) => (
                  <li key={entry.id} data-current={entry.id === post.id}>
                    <Link href={`/blog/${entry.slug}`}>
                      <span>{entry.series?.order ?? '—'}</span>{entry.title}
                    </Link>
                  </li>
                ))}
              </ol>
            </section>
          )}

          <section className="q-author-card">
            <Avatar size={58} src={post.author.image ?? undefined} alt={post.author.name} />
            <div><span>{t('author')}</span><h2>{post.author.name}</h2><p>{t('authorBio')}</p></div>
          </section>

          {related.length > 0 && (
            <section className="q-related">
              <h2>{t('relatedPosts')}</h2>
              <div>
                {related.map((entry) => (
                  <Link key={entry.id} href={`/blog/${entry.slug}`}>
                    <span>{entry.cat}</span><strong>{entry.title}</strong><small>{entry.min} {t('minRead')}</small>
                  </Link>
                ))}
              </div>
            </section>
          )}

          <Comments postId={post.id} locale={loc} currentPath={`/blog/${post.slug}`} />
        </div>
      </div>
    </main>
  );
}
