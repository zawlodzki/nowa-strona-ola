const TEST_SITEKEY = "1x00000000000000000000AA";
const DUMMY_SITEKEY = /^[123]x0{20}(AA|AB|BB|FF)$/;

export function resolveTurnstileSitekey(environment: {
  PUBLIC_TURNSTILE_SITEKEY?: string;
  PUBLIC_SANITY_PROJECT_ID?: string;
  DEPLOYMENT_TARGET?: string;
}): string {
  const fixture =
    !environment.PUBLIC_SANITY_PROJECT_ID && !environment.DEPLOYMENT_TARGET;
  const key = environment.PUBLIC_TURNSTILE_SITEKEY?.trim();
  if (!key && fixture) return TEST_SITEKEY;
  if (!key || (!fixture && DUMMY_SITEKEY.test(key))) {
    throw new Error("PUBLIC_TURNSTILE_SITEKEY wymaga klucza produkcyjnego.");
  }
  return key;
}
