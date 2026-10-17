import { describe, expect, it } from "vitest";

import { assertCssUnderCap } from "../../scripts/check-css-budgets.mjs";

const homeExternalCap = 8 * 1024;
const inlineCap = 4 * 1024;

describe("css budget operator", () => {
  it("fails when external bytes equal the home cap", () => {
    expect(() =>
      assertCssUnderCap(
        homeExternalCap,
        homeExternalCap,
        "index.html: external CSS exceeds 8192 B gzip (8192)",
      ),
    ).toThrow(/external CSS exceeds 8192/);
  });

  it("accepts one byte under the home external cap", () => {
    expect(() =>
      assertCssUnderCap(
        homeExternalCap - 1,
        homeExternalCap,
        "index.html: external CSS exceeds",
      ),
    ).not.toThrow();
  });

  it("fails when inline bytes equal the cap", () => {
    expect(() =>
      assertCssUnderCap(
        inlineCap,
        inlineCap,
        "kontakt/index.html: inline CSS exceeds 4096 B (4096)",
      ),
    ).toThrow(/inline CSS exceeds 4096/);
  });

  it("accepts one byte under the inline cap", () => {
    expect(() =>
      assertCssUnderCap(inlineCap - 1, inlineCap, "kontakt/index.html: inline"),
    ).not.toThrow();
  });
});
