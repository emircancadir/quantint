import { getTranslations } from 'next-intl/server';
import NextLink from 'next/link';
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
          color: 'var(--q-muted)',
        }}
      >
        {t('loginTitle')}
      </Link>
    );
  }

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
      {session.user.role === 'ADMIN' && (
        <NextLink
          href="/admin"
          className="q-navlink"
          style={{
            padding: '8px 10px',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: 600,
            fontFamily: 'var(--font-plex-mono), monospace',
            color: 'var(--q-blue)',
          }}
        >
          admin
        </NextLink>
      )}
      <span
        title={session.user.email ?? undefined}
        style={{
          padding: '8px 6px',
          fontSize: '14px',
          fontWeight: 600,
          color: 'var(--q-ink)',
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
            color: 'var(--q-dim)',
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
