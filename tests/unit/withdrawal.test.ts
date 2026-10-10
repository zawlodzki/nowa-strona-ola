import { describe, expect, it } from "vitest";

import { mapWithdrawal } from "../../src/content/map-withdrawal";
import { buildLeadSubmission } from "../../src/lib/lead-form";
import { getPage } from "../../src/sanity/repository";

const fixture = { environment: {} };

describe("withdrawal page", () => {
  it("maps the form fields and builds the withdrawal payload", async () => {
    const view = mapWithdrawal(await getPage("pl", "odstapienie", fixture));
    expect(view.form.fields.map((field) => [field.name, field.input])).toEqual([
      ["fullName", "text"],
      ["email", "email"],
      ["subject", "select"],
      ["item", "text"],
      ["purchaseDate", "date"],
      ["statement", "textarea"],
    ]);
    expect(view.form.submit).toBe("Wysyłam oświadczenie o odstąpieniu");
    expect(view.intro.body.join(" ")).toContain("(/regulamin/#pouczenie)");

    const submission = buildLeadSubmission(
      {
        formKey: view.form.formKey,
        version: view.form.version,
        language: "pl",
        noticeConsentId: view.form.noticeConsentId,
        fields: view.form.fields,
      },
      {
        fullName: "Anna Nowak",
        email: "anna@example.com",
        subject: "E-book",
        item: "Suplementy w PCOS",
        purchaseDate: "2026-10-01",
        statement: "Odstępuję od umowy o dostarczenie e-booka.",
      },
      {
        submissionId: "id-1",
        submittedAt: "2026-10-10T08:00:00.000Z",
        href: "https://aleksandraolesiewicz.com/odstapienie/",
      },
    );
    expect(submission).toEqual({
      schemaVersion: 2,
      submissionId: "id-1",
      formKey: "withdrawal",
      formVersion: "2.3",
      language: "pl",
      source: "https://aleksandraolesiewicz.com/odstapienie/",
      submittedAt: "2026-10-10T08:00:00.000Z",
      fields: {
        fullName: "Anna Nowak",
        email: "anna@example.com",
        subject: "E-book",
        item: "Suplementy w PCOS",
        purchaseDate: "2026-10-01",
        statement: "Odstępuję od umowy o dostarczenie e-booka.",
      },
      consents: [],
    });
  });

  it("rejects a page whose form is not the withdrawal form", async () => {
    const page = await getPage("pl", "odstapienie", fixture);
    const contact = await getPage("pl", "kontakt", fixture);
    expect(() =>
      mapWithdrawal({
        ...page,
        sections: [page.sections[0], contact.sections[1]],
      }),
    ).toThrow("Odstąpienie wymaga formularza odstąpienia od umowy.");
  });
});
