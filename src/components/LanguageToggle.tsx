'use client';

import { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import { usePathname } from '@/i18n/navigation';
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
  const [alternates, setAlternates] = useState<Record<string, string>>({});

  useEffect(() => {
    let cancelled = false;
    const read = () => {
      const map: Record<string, string> = {};
      document
        .querySelectorAll<HTMLLinkElement>('link[rel="alternate"][hreflang]')
        .forEach((link) => {
          map[link.hreflang] = link.href;
        });
      if (!cancelled && Object.keys(map).length > 0) setAlternates(map);
    };
    const observer = new MutationObserver(read);
    observer.observe(document.head, { childList: true, subtree: true });
    queueMicrotask(read);
    return () => {
      cancelled = true;
      observer.disconnect();
    };
  }, [pathname]);

  const pill = (locale: Locale, isActive: boolean): React.CSSProperties => ({
    fontFamily: 'var(--font-plex-mono), monospace',
    fontSize: '13px',
    padding: '6px 9px',
    borderRadius: '6px',
    cursor: 'pointer',
    color: isActive ? 'var(--q-ink)' : 'var(--q-dim)',
    background: isActive ? 'var(--q-surface-muted)' : 'transparent',
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
