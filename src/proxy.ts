import createMiddleware from 'next-intl/middleware';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { routing } from './i18n/routing';

const intl = createMiddleware(routing);

export default function proxy(req: NextRequest) {
  // /admin lives outside the locale tree — don't let next-intl redirect it to
  // /tr/admin. Access control happens server-side in app/admin/layout.tsx
  // (requireAdmin), which runs on every request.
  if (req.nextUrl.pathname.startsWith('/admin')) {
    return NextResponse.next();
  }
  return intl(req);
}

export const config = {
  // Run on every path except API routes, Next internals and static files.
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
