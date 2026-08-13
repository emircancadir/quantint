/** Shared market-number formatting for server snapshots and live browser ticks. */
export function formatTickerPrice(price: number): string {
  const digits =
    price >= 1000 ? 0 : price >= 100 ? 1 : price >= 10 ? 2 : price >= 1 ? 3 : 5;
  return new Intl.NumberFormat('tr-TR', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(price);
}

export function formatTickerChange(changePct: number): string {
  const abs = new Intl.NumberFormat('tr-TR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.abs(changePct));
  return `${changePct < 0 ? '−' : '+'}${abs}%`;
}
