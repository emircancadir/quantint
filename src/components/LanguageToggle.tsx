'use client';

import { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/navigation';
import { Link } from '@/i18n/navigation';
import { locales, type Locale } from '@/i18n/routing';

/**
 * Real locale switch (replaces the design's `setTR`/`setEN` state toggle).
 *
 * Default behaviour: link to the same path under the other locale. On post
 * detail pages the slugs differ per language, so the plain path swap would
 * 404 — there we prefer the `<link rel="alternate" hreflang>` URLs that the
 * page's metadata already declares, keeping a single source of truth for the
 * pairing.
 */
export default function LanguageToggle() {
  const active = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [alternates, setAlternates] = useState<Record<string, string>>({});

  useEffect(() => {
    const map: Record<string, string> = {};
    document
      .querySelectorAll<HTMLLinkElement>('link[rel="alternate"][hreflang]')
      .forEach((l) => {
        map[l.hreflang] = l.href;
      });
    setAlternates(map);
  }, [pathname]);

  const pill = (locale: Locale, isActive: boolean): React.CSSProperties => ({
    fontFamily: 'var(--font-plex-mono), monospace',
    fontSize: '13px',
    padding: '6px 9px',
    borderRadius: '6px',
    cursor: 'pointer',
    color: isActive ? '#101820' : '#8A94A3',
    background: isActive ? '#EBEEF3' : 'transparent',
    border: 'none',
  });

  return (
    <>
      {locales.map((locale: Locale) => {
        const isActive = locale === active;
        const alternate = alternates[locale];

        if (alternate && !isActive) {
          return (
            <a
              key={locale}
              href={alternate}
              className="q-lang"
              style={pill(locale, isActive)}
            >
              {locale.toUpperCase()}
            </a>
          );
        }

        return (
          <Link
            key={locale}
            href={pathname}
            locale={locale}
            className="q-lang"
            style={pill(locale, isActive)}
          >
            {locale.toUpperCase()}
          </Link>
        );
      })}
    </>
  );
}
