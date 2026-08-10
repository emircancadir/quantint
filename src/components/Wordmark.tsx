export default function Wordmark({
  size = 22,
  color,
  accent = '#3168B4',
}: {
  size?: number;
  color?: string;
  accent?: string;
}) {
  return (
    <span
      style={{
        fontSize: `${size}px`,
        fontWeight: 600,
        letterSpacing: '-0.02em',
        color,
      }}
    >
      quantint<span style={{ color: accent }}>.</span>
    </span>
  );
}
