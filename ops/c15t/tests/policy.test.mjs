import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  CONSENT_CATEGORIES,
  globalOptInPolicy,
} from "../dist/shared/policy.js";
import {
  parseRetentionMonths,
  retentionMonths,
} from "../dist/server/retention-config.js";

test("global policy is strict opt-in for 365 days", () => {
  assert.equal(globalOptInPolicy.match.isDefault, true);
  assert.equal(globalOptInPolicy.consent.model, "opt-in");
  assert.equal(globalOptInPolicy.consent.scopeMode, "strict");
  assert.equal(globalOptInPolicy.consent.expiryDays, 365);
  assert.deepEqual(globalOptInPolicy.consent.categories, [
    "necessary",
    "measurement",
    "marketing",
  ]);
  assert.deepEqual(globalOptInPolicy.consent.preselectedCategories, [
    "necessary",
  ]);
  assert.deepEqual(CONSENT_CATEGORIES, globalOptInPolicy.consent.categories);
});

test("policy records the required decision proof", () => {
  assert.deepEqual(globalOptInPolicy.proof, {
    storeIp: true,
    storeUserAgent: true,
    storeLanguage: true,
  });
});

test("bundle contains GTM consent integration and no Finsweet code", async () => {
  const bundle = await readFile(
    new URL("../dist/public/cmp-v1.js", import.meta.url),
    "utf8",
  );

  assert.match(bundle, /GTM-P5V3CJ5/);
  assert.match(bundle, /consent-update/);
  assert.match(bundle, /analytics_storage/);
  assert.match(bundle, /ad_personalization/);
  assert.doesNotMatch(bundle, /personalization_storage/);
  assert.doesNotMatch(bundle, /finsweet|fs-cc/i);
  assert.doesNotMatch(bundle, /process\.env\.NODE_ENV/);
});

test("application policy and GTM mapping do not configure experience", async () => {
  const policySource = await readFile(
    new URL("../src/shared/policy.ts", import.meta.url),
    "utf8",
  );
  const widgetSource = await readFile(
    new URL("../src/widget/index.tsx", import.meta.url),
    "utf8",
  );

  assert.doesNotMatch(policySource, /\bexperience\b/);
  assert.doesNotMatch(widgetSource, /\bexperience\b|personalization_storage/);
});

test("widget links to the standalone cookie and identifier inventory", async () => {
  const widgetSource = await readFile(
    new URL("../src/widget/index.tsx", import.meta.url),
    "utf8",
  );

  assert.match(widgetSource, /href:\s*'\/lista-cookies-i-identyfikatorow'/);
  assert.doesNotMatch(widgetSource, /#inwentarz-cookies/);
});

test("evidence retention defaults to 36 months and remains bounded", () => {
  assert.equal(retentionMonths, 36);
  assert.equal(parseRetentionMonths(undefined), 36);
  assert.equal(parseRetentionMonths("36"), 36);
  assert.equal(parseRetentionMonths("0"), 1);
  assert.equal(parseRetentionMonths("121"), 120);
  assert.equal(parseRetentionMonths("invalid"), 36);
});

test("backend masks the Cloudflare client IP before storing proof", async () => {
  const backendSource = await readFile(
    new URL("../src/server/c15t.ts", import.meta.url),
    "utf8",
  );

  assert.match(backendSource, /masking:\s*true/);
  assert.match(
    backendSource,
    /ipAddressHeaders:\s*\[["']cf-connecting-ip["']\]/,
  );
});

test("bundle lets hosted mode perform the single backend init request", async () => {
  const widgetSource = await readFile(
    new URL("../src/widget/index.tsx", import.meta.url),
    "utf8",
  );

  assert.match(widgetSource, /mode:\s*'hosted'/);
  assert.match(widgetSource, /backendURL:\s*BACKEND_URL/);
  assert.match(widgetSource, /scripts:\s*\[zawlodzkiGoogleTagManager\(\)\]/);
  assert.doesNotMatch(widgetSource, /fetch\(`\$\{BACKEND_URL\}\/init`/);
  assert.doesNotMatch(widgetSource, /isBackendReady/);
});

test("widget bridges c15t gtag updates to native GTM custom events", async () => {
  const widgetSource = await readFile(
    new URL("../src/widget/index.tsx", import.meta.url),
    "utf8",
  );

  assert.match(widgetSource, /Array\.from\(item as ArrayLike<unknown>\)/);
  assert.match(widgetSource, /command\?\.\[0\] === 'event'/);
  assert.match(widgetSource, /command\[1\] === 'consent-update'/);
  assert.match(widgetSource, /c15t_consent_update: true/);
  assert.match(widgetSource, /command\?\.\[0\] === 'consent'/);
  assert.match(widgetSource, /window\.__zawlodzkiConsentState/);
  assert.match(widgetSource, /c15t_measurement_consent/);
  assert.match(widgetSource, /c15t_marketing_consent/);
  assert.match(widgetSource, /c15t_policy_id/);
  assert.match(widgetSource, /c15t_schema_version/);
});

test("widget removes optional identifiers before a consent-revocation reload", async () => {
  const widgetSource = await readFile(
    new URL("../src/widget/index.tsx", import.meta.url),
    "utf8",
  );

  assert.match(widgetSource, /onBeforeConsentRevocationReload/);
  assert.match(widgetSource, /cleanupRevokedConsent\(preferences\)/);
  assert.match(widgetSource, /\^_ga/);
  assert.match(widgetSource, /\^_gcl/);
  assert.match(widgetSource, /\^nQ_/);
  assert.match(widgetSource, /\^_fbp/);
  assert.match(widgetSource, /'_gcl_ls'/);
  assert.match(widgetSource, /'lastExternalReferrer'/);
  assert.match(widgetSource, /fbq\('consent', 'revoke'\)/);
  assert.match(widgetSource, /Domain=\$\{domain\}/);
  assert.doesNotMatch(
    widgetSource,
    /deleteFirstPartyCookie\('zawlodzki-consent'\)/,
  );
});

test("analytics category names every measurement vendor", async () => {
  const policySource = await readFile(
    new URL("../src/shared/policy.ts", import.meta.url),
    "utf8",
  );

  assert.match(policySource, /Google Analytics 4/);
  assert.match(policySource, /Microsoft Clarity/);
  assert.match(policySource, /Leadfeeder/);
  assert.match(policySource, /Albacross/);
});

test("widget actions keep the requested responsive two-row layout", async () => {
  const widgetStyles = await readFile(
    new URL("../src/widget/widget.css", import.meta.url),
    "utf8",
  );

  assert.match(
    widgetStyles,
    /\[data-testid='consent-banner-customize-button'\]\s*\{[^}]*background-color:\s*#f8f9fc/s,
  );
  assert.match(
    widgetStyles,
    /\[data-testid='consent-banner-footer-sub-group'\][^{]*\{[^}]*grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)/s,
  );
  assert.match(
    widgetStyles,
    /\[data-testid='consent-widget-footer-save-button'\]\s*\{[^}]*grid-column:\s*1\s*\/\s*-1/s,
  );
  assert.match(
    widgetStyles,
    /consent-widget-footer-sub-group'][\s\S]*:has\([\s\S]*consent-widget-footer-save-button[\s\S]*\)\s*\{[^}]*order:\s*-1/s,
  );
  const baseButtonRule = widgetStyles.match(
    /button\[class\*='c15t-ui-button-'\]\s*\{([^}]*)\}/s,
  );
  assert.ok(baseButtonRule);
  assert.doesNotMatch(baseButtonRule[1], /^\s*width:\s*100%/m);
});
