const DEFAULT_MINUTES = 5;
const MIN_MINUTES = 1;
const MAX_MINUTES = 60;

/** Parse an operator-supplied interval and keep it within a safe range. */
export function parsePollIntervalMs(value?: string): number {
  if (!value?.trim()) return DEFAULT_MINUTES * 60_000;
  const parsed = Number(value);
  const minutes = Number.isFinite(parsed)
    ? Math.min(MAX_MINUTES, Math.max(MIN_MINUTES, parsed))
    : DEFAULT_MINUTES;
  return minutes * 60_000;
}
