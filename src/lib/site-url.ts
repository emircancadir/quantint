import 'server-only';

import { normalizeSiteUrl } from './site-url-core';

/** Read at request time so standalone images are not tied to their build URL. */
export function getSiteUrl(): string {
  const runtimeEnv = process.env;
  return normalizeSiteUrl(runtimeEnv.SITE_URL ?? runtimeEnv.NEXT_PUBLIC_SITE_URL);
}

