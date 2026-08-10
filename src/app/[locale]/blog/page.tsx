import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import type { Locale } from '@/i18n/routing';
import { getCategories, categoryName } from '@/lib/categories';
import { getPublishedPosts } from '@/lib/posts';
import NewsletterSection from '@/components/NewsletterSection';
import Reveal from '@/components/Reveal';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'common' });
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
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
  searchParams: Promise<{ cat?: string }>;
}) {
  const { locale } = await params;
  const { cat } = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations('common');

  const categories = await getCategories();
  const activeKey =
    cat && categories.some((c) => c.key === cat) ? cat : 'all';
  const posts = await getPublishedPosts(locale as Locale, activeKey);

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
          color: '#3168B4',
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
                border: `1px solid ${active ? '#101820' : '#DCE1E8'}`,
                background: active ? '#101820' : '#FFFFFF',
                color: active ? '#FFFFFF' : '#3D4652',
                transition: 'border-color .2s',
              }}
            >
              {chip.label}
            </Link>
          );
        })}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {posts.length === 0 && (
          <p style={{ margin: 0, color: '#5B6673', fontSize: '15px' }}>{t('noPosts')}</p>
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
              background: '#FFFFFF',
              border: '1px solid #E4E8EE',
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
                color: '#3168B4',
              }}
            >
              {p.cat}
            </span>
            <div>
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
                  color: '#5B6673',
                  maxWidth: '72ch',
                }}
              >
                {p.excerpt}
              </p>
            </div>
            <div
              data-q="postmeta"
              style={{
                fontFamily: 'var(--font-plex-mono), monospace',
                fontSize: '12px',
                color: '#8A94A3',
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
