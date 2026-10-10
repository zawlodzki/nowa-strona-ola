import AxeBuilder from "@axe-core/playwright";

import { expect, test } from "./helpers/lead-webhook";

const uuid =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
const isoDate = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

const newsletterNotice =
  "Zapisując się, zamawiasz newsletter Wellbiz sp. z o.o. i zgadzasz się na otrzymywanie e-maili z wiedzą o żywieniu oraz informacjami o e-bookach i konsultacjach. Wypiszesz się jednym kliknięciem — link jest w każdej wiadomości. Newsletter jest dla osób pełnoletnich. Regulamin newslettera · Polityka prywatności";
const newsletterSuccess =
  "Sprawdź skrzynkę. Wysłaliśmy e-mail z linkiem potwierdzającym. Zapis będzie aktywny dopiero po kliknięciu w link.";
const newsletterError =
  "Nie udało się zapisać. Sprawdź połączenie i spróbuj ponownie — wpisany adres został w formularzu.";

function submittedAt(body: unknown): string {
  if (typeof body !== "object" || body === null || !("submittedAt" in body)) {
    throw new Error("Payload bez submittedAt.");
  }
  return String(body.submittedAt);
}

test("newsletter sends the v2 payload with consent Z6 after the notice", async ({
  page,
  leadWebhook,
}) => {
  const captured = await leadWebhook.mock(page, [200], { delayMs: 300 });
  await page.goto("/?utm_source=test#newsletter");
  const form = page.locator("#newsletter form");
  await expect(form.getByRole("checkbox")).toHaveCount(0);
  await expect(form.locator(".ao-form-note")).toHaveText(newsletterNotice);
  await expect(
    form.getByRole("link", { name: "Regulamin newslettera" }),
  ).toHaveAttribute("href", "/regulamin-newslettera/");
  await expect(
    form.getByRole("link", { name: "Polityka prywatności" }),
  ).toHaveAttribute("href", "/polityka-prywatnosci/");

  const email = form.getByLabel("Twój adres e-mail", { exact: true });
  const submit = form.getByRole("button", { name: "Zapisuję się" });
  await submit.click();
  await expect(email).toBeFocused();
  await expect(form.locator("#email-error")).toBeVisible();
  await email.fill("wrong");
  await submit.click();
  await expect(email).toBeFocused();
  expect(captured).toEqual([]);

  await email.fill("ola@example.com");
  await submit.click();
  await expect(submit).toBeDisabled();
  await expect(form.getByRole("status")).toBeEmpty();
  await expect(form.getByRole("status")).toHaveText(newsletterSuccess);
  await expect(submit).toBeEnabled();
  await expect(email).toHaveValue("");
  await expect(form.locator('[aria-invalid="true"]')).toHaveCount(0);

  expect(captured).toHaveLength(1);
  const [lead] = captured;
  expect(lead?.contentType).toBe("application/json");
  const sentAt = submittedAt(lead?.body);
  expect(lead?.body).toEqual({
    schemaVersion: 2,
    submissionId: expect.stringMatching(uuid),
    formKey: "newsletter",
    formVersion: "2.3",
    language: "pl",
    source: "http://127.0.0.1:4321/",
    submittedAt: expect.stringMatching(isoDate),
    fields: { email: "ola@example.com" },
    consents: [{ id: "Z6", version: "2.3", acceptedAt: sentAt }],
  });
});

test("newsletter keeps the address after a server error and retries with the same id", async ({
  page,
  leadWebhook,
}) => {
  const captured = await leadWebhook.mock(page, [500, 200]);
  await page.goto("/#newsletter");
  const form = page.locator("#newsletter form");
  const email = form.getByLabel("Twój adres e-mail", { exact: true });
  const submit = form.getByRole("button", { name: "Zapisuję się" });
  await email.fill("ola@example.com");
  await submit.click();
  await expect(form.getByRole("alert")).toHaveText(newsletterError);
  await expect(form.getByRole("status")).toBeEmpty();
  await expect(email).toHaveValue("ola@example.com");
  await expect(submit).toBeEnabled();

  await submit.click();
  await expect(form.getByRole("status")).toHaveText(newsletterSuccess);
  await expect(form.getByRole("alert")).toBeEmpty();
  expect(captured).toHaveLength(2);
  const [first, retry] = captured.map(
    (lead) => lead.body as { submissionId: string },
  );
  expect(retry?.submissionId).toBe(first?.submissionId);
});

test("filled honeypot shows success without sending", async ({
  page,
  leadWebhook,
}) => {
  const captured = await leadWebhook.mock(page, []);
  await page.goto("/#newsletter");
  const form = page.locator("#newsletter form");
  await form.locator("[data-honeypot]").evaluate((input: HTMLInputElement) => {
    input.value = "https://spam.example";
  });
  await form
    .getByLabel("Twój adres e-mail", { exact: true })
    .fill("bot@example.com");
  await form.getByRole("button", { name: "Zapisuję się" }).click();
  await expect(form.getByRole("status")).toHaveText(newsletterSuccess);
  expect(captured).toEqual([]);
});

