import { expect, test } from "./helpers/lead-webhook";
import { dismissConsentBanner } from "./helpers/consent-banner";

for (const mode of ["script-error", "error", "expired", "empty"] as const) {
  test(`Turnstile ${mode} keeps fields and sends no lead`, async ({
    page,
    leadWebhook,
    turnstile,
  }) => {
    turnstile.mode(mode);
    const captured = await leadWebhook.mock(page, []);
    await page.goto("/#newsletter");
    await dismissConsentBanner(page);
    const form = page.locator("#newsletter form");
    await form
      .getByLabel("Twój adres e-mail", { exact: true })
      .fill("ola@example.com");
    await form.getByRole("button", { name: "Zapisuję się" }).click();
    await expect(form.getByRole("alert")).toContainText(
      "Nie udało się sprawdzić zabezpieczenia",
    );
    await expect(
      form.getByLabel("Twój adres e-mail", { exact: true }),
    ).toHaveValue("ola@example.com");
    await expect(
      form.getByRole("button", { name: "Zapisuję się" }),
    ).toBeEnabled();
    expect(captured).toEqual([]);
  });
}

test("missing site key sends no lead and does not load the script", async ({
  page,
  leadWebhook,
}) => {
  const captured = await leadWebhook.mock(page, []);
  await page.route("**/", async (route) => {
    const response = await route.fetch();
    await route.fulfill({
      response,
      body: (await response.text()).replace(
        /data-turnstile-sitekey="[^"]*"/g,
        'data-turnstile-sitekey=""',
      ),
    });
  });
  await page.goto("/");
  await dismissConsentBanner(page);
  const form = page.locator("#newsletter form");
  await form
    .getByLabel("Twój adres e-mail", { exact: true })
    .fill("ola@example.com");
  await form.getByRole("button", { name: "Zapisuję się" }).click();
  await expect(form.getByRole("alert")).toContainText(
    "Nie udało się sprawdzić zabezpieczenia",
  );
  expect(await page.evaluate(() => window.__turnstileMock)).toBeUndefined();
  expect(captured).toEqual([]);
});

test("waitlist cancellation ignores old callbacks and acquires a new token on reopening", async ({
  page,
  leadWebhook,
  turnstile,
}) => {
  turnstile.mode("pending");
  const captured = await leadWebhook.mock(page, [200]);
  await page.goto("/ebooki/suplementy-w-pcos/");
  await dismissConsentBanner(page);
  expect(await page.evaluate(() => window.__turnstileMock)).toBeUndefined();
  const open = page
    .locator(".ebook3a-offer")
    .getByRole("button", { name: "Zapisz się na listę oczekujących" });
  await open.click();
  const dialog = page.locator("#lista-oczekujacych");
  await expect(dialog).toHaveAccessibleName("Daj znać, że czekasz");
  await dialog
    .getByLabel("Twój adres e-mail", { exact: true })
    .fill("ola@example.com");
  const submit = dialog.locator('button[type="submit"]');
  await submit.click();
  await expect
    .poll(() => page.evaluate(() => window.__turnstileMock?.executed ?? 0))
    .toBe(1);
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(submit).toBeEnabled();
  await open.click();
  await submit.click();
  await expect
    .poll(() => page.evaluate(() => window.__turnstileMock?.executed ?? 0))
    .toBe(2);
  await page.evaluate(() =>
    window.__turnstileMock.fire(0, "success", "old-token"),
  );
  await expect(submit).toBeDisabled();
  expect(captured).toEqual([]);
  await page.evaluate(() =>
    window.__turnstileMock.fire(1, "success", "new-token"),
  );
  await expect(dialog.getByRole("status")).toHaveText(
    "Gotowe. Napiszemy, gdy e-book będzie dostępny.",
  );
  expect(captured[0]?.body).toMatchObject({ turnstileToken: "new-token" });
  expect(await page.evaluate(() => window.__turnstileMock.removed)).toBe(2);
});

