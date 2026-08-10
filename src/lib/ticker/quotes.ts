import 'server-only';

import { prisma } from '@/lib/db';
import { SAMPLE_QUOTES, type Quote } from './sample';

/** Live rows older than this are considered stale and ignored. */
const MAX_AGE_MS = 60 * 60 * 1000;

/** Display order for live symbols (matches the design's ticker order). */
const SYMBOL_ORDER = [
  'BIST 100',
  'USD/TRY',
  'S&P 500',
  'NASDAQ',
  'BTC/USD',
  'US10Y',
  'BRENT',
  'EUR/USD',
  'XAU/USD',
  'VIX',
];

/**
 * Ticker read model. Prefers fresh live rows written by the poller; only the
 * symbols a provider actually returned are shown, so no fake number ever rides
 * under a "delayed" label. With no live data at all (no network, first boot),
 * the full sample set is served and the UI labels it "örnek veri".
 */
export async function getQuotes(): Promise<{ quotes: Quote[]; sample: boolean }> {
  try {
    const live = await prisma.quote.findMany({
      where: {
        isSample: false,
        updatedAt: { gte: new Date(Date.now() - MAX_AGE_MS) },
      },
    });

    if (live.length > 0) {
      const ordered = [...live].sort(
        (a, b) => SYMBOL_ORDER.indexOf(a.symbol) - SYMBOL_ORDER.indexOf(b.symbol),
      );
      return {
        quotes: ordered.map((q) => ({
          symbol: q.symbol,
          price: q.price,
          change: q.change,
          up: q.up,
        })),
        sample: false,
      };
    }
  } catch (e) {
    console.warn('[ticker] quote read failed, serving sample data:', e);
  }

  return { quotes: SAMPLE_QUOTES, sample: true };
}
