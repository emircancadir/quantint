import { prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

/** CSV export of newsletter subscribers — admin only. */
export async function GET() {
  const session = await requireAdmin();
  if (!session) return new Response('Forbidden', { status: 403 });

  const subscribers = await prisma.newsletterSubscriber.findMany({
    orderBy: { createdAt: 'asc' },
  });

  const escape = (v: string) => `"${v.replace(/"/g, '""')}"`;
  const rows = [
    'email,status,locale,created_at',
    ...subscribers.map((s) =>
      [
        escape(s.email),
        s.status,
        s.locale,
        s.createdAt.toISOString(),
      ].join(','),
    ),
  ];

  return new Response(rows.join('\n') + '\n', {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="quantint-subscribers.csv"',
    },
  });
}
