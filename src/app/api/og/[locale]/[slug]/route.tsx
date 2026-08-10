import { ImageResponse } from 'next/og';
import { locales, type Locale } from '@/i18n/routing';
import { getPostBySlug } from '@/lib/posts';

export const dynamic = 'force-dynamic';

/**
 * Dynamic Open Graph card per post: brand background, category kicker, title,
 * the nine-dot logo. 1200×630.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ locale: string; slug: string }> },
) {
  const { locale, slug } = await params;
  if (!locales.includes(locale as Locale)) {
    return new Response('Not found', { status: 404 });
  }
  const post = await getPostBySlug(locale as Locale, slug);
  if (!post) return new Response('Not found', { status: 404 });

  const DOTS: Array<[number, number, string]> = [
    [30, 5, '#101820'],
    [47.7, 12.3, '#101820'],
    [55, 30, '#101820'],
    [30, 55, '#101820'],
    [12.3, 47.7, '#101820'],
    [5, 30, '#101820'],
    [12.3, 12.3, '#101820'],
    [47.7, 47.7, '#3168B4'],
    [59.1, 59.1, '#3168B4'],
  ];

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: 'linear-gradient(180deg,#FBFCFD 0%,#F6F7F9 100%)',
          padding: '64px 72px',
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            fontSize: 24,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: '#3168B4',
          }}
        >
          {post.cat}
        </div>
        <div
          style={{
            display: 'flex',
            fontSize: post.title.length > 70 ? 52 : 62,
            fontWeight: 700,
            lineHeight: 1.15,
            color: '#101820',
            letterSpacing: '-0.02em',
            maxWidth: '1000px',
          }}
        >
          {post.title}
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            <svg width="52" height="52" viewBox="0 0 64 64">
              {DOTS.map(([cx, cy, fill], i) => (
                <circle key={i} cx={cx} cy={cy} r="4.9" fill={fill} />
              ))}
            </svg>
            <div style={{ display: 'flex', fontSize: 34, fontWeight: 600, color: '#101820' }}>
              quantint<span style={{ color: '#3168B4' }}>.</span>
            </div>
          </div>
          <div style={{ display: 'flex', fontSize: 22, color: '#8A94A3' }}>
            {post.date}
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
