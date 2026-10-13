import assert from "node:assert/strict";
import { URLSearchParams } from "node:url";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import { chromium } from "@playwright/test";

const container = JSON.parse(
  readFileSync(
    new URL("../ops/gtm/ai-source-container.json", import.meta.url),
    "utf8",
  ),
).containerVersion;
const googleTag = container.tag.find((tag) => tag.tagId === "51");
const table = googleTag.parameter.find(
  (entry) => entry.key === "configSettingsTable",
).list;
const variableScript = (name) =>
  container.variable.find((variable) => variable.name === name).parameter[0]
    .value;
const origin = "https://aleksandraolesiewicz.com";
const marker = "PRIVATE_SDK_MARKER";
const browser = await chromium.launch();
try {
  for (const input of [
    "chatgpt",
    "perplexity",
    "claude",
    "gemini",
    "copilot",
    null,
  ]) {
    const source = runInNewContext(
      `(${variableScript("AO AI source").replace("{{AO AI source input}}", "input")})()`,
      { input },
    );
    const medium = runInNewContext(
      `(${variableScript("AO AI medium").replace("{{AO AI source}}", "source")})()`,
      { source },
    );
    const replacements = {
      "{{AO page code}}": "home",
      "{{AO AI source}}": source,
      "{{AO AI medium}}": medium,
    };
    const booleanSettings = new Set([
      "send_page_view",
      "allow_google_signals",
      "allow_ad_personalization_signals",
    ]);
    const config = Object.fromEntries(
      table.map((entry) => {
        const key = entry.map.find((part) => part.key === "parameter").value;
        const value =
          entry.map.find((part) => part.key === "parameterValue").value ?? "";
        if (booleanSettings.has(key)) {
          assert.ok(
            value === "true" || value === "false",
            "Google boolean config must use a boolean literal",
          );
          return [key, value === "true"];
        }
        return [
          key,
          Object.hasOwn(replacements, value)
            ? replacements[value]
            : value.replace("{{AO page code}}", "home"),
        ];
      }),
    );
    const context = await browser.newContext({ serviceWorkers: "block" });
    const collected = [];
    let sdkRequests = 0;
    await context.route("**/*", async (route) => {
      const request = route.request();
      const url = new URL(request.url());
      if (url.origin === origin && request.isNavigationRequest()) {
        await route.fulfill({
          contentType: "text/html",
          body: "<!doctype html><html><head><title>PRIVATE_SDK_MARKER</title></head><body>SDK acceptance</body></html>",
        });
      } else if (
        request.method() === "GET" &&
        url.origin === "https://www.googletagmanager.com" &&
        url.pathname === "/gtag/js"
      ) {
        sdkRequests++;
        await route.continue();
      } else {
        if (url.pathname.endsWith("/collect")) {
          collected.push({
            url: request.url(),
            body: request.postData() ?? "",
            referer: request.headers().referer ?? "",
          });
          await route.fulfill({ status: 204 });
        } else await route.abort("blockedbyclient");
      }
    });
    const page = await context.newPage();
    const params = new URLSearchParams(
      Object.fromEntries(
        [
          "utm_source",
          "utm_medium",
          "utm_campaign",
          "utm_term",
          "utm_content",
          "utm_id",
          "utm_source_platform",
        ].map((key) => [key, marker]),
      ),
    );
    await page.goto(`${origin}/${marker}?${params}`, {
      referer: `https://chatgpt.com/${marker}?secret=${marker}`,
    });
    assert.ok(
      await page.evaluate(() =>
        globalThis.document.referrer.includes("PRIVATE_SDK_MARKER"),
      ),
      "The SDK scenario must expose a private referrer, not only an origin",
    );
    await page.evaluate(async (configuration) => {
      globalThis.window.dataLayer = [];
      globalThis.window.gtag = function () {
        globalThis.window.dataLayer.push(arguments);
      };
      globalThis.window.gtag("consent", "default", {
        analytics_storage: "granted",
        ad_storage: "denied",
        ad_user_data: "denied",
        ad_personalization: "denied",
      });
      globalThis.window.gtag("set", "ads_data_redaction", true);
      globalThis.window.gtag("set", "url_passthrough", false);
      globalThis.window.gtag("js", new Date());
      globalThis.window.gtag("config", "G-9QW05JYZTL", configuration);
      await new Promise((resolve, reject) => {
        const script = globalThis.document.createElement("script");
        script.referrerPolicy = "no-referrer";
        script.src = "https://www.googletagmanager.com/gtag/js?id=G-9QW05JYZTL";
        script.onload = resolve;
        script.onerror = reject;
        globalThis.document.head.append(script);
      });
      globalThis.window.gtag("event", "page_view");
    }, config);
    await page.waitForFunction(
      () => globalThis.window.google_tag_manager !== undefined,
    );
    await page.waitForTimeout(1500);
    await page.evaluate(() =>
      globalThis.window.dispatchEvent(
        new globalThis.PageTransitionEvent("pagehide", { persisted: true }),
      ),
    );
    await page.waitForTimeout(1000);
    assert.ok(sdkRequests > 0, "Real Google SDK must load");
    assert.ok(
      collected.length > 0,
      "Google SDK must produce intercepted collect requests",
    );
    const events = [];
    for (const request of collected) {
      const raw = `${request.url}\n${request.body}\n${request.referer}`;
      assert.ok(
        !decodeURIComponent(raw).includes(marker),
        "Private URL and UTM markers must never enter collect or Referer",
      );
      assert.ok(
        !raw.includes("undefined"),
        "Missing source must not become literal undefined",
      );
      const query = new URL(request.url).searchParams;
      for (const line of request.body
        ? request.body.split("\n").filter(Boolean)
        : [""]) {
        const fields = new URLSearchParams(query);
        for (const [key, value] of new URLSearchParams(line))
          fields.set(key, value);
        if (!fields.get("en")) continue;
        events.push(fields.get("en"));
        assert.equal(fields.get("dl"), `${origin}/m/home`);
        assert.equal(fields.get("dt"), "home");
        assert.ok(!fields.get("dr"));
        assert.equal(fields.get("cs"), source ?? null);
        assert.equal(fields.get("cm"), source ? "referral" : null);
      }
    }
    assert.equal(
      events.filter((event) => event === "page_view").length,
      1,
      "Only the manual page view must be intercepted",
    );
    assert.ok(
      events.includes("user_engagement"),
      "Automatic engagement after pagehide must be intercepted",
    );
    console.log(
      JSON.stringify({ source, events, interceptedRequests: collected.length }),
    );
    await context.close();
  }
} finally {
  await browser.close();
}
