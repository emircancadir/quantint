'use client';

import { useActionState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import {
  subscribeNewsletter,
  type NewsletterFormState,
} from '@/lib/actions/newsletter';

/**
 * Newsletter signup, wired to the real server action: the address is stored in
 * the NewsletterSubscriber table. No email is sent (email work is on hold).
 * Success copy matches the design export verbatim.
 */
export default function NewsletterForm() {
  const t = useTranslations('common');
  const locale = useLocale();
  const [state, action, pending] = useActionState<NewsletterFormState, FormData>(
    subscribeNewsletter,
    null,
  );

  if (state?.ok) {
    return (
      <div
        style={{
          fontSize: '16px',
          fontWeight: 600,
          color: '#2E7D5B',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}
      >
        ✓ {t('newsOk')}
      </div>
    );
  }

  return (
    <div>
      <form action={action} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <input type="hidden" name="locale" value={locale} />
        {/* Honeypot — hidden from humans, tempting for bots. */}
        <input
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          style={{ position: 'absolute', left: '-9999px', width: '1px', height: '1px' }}
        />
        <input
          type="email"
          name="email"
          required
          placeholder={t('newsPh')}
          style={{
            flex: 1,
            border: '1px solid var(--q-line-soft)',
            borderRadius: '9px',
            padding: '13px 16px',
            fontSize: '15px',
            fontFamily: 'var(--font-plex-sans), sans-serif',
            background: 'var(--q-surface-soft)',
            outline: 'none',
            color: 'var(--q-ink)',
            minWidth: '200px',
          }}
        />
        <button
          type="submit"
          disabled={pending}
          className="q-subscribe-btn"
          style={{
            background: 'var(--q-button-bg)',
            color: '#FFFFFF',
            padding: '13px 24px',
            borderRadius: '9px',
            fontSize: '15px',
            fontWeight: 600,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            border: 'none',
            fontFamily: 'var(--font-plex-sans), sans-serif',
            opacity: pending ? 0.7 : 1,
          }}
        >
          {t('newsBtn')}
        </button>
      </form>
      {state?.error && (
        <div style={{ marginTop: '10px', fontSize: '13.5px', color: '#B3261E' }}>
          {state.error === 'invalid' ? t('newsInvalid') : t('newsError')}
        </div>
      )}
    </div>
  );
}
