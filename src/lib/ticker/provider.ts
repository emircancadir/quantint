import 'server-only';

/**
 * Market-data providers for the ticker. Free/delayed sources only, per the
 * project decision.
 *
 * Two layers:
 *  - Keyless baseline (always available): Frankfurter (ECB reference FX —
 *    USD/TRY, EUR/USD) and CoinGecko (BTC/USD with 24h change). Real numbers,
 *    daily/delayed granularity, no account needed.
 *  - Twelve Data (optional, MARKET_PROVIDER=twelvedata + MARKET_API_KEY):
 *    batch /quote call adds XAU/USD and whatever indices the free tier allows.
 *    Symbols the plan rejects are skipped silently — the ticker only ever
 *    shows what a provider actually returned.
 *
 * Symbols nobody returns stay out of the ticker; if nothing at all is
 * available the UI falls back to the labelled sample set.
 */

export type LiveQuote = {
  symbol: string; // display symbol, e.g. 'USD/TRY'
  price: number;
  changePct: number;
};

const FETCH_OPTS: RequestInit = {
  headers: { 'User-Agent': 'quantint-ticker/1.0' },
  signal: AbortSignal.timeout(10_000),
};

/** Frankfurter: latest vs previous ECB reference rates for USD/TRY, EUR/USD. */
async function fetchFrankfurter(): Promise<LiveQuote[]> {
  const out: LiveQuote[] = [];
  try {
    // Latest rates with USD base (TRY per USD); EUR/USD comes via inverse.
    const latest = await fetch(
      'https://api.frankfurter.app/latest?from=USD&to=TRY,EUR',
      FETCH_OPTS,
    ).then((r) => (r.ok ? r.json() : null));
    if (!latest?.rates) return out;

    // Previous banking day (path-style historical endpoint) for the change %.
    const prev = await fetch(
      `https://api.frankfurter.app/${previousBankingDay(latest.date)}?from=USD&to=TRY,EUR`,
      FETCH_OPTS,
    )
      .then((r) => (r.ok ? r.json() : null))
      .catch(() => null);

    const pct = (now: number, before?: number) =>
      before && before > 0 ? ((now - before) / before) * 100 : 0;

    if (latest.rates.TRY) {
      out.push({
        symbol: 'USD/TRY',
        price: latest.rates.TRY,
        changePct: pct(latest.rates.TRY, prev?.rates?.TRY),
      });
    }
    if (latest.rates.EUR) {
      // EUR/USD = 1 / (EUR per USD)
      const now = 1 / latest.rates.EUR;
      const before = prev?.rates?.EUR ? 1 / prev.rates.EUR : undefined;
      out.push({ symbol: 'EUR/USD', price: now, changePct: pct(now, before) });
    }
  } catch (e) {
    console.warn('[ticker] frankfurter failed:', e);
  }
  return out;
}

function previousBankingDay(isoDate: string): string {
  const d = new Date(isoDate + 'T12:00:00Z');
  do {
    d.setUTCDate(d.getUTCDate() - 1);
  } while (d.getUTCDay() === 0 || d.getUTCDay() === 6);
  return d.toISOString().slice(0, 10);
}

/** CoinGecko: BTC spot + 24h change, keyless. */
async function fetchCoinGecko(): Promise<LiveQuote[]> {
  try {
    const res = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true',
      FETCH_OPTS,
    );
    if (!res.ok) return [];
    const json = await res.json();
    const btc = json?.bitcoin;
    if (typeof btc?.usd !== 'number') return [];
    return [
      {
        symbol: 'BTC/USD',
        price: btc.usd,
        changePct: typeof btc.usd_24h_change === 'number' ? btc.usd_24h_change : 0,
      },
    ];
  } catch (e) {
    console.warn('[ticker] coingecko failed:', e);
    return [];
  }
}

/** Twelve Data batch quote — display symbol → provider symbol. */
const TWELVE_DATA_SYMBOLS: Record<string, string> = {
  'XAU/USD': 'XAU/USD',
  'S&P 500': 'SPX',
  NASDAQ: 'IXIC',
  VIX: 'VIX',
};

async function fetchTwelveData(apiKey: string): Promise<LiveQuote[]> {
  const out: LiveQuote[] = [];
  try {
    const providerSymbols = Object.values(TWELVE_DATA_SYMBOLS).join(',');
    const res = await fetch(
      `https://api.twelvedata.com/quote?symbol=${encodeURIComponent(providerSymbols)}&apikey=${apiKey}`,
      FETCH_OPTS,
    );
    if (!res.ok) return out;
    const json = await res.json();

    for (const [display, provider] of Object.entries(TWELVE_DATA_SYMBOLS)) {
      // Batch responses key by symbol; single-symbol responses are flat.
      const q = json[provider] ?? (json.symbol === provider ? json : null);
      const price = Number(q?.close);
      const changePct = Number(q?.percent_change);
      if (q && !q.code && Number.isFinite(price)) {
        out.push({
          symbol: display,
          price,
          changePct: Number.isFinite(changePct) ? changePct : 0,
        });
      }
    }
  } catch (e) {
    console.warn('[ticker] twelvedata failed:', e);
  }
  return out;
}

/** Fetch everything the configured providers can deliver. */
export async function fetchLiveQuotes(): Promise<LiveQuote[]> {
  const tasks: Promise<LiveQuote[]>[] = [fetchFrankfurter(), fetchCoinGecko()];

  const provider = process.env.MARKET_PROVIDER?.toLowerCase();
  const apiKey = process.env.MARKET_API_KEY;
  if (provider === 'twelvedata' && apiKey) {
    tasks.push(fetchTwelveData(apiKey));
  }

  const results = await Promise.all(tasks);
  return results.flat();
}
