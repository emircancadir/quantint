'use client';

import { useEffect, useMemo, useState } from 'react';
import type { Quote } from '@/lib/ticker/sample';
import { DOWN_COLOR, UP_COLOR } from '@/lib/ticker/sample';
import { formatTickerChange, formatTickerPrice } from '@/lib/ticker/format';

const BINANCE_SYMBOLS: Record<string, string> = {
  BTCUSDT: 'BTC/USD',
  ETHUSDT: 'ETH/USD',
  SOLUSDT: 'SOL/USD',
  XRPUSDT: 'XRP/USD',
  BNBUSDT: 'BNB/USD',
};
const STREAMS = Object.keys(BINANCE_SYMBOLS)
  .map((symbol) => `${symbol.toLowerCase()}@miniTicker`)
  .join('/');
const STREAM_URL = `wss://stream.binance.com:443/stream?streams=${STREAMS}`;
const ORDER = [
  'BIST 100', 'USD/TRY', 'S&P 500', 'NASDAQ',
  'BTC/USD', 'ETH/USD', 'SOL/USD', 'XRP/USD', 'BNB/USD',
  'US10Y', 'BRENT', 'EUR/USD', 'XAU/USD', 'VIX',
];

type StreamStatus = 'connecting' | 'live' | 'delayed';

export default function LiveTicker({
  initialQuotes,
  sample,
  labels,
}: {
  initialQuotes: Quote[];
  sample: boolean;
  labels: { sample: string; live: string; connecting: string; delayed: string };
}) {
  const [quotes, setQuotes] = useState(initialQuotes);
  const [status, setStatus] = useState<StreamStatus>('connecting');

  useEffect(() => {
    let socket: WebSocket | null = null;
    let retryTimer: ReturnType<typeof setTimeout> | null = null;
    let stopped = false;
    let retry = 0;

    const connect = () => {
      if (stopped) return;
      setStatus('connecting');
      socket = new WebSocket(STREAM_URL);
      socket.addEventListener('open', () => {
        retry = 0;
        setStatus('live');
      });
      socket.addEventListener('message', (event) => {
        try {
          const payload = JSON.parse(String(event.data));
          const tick = payload?.data;
          const symbol = BINANCE_SYMBOLS[tick?.s];
          const price = Number(tick?.c);
          const open = Number(tick?.o);
          if (!symbol || !Number.isFinite(price) || !Number.isFinite(open) || open <= 0) return;
          const changePct = ((price - open) / open) * 100;
          setQuotes((current) => {
            const next = current.filter((quote) => quote.symbol !== symbol);
            next.push({
              symbol,
              price: formatTickerPrice(price),
              change: formatTickerChange(changePct),
              up: changePct >= 0,
            });
            return next.sort((a, b) => ORDER.indexOf(a.symbol) - ORDER.indexOf(b.symbol));
          });
        } catch {
          // Ignore malformed provider frames; the last valid quote stays visible.
        }
      });
      socket.addEventListener('close', () => {
        if (stopped) return;
        setStatus('delayed');
        const delay = Math.min(30_000, 1_000 * 2 ** retry++);
        retryTimer = setTimeout(connect, delay);
      });
      socket.addEventListener('error', () => socket?.close());
    };

    connect();
    return () => {
      stopped = true;
      if (retryTimer) clearTimeout(retryTimer);
      socket?.close();
    };
  }, []);

  const note = sample
    ? labels.sample
    : status === 'live'
      ? labels.live
      : status === 'connecting'
        ? labels.connecting
        : labels.delayed;
  const entries = useMemo(
    () => [
      ...quotes.map((quote) => ({
        ...quote,
        color: quote.up ? UP_COLOR : DOWN_COLOR,
      })),
      { symbol: '', price: '', change: note, up: true, color: status === 'live' ? UP_COLOR : '#55627A' },
    ],
    [note, quotes, status],
  );
  const loop = [...entries, ...entries];

  return (
    <div className="q-ticker" aria-label={note}>
      <div className="q-ticker-track">
        {loop.map((ticker, index) => (
          <span className="q-ticker-entry" key={`${ticker.symbol}-${index}`}>
            {ticker.symbol && <span className="q-ticker-symbol">{ticker.symbol}</span>}
            {ticker.price && <span className="q-ticker-price">{ticker.price}</span>}
            <span style={{ color: ticker.color }}>
              {!ticker.symbol && status === 'live' && <i className="q-live-dot" />}
              {ticker.change}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
