import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import type { Locale } from '@/i18n/routing';
import { getCategories, categoryName } from '@/lib/categories';
import { prisma } from '@/lib/db';
import { getSiteUrl } from '@/lib/site-url';
import NewsletterSection from '@/components/NewsletterSection';
import Reveal from '@/components/Reveal';
import Logo from '@/components/Logo';

const PRINCIPLES = ['rigor', 'reproducible', 'accessible'] as const;
const PROCESS = ['question', 'research', 'verify', 'publish'] as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'about' });
  const site = getSiteUrl();
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    alternates: {
      canonical: `${site}/${locale}/about`,
      languages: { tr: `${site}/tr/about`, en: `${site}/en/about` },
    },
  };
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const loc = locale as Locale;
  const t = await getTranslations('about');
  const common = await getTranslations('common');
  const [categories, postCount] = await Promise.all([
    getCategories(),
    prisma.post.count({
      where: {
        status: { in: ['PUBLISHED', 'SCHEDULED'] },
        publishedAt: { lte: new Date() },
      },
    }),
  ]);

  const site = getSiteUrl();
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: t('metaTitle'),
    description: t('metaDescription'),
    url: `${site}/${locale}/about`,
    mainEntity: {
      '@type': 'Organization',
      name: 'quantint',
      url: site,
      description: t('missionText'),
      knowsAbout: categories.map((category) => categoryName(category, loc)),
    },
  };

  return (
    <main className="q-about-page">
      <Reveal />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c'),
        }}
      />

      <section className="q-about-hero">
        <div className="q-about-copy">
          <div className="q-kicker">{t('kicker')}</div>
          <h1 data-q="pageh1">{t('title')}</h1>
          <p className="q-about-lead">{t('lead')}</p>
          <p className="q-about-intro">{t('intro')}</p>
          <div className="q-about-actions">
            <Link href="/blog" className="q-cta-primary">
              {t('explore')} <span aria-hidden="true">→</span>
            </Link>
            <Link href="/#newsletter" className="q-cta-secondary">
              {common('navSubscribe')}
            </Link>
          </div>
        </div>

        <div className="q-about-visual" aria-hidden="true">
          <div className="q-about-orbit q-about-orbit-one"><i /><i /><i /></div>
          <div className="q-about-orbit q-about-orbit-two"><i /><i /></div>
          <div className="q-about-core">
            <Logo size={78} />
          </div>
          <code>μ · σ · β · α</code>
        </div>
      </section>

      <section className="q-about-stats" aria-label={t('statsLabel')}>
        <div><strong>{postCount}</strong><span>{t('statPosts')}</span></div>
        <div><strong>{categories.length}</strong><span>{t('statTopics')}</span></div>
        <div><strong>2</strong><span>{t('statLanguages')}</span></div>
        <div><strong>100%</strong><span>{t('statTransparent')}</span></div>
      </section>

      <section className="q-about-section q-about-mission" data-reveal="true">
        <div>
          <div className="q-kicker">{t('missionKicker')}</div>
          <h2>{t('missionTitle')}</h2>
        </div>
        <div>
          <p>{t('missionText')}</p>
          <p>{t('missionText2')}</p>
        </div>
      </section>

      <section className="q-about-section" data-reveal="true">
        <div className="q-about-section-heading">
          <div className="q-kicker">{t('principlesKicker')}</div>
          <h2>{t('principlesTitle')}</h2>
          <p>{t('principlesLead')}</p>
        </div>
        <div className="q-principle-grid">
          {PRINCIPLES.map((key, index) => (
            <article key={key}>
              <span>0{index + 1}</span>
              <h3>{t(`principles.${key}.title`)}</h3>
              <p>{t(`principles.${key}.text`)}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="q-about-section q-process" data-reveal="true">
        <div className="q-about-section-heading">
          <div className="q-kicker">{t('processKicker')}</div>
          <h2>{t('processTitle')}</h2>
        </div>
        <ol>
          {PROCESS.map((key, index) => (
            <li key={key}>
              <span>{String(index + 1).padStart(2, '0')}</span>
              <div><h3>{t(`process.${key}.title`)}</h3><p>{t(`process.${key}.text`)}</p></div>
            </li>
          ))}
        </ol>
      </section>

      <section className="q-about-section" data-reveal="true">
        <div className="q-about-section-heading">
          <div className="q-kicker">{t('topicsKicker')}</div>
          <h2>{t('topicsTitle')}</h2>
          <p>{t('topicsLead')}</p>
        </div>
        <div className="q-about-topics">
          {categories.map((category) => (
            <Link
              key={category.key}
              href={{ pathname: '/blog', query: { cat: category.key } }}
            >
              <span>{category.code}</span>
              <strong>{categoryName(category, loc)}</strong>
              <i aria-hidden="true">↗</i>
            </Link>
          ))}
        </div>
      </section>

      <section className="q-about-disclosure" data-reveal="true">
        <div><span>!</span></div>
        <div>
          <div className="q-kicker">{t('disclosureKicker')}</div>
          <h2>{t('disclosureTitle')}</h2>
          <p>{t('disclosureText')}</p>
        </div>
      </section>

      <NewsletterSection standalone={false} />
    </main>
  );
}
