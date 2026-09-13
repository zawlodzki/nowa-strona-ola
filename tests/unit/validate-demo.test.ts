import { describe, expect, it } from "vitest";
import { validateDemo } from "../../src/lib/validate-demo";
describe("demo form validation", () => {
  it("accepts Polish characters and surrounding whitespace", () => {
    expect(
      validateDemo({ name: " Łucja ", email: " ola@example.com " }),
    ).toEqual({ name: false, email: false });
  });
  it.each(["", " ", "a"])("rejects short name %j", (name) => {
    expect(validateDemo({ name, email: "ola@example.com" }).name).toBe(true);
  });
  it.each(["", "ola", "ola@", "ola @example.com", "ola@example"])(
    "rejects email %j",
    (email) => {
      expect(validateDemo({ name: "Ola", email }).email).toBe(true);
    },
  );
  it("enforces length limits", () => {
    expect(
      validateDemo({ name: "a".repeat(101), email: "a".repeat(250) + "@x.pl" }),
    ).toEqual({ name: true, email: true });
  });
});
