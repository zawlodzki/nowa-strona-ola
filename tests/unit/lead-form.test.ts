import { formKeys } from "@ola/shared";
import { describe, expect, it } from "vitest";

import { formKeyOptions } from "../../studio/schema-types/documents/form";
import { inlineMarkdownHtml } from "../../src/lib/inline-markdown";
import { resolveLeadWebhookUrl } from "../../src/lib/lead-endpoint";
import {
  buildLeadSubmission,
  invalidFieldNames,
  isInvalidField,
  postLeadSubmission,
  type LeadFormSpec,
} from "../../src/lib/lead-form";

const context = {
  submissionId: "3f1c2a9e-0000-4000-8000-000000000001",
  submittedAt: "2026-10-10T12:30:00.000Z",
  href: "https://aleksandraolesiewicz.com/blog/pcos/?utm_source=ig&email=x#newsletter",
};

const newsletter: LeadFormSpec = {
  formKey: "newsletter",
  version: "2.3",
  language: "pl",
  noticeConsentId: "Z6",
  fields: [{ name: "email", input: "email", required: true }],
};

describe("lead submission payload", () => {
  it("records the newsletter notice as consent Z6 and drops the query string", () => {
    expect(
      buildLeadSubmission(newsletter, { email: " ola@example.com " }, context),
    ).toEqual({
      schemaVersion: 2,
      submissionId: "3f1c2a9e-0000-4000-8000-000000000001",
      formKey: "newsletter",
      formVersion: "2.3",
      language: "pl",
      source: "https://aleksandraolesiewicz.com/blog/pcos/",
      submittedAt: "2026-10-10T12:30:00.000Z",
      fields: { email: "ola@example.com" },
      consents: [
        { id: "Z6", version: "2.3", acceptedAt: "2026-10-10T12:30:00.000Z" },
      ],
    });
  });

  it("turns checked checkboxes into consents and keeps them out of fields", () => {
    const spec: LeadFormSpec = {
      formKey: "contact",
      version: "2.3",
      language: "pl",
      fields: [
        { name: "email", input: "email", required: true },
        { name: "topic", input: "text", required: true },
        { name: "Z1", input: "checkbox", required: true },
        { name: "Z5", input: "checkbox", required: false },
      ],
    };
    expect(
      buildLeadSubmission(
        spec,
        { email: "ola@example.com", topic: "Konsultacja", Z1: "on", Z5: "" },
        context,
      ),
    ).toEqual({
      schemaVersion: 2,
      submissionId: "3f1c2a9e-0000-4000-8000-000000000001",
      formKey: "contact",
      formVersion: "2.3",
      language: "pl",
      source: "https://aleksandraolesiewicz.com/blog/pcos/",
      submittedAt: "2026-10-10T12:30:00.000Z",
      fields: { email: "ola@example.com", topic: "Konsultacja" },
      consents: [
        { id: "Z1", version: "2.3", acceptedAt: "2026-10-10T12:30:00.000Z" },
      ],
    });
  });

  it("names every invalid field in form order", () => {
    const spec: LeadFormSpec = {
      formKey: "withdrawal",
      version: "2.3",
      language: "pl",
      fields: [
        { name: "fullName", input: "text", required: true },
        { name: "email", input: "email", required: true },
        {
          name: "subject",
          input: "select",
          required: true,
          options: ["E-book", "Konsultacja lub usługa dodatkowa"],
        },
        { name: "purchaseDate", input: "date", required: true },
        { name: "phone", input: "tel", required: false },
      ],
    };
    expect(
      invalidFieldNames(spec, {
        fullName: "Ola Nowak",
        email: "ola@",
        subject: "Inne",
        purchaseDate: "2026-02-30",
      }),
    ).toEqual(["email", "subject", "purchaseDate"]);
  });
});

