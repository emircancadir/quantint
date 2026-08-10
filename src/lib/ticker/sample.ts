export type Quote = {
  symbol: string;
  price: string;
  change: string;
  up: boolean;
};

/**
 * Fallback quotes, carried over verbatim from the design export.
 *
 * These are shown whenever live data is unavailable (no market-data API key
 * configured, or an upstream failure) — in that case the ticker is labelled
 * "örnek veri" / "sample data" rather than "15 dk gecikmeli", so the numbers
 * are never passed off as real. Phase 5 replaces them with polled quotes.
 */
export const SAMPLE_QUOTES: Quote[] = [
  { symbol: 'BIST 100', price: '11.482,3', change: '+1,24%', up: true },
  { symbol: 'USD/TRY', price: '41,08', change: '+0,12%', up: true },
  { symbol: 'S&P 500', price: '6.214,5', change: '−0,32%', up: false },
  { symbol: 'NASDAQ', price: '20.881,1', change: '+0,48%', up: true },
  { symbol: 'BTC/USD', price: '118.450', change: '+2,10%', up: true },
  { symbol: 'US10Y', price: '4,21%', change: '−3 bps', up: false },
  { symbol: 'BRENT', price: '82,4', change: '−0,85%', up: false },
  { symbol: 'EUR/USD', price: '1,092', change: '+0,05%', up: true },
  { symbol: 'XAU/USD', price: '2.845', change: '+0,67%', up: true },
  { symbol: 'VIX', price: '14,2', change: '−4,1%', up: false },
];

export const UP_COLOR = '#7FC8A9';
export const DOWN_COLOR = '#E08A8A';
