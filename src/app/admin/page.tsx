import Link from 'next/link';
import { prisma } from '@/lib/db';

const card: React.CSSProperties = {
  background: '#FFFFFF',
  border: '1px solid #E4E8EE',
  borderRadius: '12px',
  padding: '24px 28px',
  display: 'block',
  color: 'inherit',
};

const num: React.CSSProperties = {
  fontSize: '34px',
  fontWeight: 700,
  letterSpacing: '-0.02em',
  color: '#101820',
  fontFamily: 'var(--font-plex-mono), monospace',
};

const label: React.CSSProperties = {
  fontSize: '13.5px',
  color: '#5B6673',
  marginTop: '4px',
};

export default async function AdminDashboard() {
  const [posts, drafts, pendingComments, subscribers, users] = await Promise.all([
    prisma.post.count({ where: { status: 'PUBLISHED' } }),
    prisma.post.count({ where: { status: 'DRAFT' } }),
    prisma.comment.count({ where: { status: 'PENDING' } }),
    prisma.newsletterSubscriber.count({ where: { status: 'ACTIVE' } }),
    prisma.user.count(),
  ]);

  const stats = [
    { href: '/admin/posts', value: posts, label: 'Yayında yazı' },
    { href: '/admin/posts', value: drafts, label: 'Taslak' },
    { href: '/admin/comments', value: pendingComments, label: 'Bekleyen yorum' },
    { href: '/admin/subscribers', value: subscribers, label: 'Bülten abonesi' },
    { href: '/admin', value: users, label: 'Kayıtlı kullanıcı' },
  ];

  return (
    <>
      <h1
        style={{
          margin: '0 0 28px',
          fontSize: '30px',
          fontWeight: 700,
          letterSpacing: '-0.02em',
        }}
      >
        Panel
      </h1>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '18px',
        }}
      >
        {stats.map((s, i) => (
          <Link key={i} href={s.href} className="q-pillar" style={card}>
            <div style={num}>{s.value}</div>
            <div style={label}>{s.label}</div>
          </Link>
        ))}
      </div>
    </>
  );
}
