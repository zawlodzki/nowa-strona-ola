import { describe, expect, it, vi } from "vitest";
import { createAnalytics } from "../../src/lib/analytics";
import { resolveTrackingPolicy } from "../../src/lib/tracking-policy";

const preferences = {
  necessary: true,
  measurement: true,
  marketing: false,
} as const;
const neutral = {
  pageCode: "neutral-information",
  measurement: true,
  clarity: false,
  marketing: false,
};

describe("Basic consent measurement gateway", () => {
  it("never loads a tag for excluded content, even after both consents", () => {
    const load = vi.fn();
    const push = vi.fn();
    const gate = createAnalytics({
      enabled: true,
      policy: null,
      push,
      load,
      stop: vi.fn(),
    });
    gate.applyPreferences({ ...preferences, marketing: true });
    expect(load).not.toHaveBeenCalled();
    expect(push).toHaveBeenCalledWith([
      "consent",
      "update",
      expect.objectContaining({
        analytics_storage: "denied",
        ad_storage: "denied",
      }),
    ]);
    for (const path of [
      "/",
      "/o-mnie/",
      "/konsultacje/",
      "/ebooki/",
      "/kontakt/",
      "/unknown/",
    ])
      expect(resolveTrackingPolicy(path, "unreviewed-content")).toBeNull();
  });

  it("requires the loader flag and the relevant category independently", () => {
    for (const enabled of [true, false]) {
      const load = vi.fn();
      const gate = createAnalytics({
        enabled,
        policy: neutral,
        push: vi.fn(),
        load,
        stop: vi.fn(),
      });
      gate.applyPreferences({
        necessary: true,
        measurement: false,
        marketing: true,
      });
      expect(load).not.toHaveBeenCalled();
      gate.applyPreferences(preferences);
      expect(load).toHaveBeenCalledTimes(enabled ? 1 : 0);
    }
  });

  it("updates consent before a single load and sends only a controlled page code", () => {
    const order: unknown[] = [];
    const gate = createAnalytics({
      enabled: true,
      policy: neutral,
      push: (entry) => order.push(entry),
      load: () => order.push("load"),
      stop: vi.fn(),
    });
    gate.applyPreferences(preferences);
    gate.applyPreferences(preferences);
    expect(order[0]).toEqual([
      "consent",
      "update",
      expect.objectContaining({
        analytics_storage: "granted",
        ad_storage: "denied",
      }),
    ]);
    expect(order.filter((entry) => entry === "load")).toHaveLength(1);
    expect(
      order.filter(
        (entry) =>
          typeof entry === "object" &&
          entry !== null &&
          "event" in entry &&
          entry.event === "ao_page_view",
      ),
    ).toEqual([{ event: "ao_page_view", ao_page_code: "neutral-information" }]);
  });

  it("stops an already loaded vendor on withdrawal before sending a denied update ping", () => {
    const push = vi.fn();
    const stop = vi.fn();
    const gate = createAnalytics({
      enabled: true,
      policy: neutral,
      push,
      load: vi.fn(),
      stop,
    });
    gate.applyPreferences(preferences);
    push.mockClear();
    gate.applyPreferences({
      necessary: true,
      measurement: false,
      marketing: false,
    });
    expect(stop).toHaveBeenCalledOnce();
    expect(push).not.toHaveBeenCalled();
  });

  it("sends one page view when measurement is granted after marketing", () => {
    const push = vi.fn();
    const load = vi.fn();
    const gate = createAnalytics({
      enabled: true,
      policy: { ...neutral, marketing: true },
      push,
      load,
      stop: vi.fn(),
    });
    gate.applyPreferences({
      necessary: true,
      measurement: false,
      marketing: true,
    });
    expect(push.mock.calls.flat()).not.toContainEqual({
      event: "ao_page_view",
      ao_page_code: "neutral-information",
    });
    gate.applyPreferences({ ...preferences, marketing: true });
    gate.applyPreferences({ ...preferences, marketing: true });
    expect(load).toHaveBeenCalledOnce();
    const pageViews = push.mock.calls
      .flat()
      .filter(
        (entry) => !Array.isArray(entry) && entry.event === "ao_page_view",
      );
    expect(pageViews).toEqual([
      { event: "ao_page_view", ao_page_code: "neutral-information" },
    ]);
  });
});
