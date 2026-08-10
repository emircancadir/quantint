import { redirect } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { auth } from '@/lib/auth';
import LoginForm from '@/components/auth/LoginForm';
import { authCard } from '@/components/auth/formStyles';

export default async function LoginPage({
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
  // Only allow same-site relative redirect targets.
  const redirectTo = next?.startsWith('/') && !next.startsWith('//') ? next : `/${locale}`;

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
          {t('loginTitle')}
        </h1>
        <p
          style={{
            margin: '0 0 28px',
            fontSize: '14.5px',
            lineHeight: 1.6,
            color: '#5B6673',
          }}
        >
          {t('loginSub')}
        </p>
        <LoginForm redirectTo={redirectTo} />
        <p
          style={{
            margin: '24px 0 0',
            fontSize: '14px',
            color: '#5B6673',
            textAlign: 'center',
          }}
        >
          {t('noAccount')}{' '}
          <Link href="/register" style={{ fontWeight: 600 }}>
            {t('registerLink')}
          </Link>
        </p>
      </div>
    </main>
  );
}