test("contact shows the health notice and sends the contact payload", async ({
  page,
  leadWebhook,
}) => {
  const captured = await leadWebhook.mock(page, [200]);
  await page.goto("/kontakt/");
  const form = page.locator("#contact-lead-form");
  const notice = form.locator(".ao-form-note");
  await expect(notice).toHaveText(
    "Odpowiemy na Twoje pytanie. Nie opisuj tu szczegółów swojego zdrowia — jeżeli umówisz konsultację, zapytamy o nie w bezpiecznej ankiecie. Administrator danych: Wellbiz sp. z o.o. Polityka prywatności",
  );
  await expect(notice.locator("strong")).toHaveText(
    "Nie opisuj tu szczegółów swojego zdrowia",
  );
  await expect(
    notice.getByRole("link", { name: "Polityka prywatności" }),
  ).toHaveAttribute("href", "/polityka-prywatnosci/");
  await form.getByLabel("E-mail", { exact: true }).fill("ola@example.com");
  await form
    .getByLabel("Temat rozmowy", { exact: true })
    .fill("Pytanie o konsultację");
  await form.getByRole("button", { name: "Wyślij wiadomość" }).click();
  await expect(form.getByRole("status")).toHaveText(
    "Dziękujemy, wiadomość dotarła. Odpowiemy na podany adres e-mail.",
  );
  expect(captured.map((lead) => lead.body)).toEqual([
    expect.objectContaining({
      formKey: "contact",
      formVersion: "2.3",
      source: "http://127.0.0.1:4321/kontakt/",
      fields: {
        email: "ola@example.com",
        phone: "",
        topic: "Pytanie o konsultację",
      },
      consents: [],
    }),
  ]);
});

test("withdrawal form sends the statement and shows a receipt", async ({
  page,
  leadWebhook,
}) => {
  const captured = await leadWebhook.mock(page, [200]);
  await page.goto("/odstapienie/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Odstąpienie od umowy",
  );
  await expect(
    page.getByRole("link", { name: "pouczenie o odstąpieniu" }),
  ).toHaveAttribute("href", "/regulamin/#pouczenie");
  await expect(
    page.getByRole("link", { name: "ola@aleksandraolesiewicz.com" }),
  ).toHaveAttribute("href", "mailto:ola@aleksandraolesiewicz.com");

  const form = page.locator("#withdrawal-lead-form");
  const submit = form.getByRole("button", {
    name: "Wysyłam oświadczenie o odstąpieniu",
  });
  const statement = form.getByLabel("Treść oświadczenia", { exact: true });
  await expect(statement).toHaveValue(
    "Odstępuję od umowy o dostarczenie e-booka / świadczenie usługi: …, zawartej …",
  );
  await submit.click();
  await expect(
    form.getByLabel("Imię i nazwisko", { exact: true }),
  ).toBeFocused();
  await expect(form.locator('[aria-invalid="true"]')).toHaveCount(5);

  await form.getByLabel("Imię i nazwisko", { exact: true }).fill("Anna Nowak");
  await form
    .getByLabel("Adres e-mail użyty przy zakupie", { exact: true })
    .fill("anna@example.com");
  await form
    .getByLabel("Czego dotyczy odstąpienie", { exact: true })
    .selectOption("E-book");
  await form
    .getByLabel("Tytuł e-booka albo data usługi", { exact: true })
    .fill("Suplementy w PCOS");
  await form.getByLabel("Data zakupu", { exact: true }).fill("2026-10-01");
  const text =
    "Odstępuję od umowy o dostarczenie e-booka: Suplementy w PCOS, zawartej 1.10.2026.";
  await statement.fill(text);
  expect(
    (
      await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
        .analyze()
    ).violations,
  ).toEqual([]);
  await submit.click();

  await expect(form.getByRole("status")).toHaveText(
    "Oświadczenie zostało wysłane. Potwierdzenie otrzymasz e-mailem, a zwrot płatności nastąpi w ciągu 14 dni.",
  );
  const receipt = form.locator("[data-receipt]");
  await expect(receipt).toBeVisible();
  await expect(receipt.locator("[data-receipt-field=statement]")).toHaveText(
    text,
  );
  const body = captured[0]?.body;
  const sentAt = submittedAt(body);
  await expect(receipt.locator("time")).toHaveAttribute("datetime", sentAt);
  await expect(receipt.locator("time")).toHaveText(
    await page.evaluate(
      (iso) =>
        new Intl.DateTimeFormat("pl-PL", {
          dateStyle: "long",
          timeStyle: "short",
        }).format(new Date(iso)),
      sentAt,
    ),
  );
  expect(body).toEqual({
    schemaVersion: 2,
    submissionId: expect.stringMatching(uuid),
    formKey: "withdrawal",
    formVersion: "2.3",
    language: "pl",
    source: "http://127.0.0.1:4321/odstapienie/",
    submittedAt: sentAt,
    fields: {
      fullName: "Anna Nowak",
      email: "anna@example.com",
      subject: "E-book",
      item: "Suplementy w PCOS",
      purchaseDate: "2026-10-01",
      statement: text,
    },
    consents: [],
  });
});

for (const { path, form, fill, submit } of [
  {
    path: "/ui/",
    form: "#section-form form",
    fill: { Imię: "Ola", "E-mail": "ola@example.com" },
    submit: "Wyślij wiadomość",
  },
  {
    path: "/design-system/",
    form: "#newsletter form",
    fill: { "Twój adres e-mail": "ola@example.com" },
    submit: "Zapisuję się",
  },
]) {
  test(`catalog form on ${path} validates and sends nothing`, async ({
    page,
    leadWebhook,
  }) => {
    const captured = await leadWebhook.mock(page, []);
    await page.goto(path);
    const locator = page.locator(form);
    await expect(locator.locator(".ao-form-note").last()).toHaveText(
      "Przykład z katalogu: formularz sprawdza pola i niczego nie wysyła.",
    );
    const button = locator.getByRole("button", { name: submit });
    await button.click();
    await expect(
      locator.locator('[aria-invalid="true"]').first(),
    ).toBeFocused();
    for (const [label, value] of Object.entries(fill)) {
      await locator.getByLabel(label, { exact: true }).fill(value);
    }
    await button.click();
    await expect(locator.getByRole("status")).toHaveText(
      "Dane poprawne. Nic nie wysłano.",
    );
    expect(captured).toEqual([]);
  });
}
