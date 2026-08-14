'use client';

import { useSyncExternalStore } from 'react';
import { useLocale } from 'next-intl';

const STORAGE_KEY = 'quantint-theme';
const THEME_EVENT = 'quantint-theme-change';

type Theme = 'light' | 'dark';

function getTheme(): Theme {
  if (typeof document === 'undefined') return 'light';
  return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
}

function subscribe(callback: () => void) {
  window.addEventListener(THEME_EVENT, callback);
  return () => window.removeEventListener(THEME_EVENT, callback);
}

export default function ThemeToggle() {
  const locale = useLocale();
  const theme = useSyncExternalStore(subscribe, getTheme, () => 'light');
  const isDark = theme === 'dark';
  const label = isDark
    ? (locale === 'tr' ? 'Açık temaya geç' : 'Switch to light theme')
    : (locale === 'tr' ? 'Koyu temaya geç' : 'Switch to dark theme');

  function toggleTheme() {
    const nextTheme: Theme = isDark ? 'light' : 'dark';
    document.documentElement.dataset.theme = nextTheme;

    try {
      localStorage.setItem(STORAGE_KEY, nextTheme);
    } catch {
      // The visual preference still works when storage is unavailable.
    }

    window.dispatchEvent(new Event(THEME_EVENT));
  }

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label={label}
      title={label}
      className="q-theme-toggle"
      onClick={toggleTheme}
    >
      <span aria-hidden="true" className="q-theme-icon">☀</span>
      <span aria-hidden="true" className="q-theme-track">
        <span className="q-theme-thumb" />
      </span>
      <span aria-hidden="true" className="q-theme-icon">☾</span>
    </button>
  );
}
