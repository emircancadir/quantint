'use client';

import { useActionState } from 'react';
import { useTranslations } from 'next-intl';
import { submitComment, type CommentFormState } from '@/lib/actions/comments';
import { textInput, errorText } from '@/components/auth/formStyles';

export default function CommentForm({ postId }: { postId: string }) {
  const t = useTranslations('comments');
  const [state, action, pending] = useActionState<CommentFormState, FormData>(
    submitComment,
    null,
  );

  if (state?.ok) {
    return (
      <div
        style={{
          fontSize: '14.5px',
          fontWeight: 600,
          color: '#2E7D5B',
          background: '#EAF5EF',
          border: '1px solid #CBE7D8',
          borderRadius: '9px',
          padding: '14px 18px',
        }}
      >
        ✓ {t('sent')}
      </div>
    );
  }

  const errorKey =
    state?.error === 'auth'
      ? 'errAuth'
      : state?.error === 'invalid'
        ? 'errInvalid'
        : state?.error === 'rate-limit'
          ? 'errRateLimit'
          : state?.error
            ? 'errUnknown'
            : null;

  return (
    <form action={action}>
      <input type="hidden" name="postId" value={postId} />
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        style={{ position: 'absolute', left: '-9999px', width: '1px', height: '1px' }}
      />
      {errorKey && <p style={errorText}>{t(errorKey)}</p>}
      <textarea
        name="body"
        required
        minLength={3}
        maxLength={4000}
        rows={4}
        placeholder={t('placeholder')}
        style={{ ...textInput, resize: 'vertical', marginBottom: '12px' }}
      />
      <button
        type="submit"
        disabled={pending}
        className="q-subscribe-btn"
        style={{
          background: '#3168B4',
          color: '#FFFFFF',
          padding: '11px 26px',
          borderRadius: '9px',
          fontSize: '14.5px',
          fontWeight: 600,
          cursor: 'pointer',
          border: 'none',
          fontFamily: 'var(--font-plex-sans), sans-serif',
          opacity: pending ? 0.7 : 1,
        }}
      >
        {t('submit')}
      </button>
    </form>
  );
}
