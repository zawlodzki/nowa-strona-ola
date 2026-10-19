// Unit tests run on fixtures. The Publish content workflow exports deployment
// variables for the build; without this cleanup Vitest would query live Sanity
// (network-bound, flaky timeouts) and see the production lead webhook.
export const DEPLOYMENT_ENV_KEYS = [
  "SITE_INDEXING",
  "DEPLOYMENT_TARGET",
  "PUBLIC_SANITY_PROJECT_ID",
  "PUBLIC_SANITY_DATASET",
  "PUBLIC_LEAD_WEBHOOK_URL",
  "PUBLIC_GTM_ENABLED",
  "PUBLIC_TURNSTILE_SITEKEY",
  "PUBLICATION_ALERT_WEBHOOK_URL",
] as const;

for (const key of DEPLOYMENT_ENV_KEYS) delete process.env[key];
