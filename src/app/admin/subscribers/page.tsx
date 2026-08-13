import { prisma } from '@/lib/db';
import Link from 'next/link';

const STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  ACTIVE: { label: 'aktif', color: '#2E7D5B', bg: '#EAF5EF' },
  PENDING: { label: 'beklemede', color: '#B58A2C', bg: '#FBF3E0' },
  UNSUBSCRIBED: { label: 'ayrıldı', color: '#8A94A3', bg: '#EBEEF3' },
};

export default async function AdminSubscribersPage() {
  const subscribers = await prisma.newsletterSubscriber.findMany({
    orderBy: { createdAt: 'desc' },
  });

  const df = new Intl.DateTimeFormat('tr-TR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

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
          Aboneler
          <span
            style={{
              marginLeft: '12px',
              fontFamily: 'var(--font-plex-mono), monospace',
              fontSize: '15px',
              fontWeight: 400,
              color: '#8A94A3',
            }}
          >
            {subscribers.length}
          </span>
        </h1>
        <Link
          href="/admin/subscribers/export"
          className="q-subscribe-btn"
          style={{
            background: '#101820',
            color: '#FFFFFF',
            padding: '10px 20px',
            borderRadius: '9px',
            fontSize: '14px',
            fontWeight: 600,
          }}
        >
          CSV indir
        </Link>
      </div>

      {subscribers.length === 0 ? (
        <p style={{ color: '#8A94A3', fontSize: '14.5px' }}>Henüz abone yok.</p>
      ) : (
        <div
          style={{
            background: '#FFFFFF',
            border: '1px solid #E4E8EE',
            borderRadius: '10px',
            overflow: 'hidden',
          }}
        >
          {subscribers.map((s, i) => {
            const st = STATUS_LABELS[s.status] ?? STATUS_LABELS.ACTIVE;
            return (
              <div
                key={s.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 90px 60px 120px',
                  gap: '16px',
                  alignItems: 'center',
                  padding: '13px 20px',
                  borderTop: i ? '1px solid #EEF1F5' : 'none',
                  fontSize: '14px',
                }}
              >
                <span style={{ fontFamily: 'var(--font-plex-mono), monospace', fontSize: '13px' }}>
                  {s.email}
                </span>
                <span
                  style={{
                    fontFamily: 'var(--font-plex-mono), monospace',
                    fontSize: '11px',
                    color: st.color,
                    background: st.bg,
                    borderRadius: '6px',
                    padding: '3px 8px',
                    textAlign: 'center',
                  }}
                >
                  {st.label}
                </span>
                <span
                  style={{
                    fontFamily: 'var(--font-plex-mono), monospace',
                    fontSize: '12px',
                    color: '#8A94A3',
                    textTransform: 'uppercase',
                  }}
                >
                  {s.locale}
                </span>
                <span
                  style={{
                    fontFamily: 'var(--font-plex-mono), monospace',
                    fontSize: '12px',
                    color: '#8A94A3',
                    textAlign: 'right',
                  }}
                >
                  {df.format(s.createdAt)}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
