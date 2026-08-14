import { redirect } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { auth } from '@/lib/auth';
import RegisterForm from '@/components/auth/RegisterForm';
import { authCard } from '@/components/auth/formStyles';
import { safeRedirectPath } from '@/lib/redirects';

export default async function RegisterPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ next?: string }>;
}) {
  const { locale } = await params;
  const { next } = await searchParams;
  setRequestLocale(locale);

  const session = await auth();
  if (session?.user) redirect(`/${locale}`);

  const t = await getTranslations('auth');
  const redirectTo = safeRedirectPath(next, `/${locale}`);

  return (
    <main
      data-q-p="1"
      style={{ flex: 1, padding: '72px 32px 88px', boxSizing: 'border-box' }}
    >
      <div style={authCard}>
        <h1
          style={{
            margin: '0 0 10px',
            fontSize: '28px',
            fontWeight: 700,
            letterSpacing: '-0.02em',
          }}
        >
          {t('registerTitle')}
        </h1>
        <p
          style={{
            margin: '0 0 28px',
            fontSize: '14.5px',
            lineHeight: 1.6,
            color: 'var(--q-muted)',
          }}
        >
          {t('registerSub')}
        </p>
        <RegisterForm redirectTo={redirectTo} />
        <p
          style={{
            margin: '24px 0 0',
            fontSize: '14px',
            color: 'var(--q-muted)',
            textAlign: 'center',
          }}
        >
          {t('haveAccount')}{' '}
          <Link href="/login" style={{ fontWeight: 600 }}>
            {t('loginLink')}
          </Link>
        </p>
      </div>
    </main>
  );
}
