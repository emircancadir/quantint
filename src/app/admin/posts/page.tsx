import Link from 'next/link';
import { prisma } from '@/lib/db';

export default async function AdminPostsPage() {
  const posts = await prisma.post.findMany({
    include: { category: true },
    orderBy: [{ status: 'asc' }, { publishedAt: 'desc' }, { updatedAt: 'desc' }],
  });

  const df = new Intl.DateTimeFormat('tr-TR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  const statusLabel = { PUBLISHED: 'yayında', SCHEDULED: 'planlandı', DRAFT: 'taslak' } as const;

  return (
    <>
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          marginBottom: '26px',
        }}
      >
        <h1
          style={{
            margin: 0,
            fontSize: '30px',
            fontWeight: 700,
            letterSpacing: '-0.02em',
          }}
        >
          Yazılar
        </h1>
        <Link
          href="/admin/posts/new"
          className="q-subscribe-btn"
          style={{
            background: '#3168B4',
            color: '#FFFFFF',
            padding: '10px 20px',
            borderRadius: '9px',
            fontSize: '14.5px',
            fontWeight: 600,
          }}
        >
          + Yeni Yazı
        </Link>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {posts.map((p) => (
          <Link
            key={p.id}
            href={`/admin/posts/${p.id}`}
            className="q-postrow"
            style={{
              background: '#FFFFFF',
              border: '1px solid #E4E8EE',
              borderRadius: '10px',
              padding: '16px 22px',
              display: 'grid',
              gridTemplateColumns: '90px 150px 1fr auto',
              gap: '18px',
              alignItems: 'center',
              color: 'inherit',
              transition: 'transform .2s, border-color .2s',
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-plex-mono), monospace',
                fontSize: '11px',
                fontWeight: 500,
                letterSpacing: '.06em',
                textTransform: 'uppercase',
                color: p.status === 'PUBLISHED' ? '#2E7D5B' : p.status === 'SCHEDULED' ? '#3168B4' : '#B58A2C',
                background: p.status === 'PUBLISHED' ? '#EAF5EF' : p.status === 'SCHEDULED' ? '#EDF3FB' : '#FBF3E0',
                borderRadius: '6px',
                padding: '4px 8px',
                textAlign: 'center',
              }}
            >
              {statusLabel[p.status]}
            </span>
            <span
              style={{
                fontFamily: 'var(--font-plex-mono), monospace',
                fontSize: '11.5px',
                letterSpacing: '.06em',
                textTransform: 'uppercase',
                color: '#3168B4',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {p.category.nameTr}
            </span>
            <span style={{ fontSize: '15.5px', fontWeight: 600 }}>{p.titleTr}</span>
            <span
              style={{
                fontFamily: 'var(--font-plex-mono), monospace',
                fontSize: '12px',
                color: '#8A94A3',
              }}
            >
              {p.publishedAt ? df.format(p.publishedAt) : '—'}
            </span>
          </Link>
        ))}
      </div>
    </>
  );
}
