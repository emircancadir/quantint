import { getTranslations } from 'next-intl/server';
import { getQuotes } from '@/lib/ticker/quotes';
import LiveTicker from './LiveTicker';

/** Server snapshot with a client-side real-time crypto stream enhancement. */
export default async function Ticker() {
  const t = await getTranslations('common');
  const { quotes, sample } = await getQuotes();
  return (
    <LiveTicker
      initialQuotes={quotes}
      sample={sample}
      labels={{
        sample: t('tickerSample'),
        live: t('tickerLive'),
        connecting: t('tickerConnecting'),
        delayed: t('tickerDelayed'),
      }}
    />
  );
}
