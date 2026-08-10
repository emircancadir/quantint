import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { requireAdmin } from '@/lib/auth';
import { logout } from '@/lib/actions/auth';
import { plexSans, plexMono } from '@/lib/fonts';
import Logo from '@/components/Logo';

import '../globals.css';

export const metadata: Metadata = {
  title: 'quantint · admin',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

const NAV = [
  { href: '/admin', label: 'Panel' },
  { href: '/admin/posts', label: 'Yazılar' },
  { href: '/admin/categories', label: 'Kategoriler' },
  { href: '/admin/comments', label: 'Yorumlar' },
  { href: '/admin/subscribers', label: 'Aboneler' },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Server-side gate on every request. The proxy deliberately does not guard
  // /admin — this layout is the single enforcement point (defense in depth
  // beyond the per-action requireAdmin calls).
  const session = await requireAdmin();
  if (!session) redirect('/tr/login?next=/admin');

  return (
    <html lang="tr" className={`${plexSans.variable} ${plexMono.variable}`}>
      <body>
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
          <header
            style={{
              position: 'sticky',
              top: 0,
              zIndex: 50,
              background: '#101820',
              color: '#C7CFDA',
            }}
          >
            <div
              style={{
                maxWidth: '1160px',
                margin: '0 auto',
                padding: '0 32px',
                height: '58px',
                display: 'flex',
                alignItems: 'center',
                gap: '20px',
              }}
            >
              <Link
                href="/admin"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  color: '#FFFFFF',
                }}
              >
                <Logo size={24} ink="#FFFFFF" accent="#6E9FDD" />
                <span style={{ fontSize: '16px', fontWeight: 600 }}>
                  quantint
                  <span
                    style={{
                      color: '#6E9FDD',
                      fontFamily: 'var(--font-plex-mono), monospace',
                      fontSize: '13px',
                      marginLeft: '8px',
                    }}
                  >
                    admin
                  </span>
                </span>
              </Link>
              <nav style={{ display: 'flex', gap: '4px', flex: 1 }}>
                {NAV.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="q-footlink"
                    style={{
                      padding: '7px 12px',
                      borderRadius: '7px',
                      fontSize: '14px',
                    }}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
              <Link
                href="/tr"
                className="q-footlink"
                style={{ fontSize: '13.5px' }}
              >
                Siteye dön →
              </Link>
              <form action={logout}>
                <button
                  type="submit"
                  className="q-footlink"
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '13.5px',
                    fontFamily: 'var(--font-plex-sans), sans-serif',
                    padding: 0,
                  }}
                >
                  Çıkış
                </button>
              </form>
            </div>
          </header>
          <main
            style={{
              flex: 1,
              maxWidth: '1160px',
              margin: '0 auto',
              padding: '40px 32px 64px',
              width: '100%',
              boxSizing: 'border-box',
            }}
          >
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
