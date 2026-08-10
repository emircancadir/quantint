import { defineRouting } from 'next-intl/routing';

export const locales = ['tr', 'en'] as const;
export type Locale = (typeof locales)[number];

export const routing = defineRouting({
  locales,
  defaultLocale: 'tr',
  // Both locales carry an explicit prefix (/tr, /en) so canonical URLs and
  // hreflang pairs are unambiguous; "/" redirects to "/tr".
  localePrefix: 'always',
});
