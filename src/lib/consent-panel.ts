import { applyPreferences } from "./analytics";
import {
  createConsentController,
  type ConsentPreferences,
  type ConsentView,
} from "./consent";

export function initializeConsentPanel(): void {
  const panel = document.querySelector<HTMLElement>("[data-consent-panel]");
  const configuredEndpoint = panel?.dataset.endpoint;
  const endpoint = ["127.0.0.1", "localhost", "[::1]"].includes(
    window.location.hostname,
  )
    ? `${window.location.origin}/api/c15t`
    : configuredEndpoint;
  if (!panel || !endpoint) return;
  const banner = panel.querySelector<HTMLElement>("[data-consent-banner]");
  const dialog = panel.querySelector<HTMLDialogElement>("dialog");
  const measurement = panel.querySelector<HTMLInputElement>(
    "[data-consent-measurement]",
  );
  const marketing = panel.querySelector<HTMLInputElement>(
    "[data-consent-marketing]",
  );
  const announcement = panel.querySelector<HTMLElement>(
    "[data-consent-announcement]",
  );
  if (!banner || !dialog || !measurement || !marketing || !announcement) return;

  const consent = createConsentController({
    endpoint,
    origin: window.location.origin,
  });
  const openers = document.querySelectorAll<HTMLButtonElement>(
    "[data-consent-open]",
  );
  const buttons = panel.querySelectorAll<HTMLButtonElement>(
    "[data-consent-action]",
  );
  let dismissed = false;
  let view: ConsentView;
  let trigger: HTMLButtonElement | null = null;

  const render = (next: ConsentView): void => {
    view = next;
    applyPreferences(next.preferences);
    const busy = next.phase === "loading" || next.phase === "saving";
    banner.hidden =
      dismissed || next.phase === "loading" || next.phase === "settled";
    panel.setAttribute("aria-busy", String(busy));
    for (const opener of openers) opener.disabled = next.phase === "loading";
    for (const button of buttons) {
      const action = button.dataset.consentAction;
      button.disabled =
        action !== "customize" &&
        (next.phase === "loading" ||
          (next.phase === "saving" && action !== "necessary"));
      button.setAttribute(
        "aria-busy",
        String(next.phase === "saving" && action !== "customize"),
      );
    }
    for (const status of panel.querySelectorAll<HTMLElement>(
      "[data-consent-status]",
    )) {
      status.textContent = next.error
        ? panel.dataset.language === "pl"
          ? next.error
          : next.error.startsWith("Przeglądarka")
            ? (panel.dataset.storageError ?? "")
            : next.error.startsWith("Podstawy")
              ? (panel.dataset.policyError ?? "")
              : (panel.dataset.error ?? "")
        : next.phase === "saving"
          ? (panel.dataset.saving ?? "")
          : next.phase === "loading"
            ? (panel.dataset.loading ?? "")
            : "";
      status.dataset.error = String(Boolean(next.error));
    }
  };

  const openDialog = (opener: HTMLButtonElement): void => {
    trigger = opener;
    opener.focus();
    measurement.checked = view.preferences.measurement;
    marketing.checked = view.preferences.marketing;
    if (!dialog.open) dialog.showModal();
  };
  for (const opener of openers) {
    opener.hidden = false;
    opener.addEventListener("click", () => openDialog(opener));
  }
  panel
    .querySelector<HTMLButtonElement>("[data-consent-dismiss]")
    ?.addEventListener("click", () => {
      dismissed = true;
      banner.hidden = true;
    });
  panel
    .querySelector<HTMLButtonElement>("[data-consent-close]")
    ?.addEventListener("click", () => dialog.close());
  dialog.addEventListener("close", () => {
    if (trigger && !trigger.closest("[hidden]")) trigger.focus();
  });
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !dialog.open && !banner.hidden) {
      dismissed = true;
      banner.hidden = true;
    }
  });
  for (const button of buttons) {
    button.addEventListener("click", async () => {
      const action = button.dataset.consentAction;
      if (action === "customize") {
        openDialog(button);
        return;
      }
      if (action !== "all" && action !== "necessary" && action !== "save")
        return;
      const source = dialog.open ? "dialog" : "banner";
      const preferences: ConsentPreferences = {
        necessary: true,
        measurement:
          action === "all" || (action === "save" && measurement.checked),
        marketing: action === "all" || (action === "save" && marketing.checked),
      };
      const saved = await consent.choose(
        preferences,
        action === "save" ? "custom" : action,
        source,
      );
      if (!saved) return;
      if (dialog.open) {
        if (trigger?.closest("[hidden]")) trigger = openers.item(0);
        dialog.close();
      }
      announcement.textContent = panel.dataset.success ?? "";
    });
  }
  consent.subscribe(render);
  void consent.start();
}
