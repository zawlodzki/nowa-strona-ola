import { describe, expect, it } from "vitest";
import {
  parseTrackingPolicy,
  resolveTrackingPolicy,
} from "../../src/lib/tracking-policy";

describe("page measurement policy", () => {
  it.each([
    "home",
    "about",
    "blog-index",
    "blog-article",
    "ebook-index",
    "ebook-detail",
  ])("allows %s without requiring a CMS migration", (kind) => {
    expect(resolveTrackingPolicy(kind)).toEqual({
      pageCode: kind,
      measurement: true,
      clarity: true,
      marketing: true,
    });
    expect(
      resolveTrackingPolicy(kind, { excludeFromMeasurement: false }),
    ).not.toBeNull();
    expect(
      resolveTrackingPolicy(kind, { excludeFromMeasurement: true }),
    ).toBeNull();
  });
  it.each([
    "contact",
    "consultation",
    "withdrawal",
    "legal",
    "404",
    "preview",
    "unknown",
    "/ebooki/pcos/",
  ])("excludes %s regardless of consent or content", (kind) => {
    expect(
      resolveTrackingPolicy(kind, { excludeFromMeasurement: false }),
    ).toBeNull();
  });
  it("rejects malformed browser attributes and never accepts a raw URL as a page code", () => {
    expect(
      parseTrackingPolicy({
        pageCode: "home",
        measurement: "true",
        clarity: "false",
        marketing: "true",
      }),
    ).toEqual({
      pageCode: "home",
      measurement: true,
      clarity: false,
      marketing: true,
    });
    expect(
      parseTrackingPolicy({
        pageCode: "/blog/health/?email=user@example.com",
        measurement: "true",
        clarity: "true",
        marketing: "true",
      }),
    ).toBeNull();
    expect(
      parseTrackingPolicy({ pageCode: "home", measurement: "true" }),
    ).toBeNull();
    expect(
      parseTrackingPolicy({
        pageCode: "home",
        measurement: "1",
        clarity: "true",
        marketing: "true",
      }),
    ).toBeNull();
  });
});
