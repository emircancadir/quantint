import { prisma } from '@/lib/db';
import { moderateComment } from '@/lib/actions/comments';
import type { CommentStatus } from '@/generated/prisma/client';
import Link from 'next/link';

const FILTERS: Array<{ key: CommentStatus | 'ALL'; label: string }> = [
  { key: 'PENDING', label: 'Bekleyen' },
  { key: 'APPROVED', label: 'Onaylı' },
  { key: 'REJECTED', label: 'Reddedilen' },
  { key: 'SPAM', label: 'Spam' },
  { key: 'ALL', label: 'Tümü' },
];

const ACTION_BUTTONS: Array<{
  status: CommentStatus;
  label: string;
  color: string;
  bg: string;
}> = [
  { status: 'APPROVED', label: 'Onayla', color: '#2E7D5B', bg: '#EAF5EF' },
  { status: 'REJECTED', label: 'Reddet', color: '#B3261E', bg: '#FDF1F0' },
  { status: 'SPAM', label: 'Spam', color: '#8A94A3', bg: '#EBEEF3' },
];

export default async function AdminCommentsPage({
  searchParams,
}: {
  searchParams: Promise<{ f?: string }>;
}) {
  const { f } = await searchParams;
  const filter = (FILTERS.find((x) => x.key === f)?.key ?? 'PENDING') as
    | CommentStatus
    | 'ALL';

  const comments = await prisma.comment.findMany({
    where: filter === 'ALL' ? {} : { status: filter },
    include: {
      author: { select: { name: true, email: true } },
      post: { select: { titleTr: true, slugTr: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });

  const df = new Intl.DateTimeFormat('tr-TR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <>
      <h1
        style={{
          margin: '0 0 22px',
          fontSize: '30px',
          fontWeight: 700,
          letterSpacing: '-0.02em',
        }}
      >
        Yorumlar
      </h1>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '26px', flexWrap: 'wrap' }}>
        {FILTERS.map((x) => (
          <Link
            key={x.key}
            href={`/admin/comments?f=${x.key}`}
            className="q-chip"
            style={{
              padding: '7px 15px',
              borderRadius: '999px',
              fontSize: '13px',
              fontWeight: 500,
              border: `1px solid ${filter === x.key ? '#101820' : '#DCE1E8'}`,
              background: filter === x.key ? '#101820' : '#FFFFFF',
              color: filter === x.key ? '#FFFFFF' : '#3D4652',
            }}
          >
            {x.label}
          </Link>
        ))}
      </div>

      {comments.length === 0 ? (
        <p style={{ color: '#8A94A3', fontSize: '14.5px' }}>Bu filtrede yorum yok.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {comments.map((c) => (
            <article
              key={c.id}
              style={{
                background: '#FFFFFF',
                border: '1px solid #E4E8EE',
                borderRadius: '10px',
                padding: '18px 22px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  gap: '12px',
                  alignItems: 'baseline',
                  flexWrap: 'wrap',
                  marginBottom: '10px',
                  fontSize: '13px',
                }}
              >
                <strong style={{ fontSize: '14.5px' }}>
                  {c.author.name ?? c.author.email}
                </strong>
                <span style={{ color: '#8A94A3' }}>{c.author.email}</span>
                <span
                  style={{
                    fontFamily: 'var(--font-plex-mono), monospace',
                    fontSize: '11.5px',
                    color: '#8A94A3',
                  }}
                >
                  {df.format(c.createdAt)}
                </span>
                <span style={{ color: '#8A94A3' }}>·</span>
                <span style={{ color: '#3168B4', fontSize: '13px' }}>
                  {c.post.titleTr}
                </span>
              </div>
              {/* Comment bodies are user input — render as plain text here. */}
              <p
                style={{
                  margin: '0 0 14px',
                  fontSize: '14.5px',
                  lineHeight: 1.65,
                  color: '#3D4652',
                  whiteSpace: 'pre-wrap',
                }}
              >
                {c.body}
              </p>
              <div style={{ display: 'flex', gap: '8px' }}>
                {ACTION_BUTTONS.filter((b) => b.status !== c.status).map((b) => (
                  <form key={b.status} action={moderateComment}>
                    <input type="hidden" name="id" value={c.id} />
                    <input type="hidden" name="status" value={b.status} />
                    <button
                      type="submit"
                      style={{
                        background: b.bg,
                        color: b.color,
                        border: 'none',
                        borderRadius: '7px',
                        padding: '8px 16px',
                        fontSize: '13px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        fontFamily: 'var(--font-plex-sans), sans-serif',
                      }}
                    >
                      {b.label}
                    </button>
                  </form>
                ))}
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  );
}
