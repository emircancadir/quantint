import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';
import { renderCommentMarkdown } from '@/lib/markdown';
import type { Locale } from '@/i18n/routing';
import CommentForm from './CommentForm';

/**
 * Server-rendered comment section: approved comments are public; the signed-in
 * viewer additionally sees their own pending ones, flagged as awaiting
 * moderation. Bodies pass through the sanitizing comment pipeline — raw HTML
 * never reaches the page.
 */
export default async function Comments({
  postId,
  locale,
  currentPath,
}: {
  postId: string;
  locale: Locale;
  currentPath: string;
}) {
  const [t, session] = await Promise.all([
    getTranslations('comments'),
    auth(),
  ]);

  const comments = await prisma.comment.findMany({
    where: {
      postId,
      OR: [
        { status: 'APPROVED' },
        ...(session?.user
          ? [{ status: 'PENDING' as const, authorId: session.user.id }]
          : []),
      ],
    },
    include: { author: { select: { name: true, email: true } } },
    orderBy: { createdAt: 'desc' },
  });

  const rendered = await Promise.all(
    comments.map(async (c) => ({
      ...c,
      html: await renderCommentMarkdown(c.body),
    })),
  );

  const df = new Intl.DateTimeFormat(locale === 'en' ? 'en-US' : 'tr-TR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  return (
    <section style={{ marginTop: '56px', borderTop: '1px solid var(--q-line)', paddingTop: '36px' }}>
      <h2
        style={{
          margin: '0 0 24px',
          fontSize: '24px',
          fontWeight: 700,
          letterSpacing: '-0.02em',
        }}
      >
        {t('title')}
        <span
          style={{
            marginLeft: '10px',
            fontFamily: 'var(--font-plex-mono), monospace',
            fontSize: '14px',
            fontWeight: 400,
            color: 'var(--q-dim)',
          }}
        >
          {rendered.filter((c) => c.status === 'APPROVED').length}
        </span>
      </h2>

      <div style={{ marginBottom: '36px' }}>
        {session?.user ? (
          <CommentForm postId={postId} />
        ) : (
          <p
            style={{
              margin: 0,
              fontSize: '14.5px',
              color: 'var(--q-muted)',
              background: 'var(--q-surface)',
              border: '1px solid var(--q-line)',
              borderRadius: '9px',
              padding: '16px 20px',
            }}
          >
            {t('loginPrompt')}{' '}
            <Link
              href={{ pathname: '/login', query: { next: currentPath } }}
              style={{ fontWeight: 600 }}
            >
              {t('loginLink')}
            </Link>
            .
          </p>
        )}
      </div>

      {rendered.length === 0 ? (
        <p style={{ margin: 0, fontSize: '14.5px', color: 'var(--q-dim)' }}>{t('empty')}</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {rendered.map((c) => (
            <article
              key={c.id}
              style={{
                background: 'var(--q-surface)',
                border: '1px solid var(--q-line)',
                borderRadius: '10px',
                padding: '18px 22px',
                opacity: c.status === 'PENDING' ? 0.75 : 1,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: '10px',
                  marginBottom: '8px',
                  flexWrap: 'wrap',
                }}
              >
                <span style={{ fontSize: '14.5px', fontWeight: 600, color: 'var(--q-ink)' }}>
                  {c.author.name ?? c.author.email.split('@')[0]}
                </span>
                <span
                  style={{
                    fontFamily: 'var(--font-plex-mono), monospace',
                    fontSize: '11.5px',
                    color: 'var(--q-dim)',
                  }}
                >
                  {df.format(c.createdAt)}
                </span>
                {c.status === 'PENDING' && (
                  <span
                    style={{
                      fontFamily: 'var(--font-plex-mono), monospace',
                      fontSize: '11px',
                      color: '#B58A2C',
                      background: '#FBF3E0',
                      borderRadius: '5px',
                      padding: '2px 8px',
                    }}
                  >
                    {t('pendingNote')}
                  </span>
                )}
              </div>
              <div
                className="q-article"
                style={{ fontSize: '14.5px', lineHeight: 1.65 }}
                dangerouslySetInnerHTML={{ __html: c.html }}
              />
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
