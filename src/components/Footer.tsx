import { getLocale, getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { getCategories, categoryName } from '@/lib/categories';
import type { Locale } from '@/i18n/routing';
import Logo from './Logo';
import Wordmark from './Wordmark';
import Avatar from './Avatar';

const columnLabel: React.CSSProperties = {
  fontFamily: 'var(--font-plex-mono), monospace',
  fontSize: '11.5px',
  letterSpacing: '.12em',
  textTransform: 'uppercase',
  color: '#6B7684',
  marginBottom: '16px',
};

const columnList: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
  fontSize: '14.5px',
};

export default async function Footer() {
  const t = await getTranslations('common');
  const locale = (await getLocale()) as Locale;
  const categories = await getCategories();

  return (
    <footer style={{ background: '#101820', color: '#9AA6B5', marginTop: 'auto' }}>
      <div
        data-q="footer"
        data-q-p="1"
        style={{
          maxWidth: '1160px',
          margin: '0 auto',
          padding: '56px 32px 40px',
          display: 'grid',
          gridTemplateColumns: '1.4fr 1fr 1fr',
          gap: '48px',
        }}
      >
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '16px',
            }}
          >
            <Logo size={28} ink="#FFFFFF" accent="#6E9FDD" />
            <Wordmark size={19} color="#FFFFFF" accent="#6E9FDD" />
          </div>
          <p style={{ margin: 0, fontSize: '14px', lineHeight: 1.65, maxWidth: '36ch' }}>
            {t('footerTag')}
          </p>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginTop: '24px',
              paddingTop: '20px',
              borderTop: '1px solid #223041',
              maxWidth: '40ch',
            }}
          >
            <Avatar size={36} dark />
            <span style={{ fontSize: '13px', lineHeight: 1.5, color: '#9AA6B5', flex: 1 }}>
              {t('footerBio')}
            </span>
            <div style={{ display: 'flex', gap: '10px', flex: 'none' }}>
              <a
                href="https://github.com"
                aria-label="GitHub"
                className="q-social"
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
                </svg>
              </a>
              <a
                href="https://linkedin.com"
                aria-label="LinkedIn"
                className="q-social"
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 0h-14c-2.76 0-5 2.24-5 5v14c0 2.76 2.24 5 5 5h14c2.76 0 5-2.24 5-5v-14c0-2.76-2.24-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.27c-.97 0-1.75-.79-1.75-1.76s.78-1.76 1.75-1.76 1.75.79 1.75 1.76-.78 1.76-1.75 1.76zm13.5 12.27h-3v-5.6c0-3.37-4-3.11-4 0v5.6h-3v-11h3v1.77c1.4-2.59 7-2.78 7 2.48v6.75z" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        <div>
          <div style={columnLabel}>{t('footerNav')}</div>
          <div style={columnList}>
            <Link href="/" className="q-footlink">
              {t('navHome')}
            </Link>
            <Link href="/blog" className="q-footlink">
              {t('navBlog')}
            </Link>
            <Link href="/about" className="q-footlink">
              {t('navAbout')}
            </Link>
          </div>
        </div>

        <div>
          <div style={columnLabel}>{t('footerTopics')}</div>
          <div style={columnList}>
            {categories.slice(0, 4).map((cat) => (
              <Link
                key={cat.key}
                href={{ pathname: '/blog', query: { cat: cat.key } }}
                className="q-footlink"
              >
                {categoryName(cat, locale)}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div style={{ borderTop: '1px solid #223041' }}>
        <div
          data-q="footbar"
          data-q-p="1"
          style={{
            maxWidth: '1160px',
            margin: '0 auto',
            padding: '20px 32px',
            display: 'flex',
            justifyContent: 'space-between',
            fontFamily: 'var(--font-plex-mono), monospace',
            fontSize: '12px',
            color: '#6B7684',
          }}
        >
          <span>© {new Date().getFullYear()} quantint</span>
          <span>{t('footerNote')}</span>
        </div>
      </div>
    </footer>
  );
}
