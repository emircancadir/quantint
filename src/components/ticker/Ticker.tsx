import { getTranslations } from 'next-intl/server';
import { getQuotes } from '@/lib/ticker/quotes';
import { UP_COLOR, DOWN_COLOR } from '@/lib/ticker/sample';

/**
 * Scrolling market strip. The marquee itself is pure CSS (`qi-marquee`), so
 * this stays a server component; only the numbers come from the data layer.
 *
 * The list is rendered twice back-to-back — the keyframe translates by -50%, so
 * the second copy is exactly what scrolls into view as the first leaves, which
 * is what makes the loop seamless.
 */
export default async function Ticker() {
  const t = await getTranslations('common');
  const { quotes, sample } = await getQuotes();

  const note = {
    symbol: '',
    price: '',
    change: sample ? t('tickerSample') : t('tickerNote'),
    color: '#55627A',
  };

  const entries = [
    ...quotes.map((q) => ({
      symbol: q.symbol,
      price: q.price,
      change: q.change,
      color: q.up ? UP_COLOR : DOWN_COLOR,
    })),
    note,
  ];
  const loop = [...entries, ...entries];

  return (
    <div
      style={{
        background: '#101820',
        overflow: 'hidden',
        height: '38px',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <div
        style={{
          display: 'flex',
          gap: 0,
          width: 'max-content',
          animation: 'qi-marquee 42s linear infinite',
        }}
      >
        {loop.map((tk, i) => (
          <span
            key={i}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '0 26px',
              fontFamily: 'var(--font-plex-mono), monospace',
              fontSize: '12.5px',
              color: '#C7CFDA',
              whiteSpace: 'nowrap',
            }}
          >
            <span style={{ color: '#8A94A3' }}>{tk.symbol}</span>
            <span style={{ color: '#EDF0F4' }}>{tk.price}</span>
            <span style={{ color: tk.color }}>{tk.change}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
