/**
 * The quantint mark: nine dots arranged as a "Q".
 * Positions are copied verbatim from the design export — the splash animation
 * (components/splash/Splash.tsx) reuses the same nine coordinates and lands the
 * dots exactly on this SVG, so the two must stay in sync.
 */
export const LOGO_DOTS: Array<[number, number]> = [
  [30, 5],
  [47.7, 12.3],
  [55, 30],
  [30, 55],
  [12.3, 47.7],
  [5, 30],
  [12.3, 12.3],
];

export default function Logo({
  size = 34,
  ink = 'var(--q-ink)',
  accent = 'var(--q-blue)',
  id,
  style,
}: {
  size?: number;
  ink?: string;
  accent?: string;
  id?: string;
  style?: React.CSSProperties;
}) {
  return (
    <svg id={id} width={size} height={size} viewBox="0 0 64 64" style={style}>
      {LOGO_DOTS.map(([cx, cy]) => (
        <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="4.9" fill={ink} />
      ))}
      <circle cx="47.7" cy="47.7" r="4.9" fill={accent} />
      <circle
        cx="59.1"
        cy="59.1"
        r="4.9"
        fill={accent}
        style={{ animation: 'qi-pulse 2.6s ease-in-out infinite' }}
      />
    </svg>
  );
}
