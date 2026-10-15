import type { FormKey, Locale } from "@ola/shared";

interface TurnstileOptions {
  sitekey: string;
  action: FormKey;
  language: Locale;
  size: "compact";
  execution: "execute";
  appearance: "interaction-only";
  "response-field": false;
  callback: (token: string) => void;
  "error-callback": () => void;
  "expired-callback": () => void;
  "timeout-callback": () => void;
}

interface TurnstileApi {
  render: (container: HTMLElement, options: TurnstileOptions) => string;
  execute: (widget: string) => void;
  reset: (widget: string) => void;
  remove: (widget: string) => void;
}

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

let scriptPromise: Promise<TurnstileApi> | undefined;

function loadTurnstile(): Promise<TurnstileApi> {
  if (window.turnstile) return Promise.resolve(window.turnstile);
  if (scriptPromise) return scriptPromise;
  const script = document.createElement("script");
  script.src =
    "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
  script.async = true;
  scriptPromise = new Promise<TurnstileApi>((resolve, reject) => {
    const timer = window.setTimeout(fail, 15000);
    function fail() {
      window.clearTimeout(timer);
      script.remove();
      reject(new Error("Turnstile unavailable"));
    }
    script.onerror = fail;
    script.onload = () => {
      window.clearTimeout(timer);
      if (window.turnstile) resolve(window.turnstile);
      else fail();
    };
    document.head.append(script);
  }).catch((error: unknown) => {
    scriptPromise = undefined;
    throw error;
  });
  return scriptPromise;
}

type Attempt = {
  cancel: () => void;
  cleanup?: () => void;
};
type ProtectionState =
  | { kind: "idle" }
  | { kind: "acquiring"; attempt: Attempt }
  | { kind: "sending"; attempt: Attempt }
  | { kind: "cancelled"; attempt: Attempt };

export function createLeadProtection(
  container: HTMLElement,
  options: { siteKey: string; action: FormKey; language: Locale },
) {
  let state: ProtectionState = { kind: "idle" };
  container.closest("dialog")?.addEventListener("close", () => {
    if (state.kind === "acquiring") state.attempt.cancel();
  });

  return {
    async submit<T>(send: (token: string) => Promise<T>): Promise<T> {
      if (state.kind !== "idle") throw new Error("Submission in progress");
      if (!options.siteKey) throw new Error("Turnstile site key missing");
      const verification = Promise.withResolvers<string>();
      const attempt: Attempt = {
        cancel: () => {
          if (state.kind === "acquiring" && state.attempt === attempt) {
            state = { kind: "cancelled", attempt };
            verification.reject(new Error("Turnstile verification cancelled"));
          }
        },
      };
      state = { kind: "acquiring", attempt };
      const timer = window.setTimeout(attempt.cancel, 120000);
      void loadTurnstile().then((api) => {
        if (state.kind !== "acquiring" || state.attempt !== attempt) return;
        try {
          const widget = api.render(container, {
            sitekey: options.siteKey,
            action: options.action,
            language: options.language,
            size: "compact",
            execution: "execute",
            appearance: "interaction-only",
            "response-field": false,
            callback: (token) => {
              if (state.kind !== "acquiring" || state.attempt !== attempt)
                return;
              if (!token || token.length > 2048) {
                attempt.cancel();
                return;
              }
              state = { kind: "sending", attempt };
              verification.resolve(token);
            },
            "error-callback": attempt.cancel,
            "expired-callback": attempt.cancel,
            "timeout-callback": attempt.cancel,
          });
          attempt.cleanup = () => {
            for (const release of [
              () => api.reset(widget),
              () => api.remove(widget),
            ]) {
              try {
                release();
              } catch {
                continue;
              }
            }
          };
          api.execute(widget);
        } catch {
          attempt.cancel();
        }
      }, attempt.cancel);
      try {
        return await send(await verification.promise);
      } finally {
        window.clearTimeout(timer);
        try {
          attempt.cleanup?.();
        } finally {
          state = { kind: "idle" };
        }
      }
    },
  };
}
