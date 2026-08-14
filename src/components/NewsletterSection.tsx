import { getTranslations } from 'next-intl/server';
import NewsletterForm from './NewsletterForm';

/** The newsletter card; used on the home page and under the blog archive. */
export default async function NewsletterSection({
  standalone = true,
}: {
  standalone?: boolean;
}) {
  const t = await getTranslations('common');

  const card = (
    <div
      data-q="news"
      data-reveal="true"
      style={{
        border: '1px solid var(--q-line)',
        background: 'var(--q-surface)',
        borderRadius: '16px',
        padding: '52px 56px',
        display: 'grid',
        gridTemplateColumns: '1.2fr 1fr',
        gap: '48px',
        alignItems: 'center',
        ...(standalone ? {} : { marginTop: '56px' }),
      }}
    >
      <div>
        <h2
          style={{
            margin: '0 0 12px',
            fontSize: '28px',
            fontWeight: 700,
            letterSpacing: '-0.02em',
          }}
        >
          {t('newsTitle')}
        </h2>
        <p style={{ margin: 0, fontSize: '15.5px', lineHeight: 1.65, color: 'var(--q-muted)' }}>
          {t('newsSub')}
        </p>
      </div>
      <NewsletterForm />
    </div>
  );

  if (!standalone) return <div id="newsletter">{card}</div>;

  return (
    <section
      id="newsletter"
      data-q-p="1"
      style={{
        maxWidth: '1160px',
        margin: '0 auto',
        padding: '64px 32px 88px',
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      {card}
    </section>
  );
}