test("independent forms use execute tokens and clean each widget", async ({
  page,
  leadWebhook,
}) => {
  const captured = await leadWebhook.mock(page, [200, 200]);
  await page.goto("/kontakt/");
  await dismissConsentBanner(page);
  const contact = page.locator("#contact-lead-form");
  await contact.getByLabel("E-mail", { exact: true }).fill("ola@example.com");
  await contact
    .getByLabel("Temat rozmowy", { exact: true })
    .fill("Pytanie o konsultację");
  await contact.getByRole("button", { name: "Wyślij wiadomość" }).click();
  await expect(contact.getByRole("status")).toHaveText(
    "Dziękujemy, wiadomość dotarła. Odpowiemy na podany adres e-mail.",
  );
  const form = page.locator("#newsletter form");
  await form
    .getByLabel("Twój adres e-mail", { exact: true })
    .fill("ola@example.com");
  await form.getByRole("button", { name: "Zapisuję się" }).click();
  await expect(form.getByRole("status")).toContainText("Sprawdź skrzynkę");
  expect(captured).toHaveLength(2);
  expect(
    await page.evaluate(() =>
      window.__turnstileMock.options.map(
        ({
          action,
          execution,
          appearance,
          size,
          "response-field": responseField,
        }) => ({ action, execution, appearance, size, responseField }),
      ),
    ),
  ).toEqual([
    {
      action: "contact",
      execution: "execute",
      appearance: "interaction-only",
      size: "compact",
      responseField: false,
    },
    {
      action: "newsletter",
      execution: "execute",
      appearance: "interaction-only",
      size: "compact",
      responseField: false,
    },
  ]);
  expect(await page.evaluate(() => window.__turnstileMock.removed)).toBe(2);
});

test("script loading failure can be retried without reloading the page", async ({
  page,
  leadWebhook,
  turnstile,
}) => {
  turnstile.mode("script-error");
  const captured = await leadWebhook.mock(page, [200]);
  await page.goto("/#newsletter");
  await dismissConsentBanner(page);
  const form = page.locator("#newsletter form");
  await form
    .getByLabel("Twój adres e-mail", { exact: true })
    .fill("ola@example.com");
  const submit = form.getByRole("button", { name: "Zapisuję się" });
  await submit.click();
  await expect(form.getByRole("alert")).toContainText(
    "Nie udało się sprawdzić zabezpieczenia",
  );
  expect(captured).toEqual([]);
  turnstile.mode("success");
  await submit.click();
  await expect(form.getByRole("status")).toContainText("Sprawdź skrzynkę");
  expect(captured).toHaveLength(1);
});

test("verification without a token times out and can be retried", async ({
  page,
  leadWebhook,
  turnstile,
}) => {
  turnstile.mode("pending");
  const captured = await leadWebhook.mock(page, [200]);
  await page.goto("/#newsletter");
  await dismissConsentBanner(page);
  await page.clock.install();
  const form = page.locator("#newsletter form");
  await form
    .getByLabel("Twój adres e-mail", { exact: true })
    .fill("ola@example.com");
  const submit = form.getByRole("button", { name: "Zapisuję się" });
  await submit.click();
  await expect
    .poll(() => page.evaluate(() => window.__turnstileMock?.executed ?? 0))
    .toBe(1);
  await page.clock.fastForward(120001);
  await expect(form.getByRole("alert")).toContainText(
    "Nie udało się sprawdzić zabezpieczenia",
  );
  await expect(submit).toBeEnabled();
  expect(captured).toEqual([]);
  await submit.click();
  await expect
    .poll(() => page.evaluate(() => window.__turnstileMock?.executed ?? 0))
    .toBe(2);
  await page.evaluate(() =>
    window.__turnstileMock.fire(0, "success", "expired-attempt-token"),
  );
  await expect(submit).toBeDisabled();
  expect(captured).toEqual([]);
  await page.evaluate(() =>
    window.__turnstileMock.fire(1, "success", "fresh-attempt-token"),
  );
  await expect(form.getByRole("status")).toContainText("Sprawdź skrzynkę");
  expect(captured[0]?.body).toMatchObject({
    turnstileToken: "fresh-attempt-token",
  });
});

