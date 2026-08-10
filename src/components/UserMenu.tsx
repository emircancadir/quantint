import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { auth } from '@/lib/auth';
import { logout } from '@/lib/actions/auth';

/**
 * Auth area of the navbar: the design's dormant "Giriş Yap" string, now live.
 * Signed out → login link. Signed in → name, admin shortcut when applicable,
 * and a sign-out button.
 */
export default async function UserMenu() {
  const [session, t] = await Promise.all([auth(), getTranslations('auth')]);

  if (!session?.user) {
    return (
      <Link
        href="/login"
        className="q-navlink"
        style={{
          padding: '8px 14px',
          borderRadius: '8px',
          fontSize: '15px',
          fontWeight: 500,
          color: '#5B6673',
        }}
      >
        {t('loginTitle')}
      </Link>
    );
  }

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
      {session.user.role === 'ADMIN' && (
        <a
          href="/admin"
          className="q-navlink"
          style={{
            padding: '8px 10px',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: 600,
            fontFamily: 'var(--font-plex-mono), monospace',
            color: '#3168B4',
          }}
        >
          admin
        </a>
      )}
      <span
        title={session.user.email ?? undefined}
        style={{
          padding: '8px 6px',
          fontSize: '14px',
          fontWeight: 600,
          color: '#101820',
          maxWidth: '14ch',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {session.user.name ?? session.user.email}
      </span>
      <form action={logout} style={{ display: 'inline' }}>
        <button
          type="submit"
          className="q-navlink"
          style={{
            padding: '8px 10px',
            borderRadius: '8px',
            fontSize: '13.5px',
            fontWeight: 500,
            color: '#8A94A3',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            fontFamily: 'var(--font-plex-sans), sans-serif',
          }}
        >
          {t('logout')}
        </button>
      </form>
    </span>
  );
}
