import { IBM_Plex_Sans, IBM_Plex_Mono } from 'next/font/google';

// next/font downloads at build time and self-hosts — no Google CDN request at
// runtime. Shared by both root layouts (site + admin).
export const plexSans = IBM_Plex_Sans({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-plex-sans',
  display: 'swap',
});

export const plexMono = IBM_Plex_Mono({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '500'],
  variable: '--font-plex-mono',
  display: 'swap',
});
