'use client';

import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';

/**
 * Nav items. The design drove the active state off `state.view`; now it comes
 * from the real pathname, and the items are real <Link>s (crawlable).
 */
export default function NavLinks() {
  const t = useTranslations('common');
  const pathname = usePathname();

  const items = [
    { href: '/', label: t('navHome') },
    { href: '/blog', label: t('navBlog') },
    { href: '/about', label: t('navAbout') },
  ] as const;

  return (
    <>
      {items.map((item) => {
        const active =
          item.href === '/'
            ? pathname === '/'
            : pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <Link
            key={item.href}
            href={item.href}
            className="q-navlink"
            style={{
              padding: '8px 14px',
              borderRadius: '8px',
              fontSize: '15px',
              fontWeight: active ? 600 : 500,
              color: active ? 'var(--q-ink)' : 'var(--q-muted)',
              background: active ? 'var(--q-surface-muted)' : 'transparent',
            }}
          >
            {item.label}
          </Link>
        );
      })}
    </>
  );
}
