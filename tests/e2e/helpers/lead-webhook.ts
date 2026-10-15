import { test as base, expect, type Page } from "@playwright/test";

const LEAD_WEBHOOK = /^https:\/\/flows\.zawlodzki\.com\//;

const corsHeaders = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "POST",
  "access-control-allow-headers": "content-type",
};

type TurnstileMode =
  | "success"
  | "pending"
  | "error"
  | "expired"
  | "empty"
  | "script-error"
  | "cleanup-error";

declare global {
  interface Window {
    __turnstileMock: {
      rendered: number;
      executed: number;
      removed: number;
      options: {
        action: string;
        execution: string;
        appearance: string;
        size: string;
        "response-field": boolean;
      }[];
      fire: (
        id: number,
        event: "success" | "error" | "expired",
        token?: string,
      ) => void;
    };
  }
}

function turnstileScript(mode: TurnstileMode): string {
  return `
    (() => {
      const widgets = [];
      const nodes = [];
      const mock = window.__turnstileMock = {
        rendered: 0, executed: 0, removed: 0, options: [],
        fire(id, event, token = 'test-token-late-' + id) {
          const options = widgets[id];
          if (event === 'success') options.callback(token);
          if (event === 'error') options['error-callback']();
          if (event === 'expired') options['expired-callback']();
        },
      };
      window.turnstile = {
        render(container, options) {
          const id = widgets.length;
          widgets.push(options);
          mock.options.push(options);
          const challenge = document.createElement('label');
          challenge.style.cssText = 'display:block;inline-size:150px;block-size:140px';
          const checkbox = document.createElement('input');
          checkbox.type = 'checkbox';
          checkbox.addEventListener('change', () => mock.fire(id, 'success', 'test-token-interaction-' + id));
          challenge.append(checkbox, 'Testowe sprawdzenie zabezpieczenia');
          container.append(challenge);
          nodes.push(challenge);
          mock.rendered++;
          return String(id);
        },
        execute(id) {
          mock.executed++;
          const mode = ${JSON.stringify(mode)};
          if (mode === 'pending') return;
          setTimeout(() => {
            if (mode === 'success' || mode === 'cleanup-error') mock.fire(Number(id), 'success', 'test-token-' + mock.executed);
            if (mode === 'empty') mock.fire(Number(id), 'success', '');
            if (mode === 'error') mock.fire(Number(id), 'error');
            if (mode === 'expired') mock.fire(Number(id), 'expired');
          }, 0);
        },
        reset() { if (${JSON.stringify(mode)} === 'cleanup-error') throw new Error('Reset failed'); },
        remove(id) {
          nodes[Number(id)].remove();
          mock.removed++;
          if (${JSON.stringify(mode)} === 'cleanup-error') throw new Error('Remove failed');
        },
      };
    })();
  `;
}

export interface CapturedLead {
  contentType: string | undefined;
  body: unknown;
}

/**
 * Every test using this fixture aborts real calls to the n8n webhook and
 * fails if one was attempted. `mock` answers them with a chosen status.
 */
export const test = base.extend<{
  turnstile: { mode: (mode: TurnstileMode) => void };
  leadWebhook: {
    mock: (
      page: Page,
      statuses: number[],
      options?: { delayMs?: number },
    ) => Promise<CapturedLead[]>;
  };
}>({
  turnstile: [
    async ({ context }, use) => {
      let mode: TurnstileMode = "success";
      await context.route(
        /^https:\/\/challenges\.cloudflare\.com\//,
        (route) => {
          if (mode === "script-error") return route.abort();
          if (!route.request().url().includes("/turnstile/v0/api.js"))
            return route.abort();
          return route.fulfill({
            contentType: "application/javascript",
            body: turnstileScript(mode),
          });
        },
      );
      await use({
        mode: (next) => {
          mode = next;
        },
      });
    },
    { auto: true },
  ],
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
