import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { parseEnv } from "node:util";

import { createPreviewSession } from "../preview/src/lib/session";

const base = new URL(process.argv[2] ?? "http://127.0.0.1:4432");
assert(
  ["127.0.0.1", "localhost"].includes(base.hostname),
  "Kontrola jest przeznaczona wyłącznie dla lokalnego SSR preview.",
);
const environment = parseEnv(await readFile("preview/.dev.vars", "utf8"));
assert(
  environment.PREVIEW_SESSION_SECRET,
  "Brak lokalnego sekretu sesji preview.",
);
const cookie = `ola-preview-session=${await createPreviewSession(environment.PREVIEW_SESSION_SECRET)}`;
const unauthorized = await fetch(base, { signal: AbortSignal.timeout(20_000) });
assert.equal(
  unauthorized.status,
  401,
  "Podgląd bez sesji musi odrzucać dostęp.",
);
const invalidSecret = await fetch(new URL("/api/draft-mode/enable", base), {
  signal: AbortSignal.timeout(20_000),
});
assert.equal(
  invalidSecret.status,
  401,
  "Aktywacja bez sekretu musi być odrzucona.",
);

const results = [];
for (const pathname of [
  "/",
  "/o-mnie/",
  "/blog/",
  "/ebooki/",
  "/konsultacje/",
  "/kontakt/",
  "/ebooki/badania-ktore-maja-sens/",
]) {
  const response = await fetch(new URL(pathname, base), {
    headers: { Cookie: cookie },
    signal: AbortSignal.timeout(20_000),
  });
  const html = await response.text();
  assert.equal(response.status, 200, `${pathname}: niepoprawny status SSR.`);
  assert.match(html, /<h1\b/, `${pathname}: brak wyrenderowanej treści.`);
  assert.match(
    html,
    /<script[^>]+src="\/_astro\//,
    `${pathname}: brak klienta preview.`,
  );
  assert.equal(
    response.headers.get("cache-control"),
    "private, no-store, max-age=0",
  );
  assert.equal(
    response.headers.get("x-robots-tag"),
    "noindex, nofollow, noarchive",
  );
  assert.equal(
    response.headers.get("content-security-policy"),
    "frame-ancestors 'self' https://studio.aleksandraolesiewicz.com https://www.sanity.io",
  );
  results.push({
    pathname,
    status: response.status,
    htmlBytes: Buffer.byteLength(html),
  });
}
console.log(
  JSON.stringify(
    { unauthorized: 401, invalidSecret: 401, pages: results },
    null,
    2,
  ),
);
