/**
 * Keeps the post-activation redirect on the preview origin. The preview URL
 * secret library returns only a path, but a path such as "//evil.example/" is
 * protocol-relative and leaves the origin, so anything else falls back to "/".
 */
export function samePreviewOriginPath(
  redirectTo: string,
  requestUrl: string,
): string {
  if (!/^\/(?![/\\])/.test(redirectTo)) return "/";
  const origin = new URL(requestUrl).origin;
  const target = new URL(redirectTo, origin);
  if (target.origin !== origin) return "/";
  return `${target.pathname}${target.search}${target.hash}`;
}
