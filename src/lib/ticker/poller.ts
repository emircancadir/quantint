import 'server-only';

import { prisma } from '@/lib/db';
import { fetchLiveQuotes } from './provider';
import { parsePollIntervalMs } from './config';
import { formatTickerChange, formatTickerPrice } from './format';

/**
 * Background poller: fetches live quotes and upserts them into the Quote
 * table. Started once per server process from instrumentation.ts. Upserts are
 * idempotent, so an accidental second runner is harmless.
 */

const POLL_INTERVAL_MS = parsePollIntervalMs(process.env.TICKER_POLL_MINUTES);

export async function pollOnce(): Promise<number> {
  const quotes = await fetchLiveQuotes();
  for (const q of quotes) {
    await prisma.quote.upsert({
      where: { symbol: q.symbol },
      update: {
        price: formatTickerPrice(q.price),
        change: formatTickerChange(q.changePct),
        up: q.changePct >= 0,
        isSample: false,
      },
      create: {
        symbol: q.symbol,
        price: formatTickerPrice(q.price),
        change: formatTickerChange(q.changePct),
        up: q.changePct >= 0,
        isSample: false,
      },
    });
  }
  return quotes.length;
}

let started = false;

export function startTickerPoller() {
  if (started) return;
  started = true;

  const run = async () => {
    try {
      const n = await pollOnce();
      console.log(`[ticker] polled ${n} live quotes`);
    } catch (e) {
      console.error('[ticker] poll failed:', e);
    }
  };

  void run();
  const timer = setInterval(run, POLL_INTERVAL_MS);
  // Don't keep the process alive just for the poller.
  timer.unref?.();
}