test("closing a dialog leaves an already sent HTTP request running", async ({
  page,
  leadWebhook,
}) => {
  const captured = await leadWebhook.mock(page, [200], { delayMs: 700 });
  await page.goto("/ebooki/suplementy-w-pcos/");
  await dismissConsentBanner(page);
  const open = page
    .locator(".ebook3a-offer")
    .getByRole("button", { name: "Zapisz się na listę oczekujących" });
  await open.click();
  const dialog = page.locator("#lista-oczekujacych");
  await expect(dialog).toHaveAccessibleName("Daj znać, że czekasz");
  await dialog
    .getByLabel("Twój adres e-mail", { exact: true })
    .fill("ola@example.com");
  await dialog.getByRole("button", { name: "Zapisuję się" }).click();
  await expect(dialog.getByRole("status")).toHaveText("Wysyłanie…");
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect.poll(() => captured.length).toBe(1);
  await expect(dialog.locator('button[type="submit"]')).toBeEnabled();
  await open.click();
  await expect(dialog.getByRole("status")).toHaveText(
    "Gotowe. Napiszemy, gdy e-book będzie dostępny.",
  );
});

for (const zoom of [1, 2]) {
  test(`compact challenge fits ${zoom === 1 ? "320px" : "desktop at 200% zoom"} and works with keyboard and reduced motion`, async ({
    page,
    leadWebhook,
    turnstile,
  }) => {
    turnstile.mode("pending");
    const captured = await leadWebhook.mock(page, [200]);
    await page.setViewportSize({ width: zoom === 1 ? 320 : 1280, height: 800 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/#newsletter");
    await dismissConsentBanner(page);
    await page.evaluate((value) => {
      document.documentElement.style.zoom = String(value);
    }, zoom);
    const form = page.locator("#newsletter form");
    await form
      .getByLabel("Twój adres e-mail", { exact: true })
      .fill("ola@example.com");
    await form.getByRole("button", { name: "Zapisuję się" }).click();
    const challenge = form.getByRole("group", {
      name: "Zabezpieczenie przed botami",
    });
    await expect(challenge.getByRole("checkbox")).toBeVisible();
    const bounds = await challenge.boundingBox();
    const checkboxBounds = await challenge.getByRole("checkbox").boundingBox();
    expect(bounds).not.toBeNull();
    expect(checkboxBounds).not.toBeNull();
    expect(bounds?.x).toBeGreaterThanOrEqual(0);
    expect(
      (checkboxBounds?.x ?? 0) + (checkboxBounds?.width ?? 0),
    ).toBeLessThanOrEqual(zoom === 1 ? 320 : 1280);
    await challenge.getByRole("checkbox").focus();
    await page.keyboard.press("Space");
    await expect(form.getByRole("status")).toContainText("Sprawdź skrzynkę");
    expect(captured[0]?.body).toMatchObject({
      turnstileToken: "test-token-interaction-0",
    });
  });
}

test("widget cleanup errors preserve accepted HTTP results and allow retries", async ({
  page,
  leadWebhook,
  turnstile,
}) => {
  turnstile.mode("cleanup-error");
  const captured = await leadWebhook.mock(page, [500, 200, 200]);
  await page.goto("/#newsletter");
  await dismissConsentBanner(page);
  const form = page.locator("#newsletter form");
  const email = form.getByLabel("Twój adres e-mail", { exact: true });
  const submit = form.getByRole("button", { name: "Zapisuję się" });
  await email.fill("ola@example.com");
  await submit.click();
  await expect(form.getByRole("alert")).toContainText("Nie udało się zapisać");
  await expect(submit).toBeEnabled();
  await submit.click();
  await expect(form.getByRole("status")).toContainText("Sprawdź skrzynkę");
  await expect(form.getByRole("alert")).toBeEmpty();
  await expect(email).toHaveValue("");
  await email.fill("ola@example.com");
  await submit.click();
  await expect(form.getByRole("status")).toContainText("Sprawdź skrzynkę");
  expect(captured).toHaveLength(3);
  expect(await page.evaluate(() => window.__turnstileMock.removed)).toBe(3);
});
