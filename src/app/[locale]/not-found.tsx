import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';

export default async function NotFound() {
  const t = await getTranslations('common');

  return (
    <main
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '96px 32px',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          fontFamily: 'var(--font-plex-mono), monospace',
          fontSize: '15px',
          letterSpacing: '.14em',
          color: '#3168B4',
          marginBottom: '14px',
        }}
      >
        404
      </div>
      <h1
        style={{
          margin: '0 0 26px',
          fontSize: '36px',
          fontWeight: 700,
          letterSpacing: '-0.03em',
        }}
      >
        {t('notFoundTitle')}
      </h1>
      <Link
        href="/"
        className="q-cta-primary"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '10px',
          background: '#101820',
          color: '#FFFFFF',
          padding: '13px 26px',
          borderRadius: '9px',
          fontSize: '15.5px',
          fontWeight: 600,
          transition: 'background .2s, transform .2s',
        }}
      >
        {t('navHome')} →
      </Link>
    </main>
  );
}
