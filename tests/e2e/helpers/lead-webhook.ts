import { test as base, expect, type Page } from "@playwright/test";

const LEAD_WEBHOOK = /^https:\/\/flows\.zawlodzki\.com\//;

const corsHeaders = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "POST",
  "access-control-allow-headers": "content-type",
};

export interface CapturedLead {
  contentType: string | undefined;
  body: unknown;
}

/**
 * Every test using this fixture aborts real calls to the n8n webhook and
 * fails if one was attempted. `mock` answers them with a chosen status.
 */
export const test = base.extend<{
  leadWebhook: {
    mock: (
      page: Page,
      statuses: number[],
      options?: { delayMs?: number },
    ) => Promise<CapturedLead[]>;
  };
}>({
  leadWebhook: [
    async ({ context }, use) => {
      const unexpected: string[] = [];
      await context.route(LEAD_WEBHOOK, (route) => {
        unexpected.push(`${route.request().method()} ${route.request().url()}`);
        return route.abort();
      });
      await use({
        async mock(page, statuses, options = {}) {
          const captured: CapturedLead[] = [];
          await page.route(LEAD_WEBHOOK, async (route) => {
            const request = route.request();
            if (request.method() === "OPTIONS") {
              return route.fulfill({ status: 204, headers: corsHeaders });
            }
            const status = statuses[captured.length];
            captured.push({
              contentType: request.headers()["content-type"],
              body: request.postDataJSON(),
            });
            if (status === undefined) {
              unexpected.push(`extra ${request.method()} ${request.url()}`);
              return route.abort();
            }
            if (options.delayMs) {
              await new Promise((resolve) =>
                setTimeout(resolve, options.delayMs),
              );
            }
            return route.fulfill({
              status,
              headers: corsHeaders,
              contentType: "application/json",
              body: "{}",
            });
          });
          return captured;
        },
      });
      expect(unexpected, "requests reached the real lead webhook").toEqual([]);
    },
    { auto: true },
  ],
});

export { expect };
