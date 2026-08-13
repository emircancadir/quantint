const LOCAL_SITE_URL = 'http://localhost:3000';

/** Validate and normalize an origin used in canonical, RSS and sitemap URLs. */
export function normalizeSiteUrl(value?: string): string {
  const candidate = value?.trim() || LOCAL_SITE_URL;

  try {
    const url = new URL(candidate);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return LOCAL_SITE_URL;
    return url.origin;
  } catch {
    return LOCAL_SITE_URL;
  }
}