describe("field validation", () => {
  it.each([
    ["email", "ola@example.com", false],
    ["email", "ola @example.com", true],
    ["text", "Ł", true],
    ["text", " Łucja ", false],
    ["text", "a".repeat(101), true],
    ["tel", "+48 500 600 700", false],
    ["tel", "abcdef", true],
    ["tel", "1234567890123456", true],
    ["date", "2026-10-09", false],
    ["date", "2026-13-01", true],
    ["date", "9.10.2026", true],
    ["textarea", "a".repeat(2000), false],
    ["textarea", "a".repeat(2001), true],
  ] as const)("%s %j invalid=%s", (input, value, expected) => {
    expect(isInvalidField({ name: "f", input, required: true }, value)).toBe(
      expected,
    );
  });

  it("accepts an empty optional field and rejects an empty required one", () => {
    expect(
      isInvalidField({ name: "p", input: "tel", required: false }, ""),
    ).toBe(false);
    expect(
      isInvalidField({ name: "p", input: "tel", required: true }, " "),
    ).toBe(true);
  });

  it("requires a ticked box only when the consent is required", () => {
    expect(
      isInvalidField({ name: "Z1", input: "checkbox", required: true }, ""),
    ).toBe(true);
    expect(
      isInvalidField({ name: "Z1", input: "checkbox", required: true }, "on"),
    ).toBe(false);
    expect(
      isInvalidField({ name: "Z5", input: "checkbox", required: false }, ""),
    ).toBe(false);
  });
});

describe("posting a submission", () => {
  const submission = buildLeadSubmission(
    newsletter,
    { email: "ola@example.com" },
    context,
  );

  it("sends JSON with a content-type header and reports a 2xx as sent", async () => {
    const calls: { url: string; init: RequestInit | undefined }[] = [];
    const sent = await postLeadSubmission(
      "https://hooks.example.test/lead",
      submission,
      async (url, init) => {
        calls.push({ url: String(url), init });
        return new Response(null, { status: 200 });
      },
    );
    expect(sent).toBe(true);
    expect(calls).toEqual([
      {
        url: "https://hooks.example.test/lead",
        init: {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(submission),
        },
      },
    ]);
  });

  it("reports a server error and a network failure as not sent", async () => {
    expect(
      await postLeadSubmission(
        "https://hooks.example.test/lead",
        submission,
        async () => new Response(null, { status: 500 }),
      ),
    ).toBe(false);
    expect(
      await postLeadSubmission(
        "https://hooks.example.test/lead",
        submission,
        async () => {
          throw new TypeError("Failed to fetch");
        },
      ),
    ).toBe(false);
  });
});

describe("lead webhook endpoint", () => {
  it("uses the production webhook unless a build override is set", () => {
    expect(resolveLeadWebhookUrl(undefined)).toBe(
      "https://flows.zawlodzki.com/webhook/2fba1cf1-729f-4e79-8ebf-869f9277284e",
    );
    expect(resolveLeadWebhookUrl("https://hooks.example.test/lead")).toBe(
      "https://hooks.example.test/lead",
    );
    expect(() => resolveLeadWebhookUrl("http://hooks.example.test/")).toThrow(
      "PUBLIC_LEAD_WEBHOOK_URL",
    );
  });
});

describe("form keys", () => {
  it("offers exactly the shared form keys in Studio", () => {
    expect(formKeyOptions.map((option) => option.value)).toEqual([...formKeys]);
  });
});

describe("inline markdown in labels and notices", () => {
  it("renders links and bold and escapes the rest", () => {
    expect(
      inlineMarkdownHtml(
        "Odpowiemy. **Nie opisuj zdrowia** <b>. [Polityka prywatności](/polityka-prywatnosci/) [x](javascript:alert(1))",
      ),
    ).toBe(
      'Odpowiemy. <strong>Nie opisuj zdrowia</strong> &lt;b&gt;. <a href="/polityka-prywatnosci/">Polityka prywatności</a> [x](javascript:alert(1))',
    );
  });
});
