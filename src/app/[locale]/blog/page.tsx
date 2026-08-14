import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import type { Locale } from '@/i18n/routing';
import { getCategories, categoryName } from '@/lib/categories';
import { getPublishedPosts } from '@/lib/posts';
import { getSiteUrl } from '@/lib/site-url';
import NewsletterSection from '@/components/NewsletterSection';
import Reveal from '@/components/Reveal';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'common' });
  const site = getSiteUrl();
  return {
    title: t('blogTitle'),
    alternates: {
      canonical: `${site}/${locale}/blog`,
      languages: { tr: `${site}/tr/blog`, en: `${site}/en/blog` },
    },
  };
}

export default async function BlogPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ cat?: string; q?: string; tag?: string; series?: string }>;
}) {
  const { locale } = await params;
  const { cat, q, tag, series } = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations('common');

  const categories = await getCategories();
  const activeKey =
    cat && categories.some((c) => c.key === cat) ? cat : 'all';
  const searchQuery = typeof q === 'string' ? q.trim().slice(0, 120) : '';
  const posts = await getPublishedPosts(
    locale as Locale,
    activeKey,
    searchQuery,
    typeof tag === 'string' ? tag : undefined,
    typeof series === 'string' ? series : undefined,
  );

  const chips = [
    { key: 'all', label: t('chipAll') },
    ...categories.map((c) => ({
      key: c.key,
      label: categoryName(c, locale as Locale),
    })),
  ];

  return (
    <main
      data-q-p="1"
      style={{
        flex: 1,
        maxWidth: '1160px',
        margin: '0 auto',
        padding: '64px 32px 88px',
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      <Reveal />
      <div
        style={{
          fontFamily: 'var(--font-plex-mono), monospace',
          fontSize: '13px',
          letterSpacing: '.14em',
          textTransform: 'uppercase',
          color: 'var(--q-blue)',
          marginBottom: '14px',
        }}
      >
        {t('blogKicker')}
      </div>
      <h1
        data-q="pageh1"
        style={{
          margin: '0 0 36px',
          fontSize: '44px',
          fontWeight: 700,
          letterSpacing: '-0.03em',
        }}
      >
        {t('blogTitle')}
      </h1>

      <form action={`/${locale}/blog`} method="get" className="q-search-form">
        <label>
          <span className="q-sr-only">{t('search')}</span>
          <input
            type="search"
            name="q"
            defaultValue={searchQuery}
            placeholder={t('searchPlaceholder')}
            maxLength={120}
          />
        </label>
        {activeKey !== 'all' && <input type="hidden" name="cat" value={activeKey} />}
        {tag && <input type="hidden" name="tag" value={tag} />}
        {series && <input type="hidden" name="series" value={series} />}
        <button type="submit">{t('search')}</button>
        {(searchQuery || tag || series) && <Link href="/blog">{t('clearFilters')}</Link>}
      </form>

      <div
        style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '40px' }}
      >
        {chips.map((chip) => {
          const active = activeKey === chip.key;
          return (
            <Link
              key={chip.key}
              href={
                chip.key === 'all'
                  ? { pathname: '/blog' }
                  : { pathname: '/blog', query: { cat: chip.key } }
              }
              className="q-chip"
              style={{
                padding: '8px 16px',
                borderRadius: '999px',
                fontSize: '13.5px',
                fontWeight: 500,
                border: `1px solid ${active ? 'var(--q-action-bg)' : 'var(--q-line-soft)'}`,
                background: active ? 'var(--q-action-bg)' : 'var(--q-surface)',
                color: active ? 'var(--q-action-ink)' : 'var(--q-muted)',
                transition: 'border-color .2s',
              }}
            >
              {chip.label}
            </Link>
          );
        })}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {(searchQuery || tag || series) && (
          <p className="q-search-summary">
            {t('resultCount', { count: posts.length })}
            {searchQuery ? ` · “${searchQuery}”` : ''}
            {tag ? ` · #${tag}` : ''}
          </p>
        )}
        {posts.length === 0 && (
          <p style={{ margin: 0, color: 'var(--q-muted)', fontSize: '15px' }}>{t('noPosts')}</p>
        )}
        {posts.map((p) => (
          <Link
            key={p.id}
            href={`/blog/${p.slug}`}
            style={{ display: 'contents', color: 'inherit' }}
          >
          <article
            data-q="postrow"
            className="q-postrow"
            style={{
              background: 'var(--q-surface)',
              border: '1px solid var(--q-line)',
              borderRadius: '12px',
              padding: '28px 32px',
              display: 'grid',
              gridTemplateColumns: '150px 1fr auto',
              gap: '28px',
              alignItems: 'center',
              cursor: 'pointer',
              transition: 'transform .25s, box-shadow .25s, border-color .25s',
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-plex-mono), monospace',
                fontSize: '11.5px',
                letterSpacing: '.08em',
                textTransform: 'uppercase',
                color: 'var(--q-blue)',
              }}
            >
              {p.cat}
            </span>
            <div>
              {p.series && (
                <span className="q-post-series-label">
                  {t('series')} · {p.series.name}{p.series.order ? ` #${p.series.order}` : ''}
                </span>
              )}
              <h3
                style={{
                  margin: '0 0 8px',
                  fontSize: '20px',
                  fontWeight: 600,
                  letterSpacing: '-0.01em',
                  lineHeight: 1.3,
                }}
              >
                {p.title}
              </h3>
              <p
                style={{
                  margin: 0,
                  fontSize: '14.5px',
                  lineHeight: 1.6,
                  color: 'var(--q-muted)',
                  maxWidth: '72ch',
                }}
              >
                {p.excerpt}
              </p>
              {p.tags.length > 0 && (
                <div className="q-post-tags">
                  {p.tags.map((postTag) => <span key={postTag.slug}>#{postTag.name}</span>)}
                </div>
              )}
            </div>
            <div
              data-q="postmeta"
              style={{
                fontFamily: 'var(--font-plex-mono), monospace',
                fontSize: '12px',
                color: 'var(--q-dim)',
                textAlign: 'right',
                whiteSpace: 'nowrap',
              }}
            >
              {p.date} · {p.min} {t('minRead')}
            </div>
          </article>
          </Link>
        ))}
      </div>

      <NewsletterSection standalone={false} />
    </main>
  );
}
