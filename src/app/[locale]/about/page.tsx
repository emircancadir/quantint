import { getTranslations, setRequestLocale } from 'next-intl/server';
import Avatar from '@/components/Avatar';
import { getSiteUrl } from '@/lib/site-url';

const ABOUT_TAGS = ['Python', 'İstatistik', 'ML & AI', 'Quant Finance'];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'common' });
  const site = getSiteUrl();
  return {
    title: t('aboutTitle'),
    alternates: {
      canonical: `${site}/${locale}/about`,
      languages: { tr: `${site}/tr/about`, en: `${site}/en/about` },
    },
  };
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('common');

  const paragraph: React.CSSProperties = {
    margin: '0 0 18px',
    fontSize: '16.5px',
    lineHeight: 1.75,
    color: '#3D4652',
    textWrap: 'pretty',
  };

  return (
    <main
      data-q-p="1"
      style={{
        flex: 1,
        maxWidth: '920px',
        margin: '0 auto',
        padding: '72px 32px 88px',
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      <div
        data-q="about"
        style={{
          display: 'grid',
          gridTemplateColumns: '200px 1fr',
          gap: '52px',
          alignItems: 'start',
        }}
      >
        <Avatar size={200} />
        <div>
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
            {t('aboutKicker')}
          </div>
          <h1
            data-q="pageh1"
            style={{
              margin: '0 0 20px',
              fontSize: '40px',
              fontWeight: 700,
              letterSpacing: '-0.03em',
            }}
          >
            {t('aboutTitle')}
          </h1>
          <p style={paragraph}>{t('aboutP1')}</p>
          <p style={paragraph}>{t('aboutP2')}</p>
          <p style={{ ...paragraph, margin: 0 }}>{t('aboutP3')}</p>
          <div
            style={{ display: 'flex', gap: '12px', marginTop: '32px', flexWrap: 'wrap' }}
          >
            {ABOUT_TAGS.map((tag) => (
              <span
                key={tag}
                style={{
                  fontFamily: 'var(--font-plex-mono), monospace',
                  fontSize: '12.5px',
                  color: '#3168B4',
                  background: '#EDF3FB',
                  borderRadius: '999px',
                  padding: '7px 16px',
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
