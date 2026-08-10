import Image from 'next/image';

/**
 * Replaces the design's `<image-slot>` placeholders (About portrait, footer
 * avatar). When `src` is set we render a real optimized image; otherwise a
 * neutral monogram circle stands in — no broken-image state, and dropping a
 * real photo in later is a one-prop change.
 */
export default function Avatar({
  size,
  src,
  alt = '',
  dark = false,
}: {
  size: number;
  src?: string;
  alt?: string;
  dark?: boolean;
}) {
  if (src) {
    return (
      <Image
        src={src}
        alt={alt}
        width={size}
        height={size}
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          objectFit: 'cover',
          display: 'block',
        }}
      />
    );
  }

  return (
    <div
      aria-hidden="true"
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: dark ? '#1B2836' : '#EDF3FB',
        color: dark ? '#6E9FDD' : '#3168B4',
        border: `1px solid ${dark ? '#223041' : '#DCE7F6'}`,
        fontFamily: 'var(--font-plex-mono), monospace',
        fontSize: Math.max(10, Math.round(size * 0.34)),
        letterSpacing: '-0.02em',
        flex: 'none',
      }}
    >
      q
    </div>
  );
}
