import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import Logo from './Logo';
import Wordmark from './Wordmark';
import NavLinks from './NavLinks';
import LanguageToggle from './LanguageToggle';
import ThemeToggle from './ThemeToggle';
import UserMenu from './UserMenu';

export default async function Navbar() {
  const t = await getTranslations('common');

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: 'var(--q-nav-bg)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--q-line)',
      }}
    >
      <div
        data-q="navbar"
        style={{
          maxWidth: '1160px',
          margin: '0 auto',
          padding: '0 32px',
          height: '68px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '24px',
        }}
      >
        <Link
          href="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            color: 'inherit',
          }}
        >
          {/*
            The splash animation measures this element and flies its nine dots
            onto it, then hands over by fading it in. Until that handover the
            logo is hidden via the CSS variable the splash controls; when no
            splash runs the variable is unset and the fallback (1) applies.
          */}
          <Logo
            id="q-nav-logo"
            style={{
              opacity: 'var(--q-navlogo-opacity, 1)',
              transition: 'opacity .3s ease',
            }}
          />
          <Wordmark />
        </Link>

        <nav
          data-q="nav"
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <NavLinks />
          <span
            style={{
              width: '1px',
              height: '22px',
              background: 'var(--q-line-soft)',
              margin: '0 8px',
            }}
          />
          <LanguageToggle />
          <ThemeToggle />
          <UserMenu />
          <Link
            href="/#newsletter"
            className="q-subscribe-nav"
            style={{
              padding: '8px 18px',
              marginLeft: '4px',
              borderRadius: '8px',
              fontSize: '14.5px',
              fontWeight: 600,
              color: '#FFFFFF',
              background: 'var(--q-button-bg)',
              whiteSpace: 'nowrap',
            }}
          >
            {t('navSubscribe')}
          </Link>
        </nav>
      </div>
    </header>
  );
}
