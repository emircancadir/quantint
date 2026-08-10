/**
 * Runs once when the Next.js server boots (dev and production). Starts the
 * ticker poller inside the app process — no separate worker needed at this
 * scale, and the DB upserts are idempotent anyway.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { startTickerPoller } = await import('@/lib/ticker/poller');
    startTickerPoller();
  }
}
