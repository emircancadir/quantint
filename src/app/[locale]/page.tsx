import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import type { Locale } from '@/i18n/routing';
import { getCategories, categoryName } from '@/lib/categories';
import { getFeaturedPosts } from '@/lib/posts';
import HeroCanvas from '@/components/hero/HeroCanvas';
import NewsletterSection from '@/components/NewsletterSection';
import Reveal from '@/components/Reveal';

const monoKicker: React.CSSProperties = {
  fontFamily: 'var(--font-plex-mono), monospace',
  fontSize: '13px',
  letterSpacing: '.14em',
  textTransform: 'uppercase',
  color: 'var(--q-blue)',
  marginBottom: '20px',
};

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('common');
  const [featured, categories] = await Promise.all([
    getFeaturedPosts(locale as Locale),
    getCategories(),
  ]);

  return (
    <main style={{ flex: 1 }}>
      <Reveal />

      {/* hero */}
      <section
        style={{
          borderBottom: '1px solid var(--q-line)',
          background: 'linear-gradient(180deg,var(--q-surface-soft) 0%,var(--q-bg) 100%)',
        }}
      >
        <div
          data-q="hero"
          style={{
            maxWidth: '1160px',
            margin: '0 auto',
            padding: '84px 32px 76px',
            display: 'grid',
            gridTemplateColumns: '1.05fr .95fr',
            gap: '64px',
            alignItems: 'center',
          }}
        >
          <div style={{ animation: 'qi-fadeup .7s ease both' }}>
            <div style={monoKicker}>{t('kicker')}</div>
            <h1
              data-q="h1"
              style={{
                margin: '0 0 22px',
                fontSize: '56px',
                lineHeight: 1.06,
                fontWeight: 700,
                letterSpacing: '-0.03em',
                textWrap: 'balance',
              }}
            >
              {t('heroTitle1')}
              <br />
              <span style={{ color: 'var(--q-blue)' }}>{t('heroTitle2')}</span>
            </h1>
            <p
              style={{
                margin: '0 0 34px',
                fontSize: '18px',
                lineHeight: 1.65,
                color: 'var(--q-muted)',
                maxWidth: '46ch',
                textWrap: 'pretty',
              }}
            >
              {t('heroSub')}
            </p>
            <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
              <Link
                href="/blog"
                className="q-cta-primary"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '10px',
                  background: 'var(--q-action-bg)',
                  color: 'var(--q-action-ink)',
                  padding: '13px 26px',
                  borderRadius: '9px',
                  fontSize: '15.5px',
                  fontWeight: 600,
                  transition: 'background .2s, transform .2s',
                }}
              >
                {t('ctaPosts')} →
              </Link>
              <Link
                href="/about"
                className="q-cta-secondary"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  background: 'var(--q-surface)',
                  color: 'var(--q-ink)',
                  border: '1px solid var(--q-line-soft)',
                  padding: '13px 26px',
                  borderRadius: '9px',
                  fontSize: '15.5px',
                  fontWeight: 600,
                  transition: 'border-color .2s, transform .2s',
                }}
              >
                {t('ctaAbout')}
              </Link>
            </div>
          </div>
          <div style={{ animation: 'qi-fadeup .7s .15s ease both' }}>
            <div
              style={{
                background: 'var(--q-surface)',
                border: '1px solid var(--q-line)',
                borderRadius: '14px',
                padding: '18px 18px 12px',
                boxShadow: '0 20px 50px -30px rgba(16,24,32,.25)',
              }}
            >
              <HeroCanvas />
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '10px 4px 4px',
                  fontFamily: 'var(--font-plex-mono), monospace',
                  fontSize: '11.5px',
                  color: 'var(--q-dim)',
                }}
              >
                <span>fig. 01 — {t('figCaption')}</span>
                <span
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  <span
                    style={{
                      width: '7px',
                      height: '7px',
                      borderRadius: '50%',
                      background: 'var(--q-blue)',
                      animation: 'qi-pulse 1.8s ease-in-out infinite',
                      display: 'inline-block',
                    }}
                  />
                  {t('live')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* code showcase */}
      <section
        data-q-p="1"
        style={{
          maxWidth: '1160px',
          margin: '0 auto',
          padding: '64px 32px 0',
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        <div
          data-q="code"
          data-reveal="true"
          style={{
            background: '#101820',
            borderRadius: '16px',
            display: 'grid',
            gridTemplateColumns: '1fr 1.2fr',
            gap: '48px',
            padding: '52px 56px',
            alignItems: 'center',
          }}
        >
          <div>
            <div
              style={{
                fontFamily: 'var(--font-plex-mono), monospace',
                fontSize: '12.5px',
                letterSpacing: '.14em',
                textTransform: 'uppercase',
                color: '#6E9FDD',
                marginBottom: '16px',
              }}
            >
              {t('codeKicker')}
            </div>
            <h2
              style={{
                margin: '0 0 16px',
                fontSize: '30px',
                fontWeight: 700,
                letterSpacing: '-0.02em',
                color: '#FFFFFF',
                textWrap: 'balance',
              }}
            >
              {t('codeTitle')}
            </h2>
            <p
              style={{
                margin: 0,
                fontSize: '15.5px',
                lineHeight: 1.7,
                color: '#9AA6B5',
                textWrap: 'pretty',
              }}
            >
              {t('codeSub')}
            </p>
          </div>
          <pre
            style={{
              margin: 0,
              background: '#0B111A',
              border: '1px solid #223041',
              borderRadius: '12px',
              padding: '24px 26px',
              overflowX: 'auto',
              fontFamily: 'var(--font-plex-mono), monospace',
              fontSize: '13px',
              lineHeight: 1.75,
              color: '#C7CFDA',
            }}
          >
            <span style={{ color: '#6E9FDD' }}>import</span> numpy{' '}
            <span style={{ color: '#6E9FDD' }}>as</span> np{'\n\n'}
            <span style={{ color: '#6E9FDD' }}>def</span>{' '}
            <span style={{ color: '#7FC8A9' }}>sharpe</span>(r, rf=
            <span style={{ color: '#D9A66C' }}>0.0</span>, ann=
            <span style={{ color: '#D9A66C' }}>252</span>):{'\n'}
            {'    '}ex = r - rf{'\n'}
            {'    '}
            <span style={{ color: '#6E9FDD' }}>return</span> np.sqrt(ann) * ex.mean() /
            ex.std(){'\n\n'}
            <span style={{ color: '#55627A' }}># Kalman ile dinamik hedge oranı</span>
            {'\n'}
            <span style={{ color: '#6E9FDD' }}>for</span> t{' '}
            <span style={{ color: '#6E9FDD' }}>in</span> range(
            <span style={{ color: '#D9A66C' }}>1</span>, n):{'\n'}
            {'    '}P_p = P[t-<span style={{ color: '#D9A66C' }}>1</span>] + Q{'\n'}
            {'    '}K = P_p * x[t] / (x[t]**
            <span style={{ color: '#D9A66C' }}>2</span> * P_p + R){'\n'}
            {'    '}b[t] = b[t-<span style={{ color: '#D9A66C' }}>1</span>] + K * (y[t] -
            x[t]*b[t-<span style={{ color: '#D9A66C' }}>1</span>]){'\n'}
            {'    '}P[t] = (<span style={{ color: '#D9A66C' }}>1</span> - K * x[t]) * P_p
          </pre>
        </div>
      </section>

      {/* featured */}
      <section
        data-q-p="1"
        style={{
          maxWidth: '1160px',
          margin: '0 auto',
          padding: '72px 32px 12px',
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        <div
          data-reveal="true"
          style={{
            display: 'flex',
            alignItems: 'baseline',
            justifyContent: 'space-between',
            marginBottom: '32px',
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: '30px',
              fontWeight: 700,
              letterSpacing: '-0.02em',
            }}
          >
            {t('featured')}
          </h2>
          <Link
            href="/blog"
            className="q-viewall"
            style={{ fontSize: '15px', fontWeight: 600, color: 'var(--q-blue)' }}
          >
            {t('viewAll')} →
          </Link>
        </div>
        <div
          data-q="grid3"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3,1fr)',
            gap: '24px',
          }}
        >
          {featured.map((p) => (
            <Link
              key={p.id}
              href={`/blog/${p.slug}`}
              style={{ display: 'contents', color: 'inherit' }}
            >
              <article
                data-reveal="true"
                className="q-card"
                style={{
                  background: 'var(--q-surface)',
                  border: '1px solid var(--q-line)',
                  borderRadius: '12px',
                  padding: '26px 26px 22px',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
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
                <h3
                  style={{
                    margin: 0,
                    fontSize: '19px',
                    lineHeight: 1.35,
                    fontWeight: 600,
                    letterSpacing: '-0.01em',
                    textWrap: 'balance',
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
                    flex: 1,
                  }}
                >
                  {p.excerpt}
                </p>
                <div
                  style={{
                    display: 'flex',
                    gap: '14px',
                    fontFamily: 'var(--font-plex-mono), monospace',
                    fontSize: '12px',
                    color: 'var(--q-dim)',
                    borderTop: '1px solid var(--q-line)',
                    paddingTop: '14px',
                  }}
                >
                  <span>{p.date}</span>
                  <span>·</span>
                  <span>
                    {p.min} {t('minRead')}
                  </span>
                </div>
              </article>
            </Link>
          ))}
        </div>
      </section>

      {/* categories */}
      <section
        data-q-p="1"
        style={{
          maxWidth: '1160px',
          margin: '0 auto',
          padding: '64px 32px 8px',
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        <h2
          data-reveal="true"
          style={{
            margin: '0 0 28px',
            fontSize: '30px',
            fontWeight: 700,
            letterSpacing: '-0.02em',
          }}
        >
          {t('topics')}
        </h2>
        <div
          data-q="grid3"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3,1fr)',
            gap: '18px',
          }}
        >
          {categories.map((cat) => (
            <Link
              key={cat.key}
              href={{ pathname: '/blog', query: { cat: cat.key } }}
              style={{ display: 'contents', color: 'inherit' }}
            >
              <div
                data-reveal="true"
                className="q-pillar"
                style={{
                  background: 'var(--q-surface)',
                  border: '1px solid var(--q-line)',
                  borderRadius: '12px',
                  padding: '22px 24px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  cursor: 'pointer',
                  transition: 'border-color .2s, transform .2s',
                }}
              >
                <span
                  style={{
                    fontFamily: 'var(--font-plex-mono), monospace',
                    fontSize: '13px',
                    color: 'var(--q-blue)',
                    background: 'var(--q-surface-muted)',
                    borderRadius: '8px',
                    width: '42px',
                    height: '42px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flex: 'none',
                  }}
                >
                  {cat.code}
                </span>
                <div style={{ fontSize: '16px', fontWeight: 600 }}>
                  {categoryName(cat, locale as Locale)}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <NewsletterSection />
    </main>
  );
}
