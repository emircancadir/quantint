/** Only accept same-origin path redirects, never protocol-relative URLs. */
export function safeRedirectPath(value: unknown, fallback: string): string {
  return typeof value === 'string' &&
    value.startsWith('/') &&
    !value.startsWith('//') &&
    !value.includes('\\')
    ? value
    : fallback;
}
