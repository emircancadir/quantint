'use client';

import { useActionState } from 'react';
import { useTranslations } from 'next-intl';
import { register, type AuthFormState } from '@/lib/actions/auth';
import {
  fieldLabel,
  textInput,
  primaryButton,
  errorText,
} from './formStyles';

export default function RegisterForm({ redirectTo }: { redirectTo: string }) {
  const t = useTranslations('auth');
  const [state, action, pending] = useActionState<AuthFormState, FormData>(
    register,
    null,
  );

  const errorMessage =
    state?.error === 'exists'
      ? t('errExists')
      : state?.error === 'rate-limit'
        ? t('errRateLimit')
      : state?.error === 'invalid'
        ? t('errInvalid')
        : state?.error
          ? t('errUnknown')
          : null;

  return (
    <form action={action}>
      <input type="hidden" name="redirectTo" value={redirectTo} />
      {errorMessage && <p style={errorText}>{errorMessage}</p>}
      <div style={{ marginBottom: '18px' }}>
        <label htmlFor="name" style={fieldLabel}>
          {t('name')}
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          minLength={2}
          autoComplete="name"
          style={textInput}
        />
      </div>
      <div style={{ marginBottom: '18px' }}>
        <label htmlFor="email" style={fieldLabel}>
          {t('email')}
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          style={textInput}
        />
      </div>
      <div style={{ marginBottom: '26px' }}>
        <label htmlFor="password" style={fieldLabel}>
          {t('password')}
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          style={textInput}
        />
        <div style={{ marginTop: '6px', fontSize: '12.5px', color: '#8A94A3' }}>
          {t('passwordHint')}
        </div>
      </div>
      <button
        type="submit"
        disabled={pending}
        className="q-subscribe-btn"
        style={{ ...primaryButton, opacity: pending ? 0.7 : 1 }}
      >
        {t('registerBtn')}
      </button>
    </form>
  );
}
