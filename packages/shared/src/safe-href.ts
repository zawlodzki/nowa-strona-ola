const MAILTO = /^mailto:[^\s@?]+@[^\s@?]+\.[^\s@?]+$/;

/**
 * Link destinations allowed in CMS content: an internal path, an in-page
 * anchor, http(s) or a single mailto address. A leading "//" or "/\" is a
 * protocol-relative URL to another host, so it is not an internal path.
 */
export function isSafeHref(value: string): boolean {
  return (
    /^\/(?![/\\])/.test(value) ||
    value.startsWith("#") ||
    value.startsWith("https://") ||
    value.startsWith("http://") ||
    MAILTO.test(value)
  );
}

/**
 * Render-time guard for hrefs that come from Sanity. Studio validation does
 * not bind API writes, so builds and preview stop on an unsafe value instead
 * of emitting it into an attribute.
 */
export function requireSafeHref(value: string, label: string): string {
  if (!isSafeHref(value)) {
    throw new Error(
      `Niedozwolony adres w polu ${label}: ${JSON.stringify(value)}. Użyj ścieżki /, kotwicy #, adresu http(s) albo mailto. Zatrzymuję build.`,
    );
  }
  return value;
}
