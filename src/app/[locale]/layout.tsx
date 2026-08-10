import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { routing } from '@/i18n/routing';
import { plexSans, plexMono } from '@/lib/fonts';
import Splash from '@/components/splash/Splash';
import Navbar from '@/components/Navbar';
import Ticker from '@/components/ticker/Ticker';
import Footer from '@/components/Footer';

import '../globals.css';
import 'katex/dist/katex.min.css';

// Pages read from Postgres at request time; opting out of build-time
// prerendering keeps `next build` runnable without a database (Docker image
// builds). Local Postgres answers in well under a millisecond, so per-request
// rendering is not a bottleneck for this site.
export const dynamic = 'force-dynamic';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'site' });
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

  return {
    metadataBase: new URL(site),
    title: {
      default: t('title'),
      template: '%s — quantint',
    },
    description: t('description'),
    alternates: {
      canonical: `${site}/${locale}`,
      languages: { tr: `${site}/tr`, en: `${site}/en` },
      types: {
        'application/rss+xml': `${site}/api/rss/${locale}`,
      },
    },
    openGraph: {
      siteName: 'quantint',
      type: 'website',
      locale: locale === 'en' ? 'en_US' : 'tr_TR',
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  setRequestLocale(locale);

  return (
    <html lang={locale} className={`${plexSans.variable} ${plexMono.variable}`}>
      <body>
        <NextIntlClientProvider>
          <div
            style={{
              minHeight: '100vh',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Splash />
            <Navbar />
            <Ticker />
            {children}
            <Footer />
          </div>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
