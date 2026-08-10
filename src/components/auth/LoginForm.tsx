'use client';

import { useActionState } from 'react';
import { useTranslations } from 'next-intl';
import { login, type AuthFormState } from '@/lib/actions/auth';
import {
  fieldLabel,
  textInput,
  primaryButton,
  errorText,
} from './formStyles';

export default function LoginForm({ redirectTo }: { redirectTo: string }) {
  const t = useTranslations('auth');
  const [state, action, pending] = useActionState<AuthFormState, FormData>(
    login,
    null,
  );

  return (
    <form action={action}>
      <input type="hidden" name="redirectTo" value={redirectTo} />
      {state?.error && (
        <p style={errorText}>
          {state.error === 'credentials' ? t('errCredentials') : t('errInvalid')}
        </p>
      )}
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
          autoComplete="current-password"
          style={textInput}
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="q-subscribe-btn"
        style={{ ...primaryButton, opacity: pending ? 0.7 : 1 }}
      >
        {t('loginBtn')}
      </button>
    </form>
  );
}
