import { describe, expect, it } from "vitest";

import { DEPLOYMENT_ENV_KEYS } from "../setup-env";

// Regression: run 39161054103 timed out because CI deployment variables made
// the inventory test query live Sanity instead of fixtures.
describe("unit test environment", () => {
  it("hides deployment variables from code under test", () => {
    for (const key of DEPLOYMENT_ENV_KEYS) {
      expect(process.env[key]).toBeUndefined();
      expect(import.meta.env[key]).toBeUndefined();
    }
  });
});
