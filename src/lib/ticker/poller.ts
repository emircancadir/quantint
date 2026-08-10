import 'server-only';

import { prisma } from '@/lib/db';
import { fetchLiveQuotes } from './provider';

/**
 * Background poller: fetches live quotes and upserts them into the Quote
 * table. Started once per server process from instrumentation.ts. Upserts are
 * idempotent, so an accidental second runner is harmless.
 */

const POLL_INTERVAL_MS = Number(process.env.TICKER_POLL_MINUTES ?? 5) * 60_000;

/** Turkish number formatting, matching the design ('41,08', '118.450'). */
function formatPrice(symbol: string, price: number): string {
  const digits = price >= 1000 ? 0 : price >= 100 ? 1 : price >= 10 ? 2 : 3;
  return new Intl.NumberFormat('tr-TR', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(price);
}

function formatChange(changePct: number): string {
  const abs = new Intl.NumberFormat('tr-TR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.abs(changePct));
  // The design uses the true minus sign (−), not a hyphen.
  return `${changePct < 0 ? '−' : '+'}${abs}%`;
}

export async function pollOnce(): Promise<number> {
  const quotes = await fetchLiveQuotes();
  for (const q of quotes) {
    await prisma.quote.upsert({
      where: { symbol: q.symbol },
      update: {
        price: formatPrice(q.symbol, q.price),
        change: formatChange(q.changePct),
        up: q.changePct >= 0,
        isSample: false,
      },
      create: {
        symbol: q.symbol,
        price: formatPrice(q.symbol, q.price),
        change: formatChange(q.changePct),
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
