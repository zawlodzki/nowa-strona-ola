import { describe, expect, it, vi } from "vitest";
import { createAnalytics } from "../../src/lib/analytics";

const preferences = {
  necessary: true,
  measurement: true,
  marketing: false,
} as const;
const neutral = {
  pageCode: "home" as const,
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
    ).toEqual([{ event: "ao_page_view", ao_page_code: "home" }]);
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
      ao_page_code: "home",
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
      { event: "ao_page_view", ao_page_code: "home" },
    ]);
  });
});

it("waits for durable restricted settlement, never reloads an expanded or unavailable state", () => {
  const stop = vi.fn();
  const reload = vi.fn();
  const push = vi.fn();
  const gate = createAnalytics({
    enabled: true,
    policy: { ...neutral, marketing: true },
    push,
    load: vi.fn(),
    stop,
    reload,
  });
  const all = { ...preferences, marketing: true };
  const partial = { ...preferences, marketing: false };
  gate.applyConsent({ phase: "settled", preferences: all, error: null });
  push.mockClear();
  gate.applyConsent({ phase: "saving", preferences: partial, error: null });
  gate.applyConsent({ phase: "saving", preferences: partial, error: null });
  gate.applyConsent({
    phase: "unavailable",
    preferences: partial,
    error: "blocked",
  });
  gate.applyConsent({ phase: "settled", preferences: all, error: null });
  expect(stop).toHaveBeenCalledOnce();
  expect(reload).not.toHaveBeenCalled();
  expect(push).not.toHaveBeenCalled();
  gate.applyConsent({ phase: "settled", preferences: partial, error: null });
  gate.applyConsent({ phase: "settled", preferences: partial, error: null });
  expect(reload).toHaveBeenCalledOnce();
  expect(push).not.toHaveBeenCalled();
});

it("synchronizes runtime state before queued grants and marks revocation before stopping SDKs", () => {
  const order: unknown[] = [];
  const gate = createAnalytics({
    enabled: true,
    policy: { ...neutral, marketing: true },
    push: (entry) => order.push(entry),
    load: () => order.push("load"),
    stop: () => order.push("stop"),
    syncState: (state) => order.push(state),
  });
  gate.applyPreferences({
    necessary: true,
    measurement: false,
    marketing: true,
  });
  expect(order[0]).toBe("marketing");
  expect(order).not.toContainEqual({
    event: "ao_page_view",
    ao_page_code: "home",
  });
  gate.applyPreferences({ ...preferences, marketing: true });
  expect(order).toContain("all");
  order.length = 0;
  gate.applyPreferences(preferences);
  expect(order).toEqual(["revoked", "stop"]);
  gate.applyPreferences({ ...preferences, marketing: true });
  expect(order).toEqual(["revoked", "stop"]);
});

describe("consent-gated AI source", () => {
  it.each([
    { enabled: false, policy: neutral, choice: preferences },
    { enabled: true, policy: null, choice: preferences },
    {
      enabled: true,
      policy: { ...neutral, measurement: false },
      choice: preferences,
    },
    {
      enabled: true,
      policy: neutral,
      choice: { ...preferences, measurement: false },
    },
    {
      enabled: true,
      policy: { ...neutral, marketing: true },
      choice: { ...preferences, measurement: false, marketing: true },
    },
  ])(
    "does not read the source through a closed measurement gate",
    ({ enabled, policy, choice }) => {
      const readAiSource = vi.fn(() => "chatgpt" as const);
      const push = vi.fn();
      const gate = createAnalytics({
        enabled,
        policy,
        push,
        load: vi.fn(),
        stop: vi.fn(),
        readAiSource,
      });
      gate.applyPreferences(choice);
      expect(readAiSource).not.toHaveBeenCalled();
      expect(JSON.stringify(push.mock.calls)).not.toContain("ao_ai_source");
    },
  );
  it("reads once after late measurement, before config and load, and never after revocation", () => {
    const order: unknown[] = [];
    const readAiSource = vi.fn(() => {
      order.push("read");
      return "chatgpt" as const;
    });
    const gate = createAnalytics({
      enabled: true,
      policy: { ...neutral, marketing: true },
      push: (entry) => order.push(entry),
      load: () => order.push("load"),
      stop: () => order.push("stop"),
      readAiSource,
    });
    gate.applyPreferences({
      ...preferences,
      measurement: false,
      marketing: true,
    });
    expect(order).not.toContain("read");
    expect(JSON.stringify(order)).not.toContain("ao_ai_source");
    order.length = 0;
    gate.applyPreferences({ ...preferences, marketing: true });
    expect(order[0]).toBe("read");
    expect(order[2]).toEqual({
      event: "consent-update",
      ao_measurement: true,
      ao_clarity: false,
      ao_marketing: true,
      ao_page_code: "home",
      ao_ai_source: "chatgpt",
    });
    expect(order[3]).toEqual({
      event: "ao_page_view",
      ao_page_code: "home",
      ao_ai_source: "chatgpt",
    });
    gate.applyPreferences({ ...preferences, marketing: true });
    expect(readAiSource).toHaveBeenCalledOnce();
    order.length = 0;
    gate.applyPreferences({
      ...preferences,
      measurement: false,
      marketing: true,
    });
    gate.applyPreferences({ ...preferences, marketing: true });
    expect(order).toEqual(["stop"]);
    expect(readAiSource).toHaveBeenCalledOnce();
  });
  it("puts the code in config before the first loader", () => {
    const order: unknown[] = [];
    const gate = createAnalytics({
      enabled: true,
      policy: neutral,
      push: (entry) => order.push(entry),
      load: () => order.push("load"),
      stop: vi.fn(),
      readAiSource: () => "claude",
    });
    gate.applyPreferences(preferences);
    expect(order[1]).toEqual({
      event: "consent-update",
      ao_measurement: true,
      ao_clarity: false,
      ao_marketing: false,
      ao_page_code: "home",
      ao_ai_source: "claude",
    });
    expect(order[2]).toBe("load");
    expect(order[3]).toEqual({
      event: "ao_page_view",
      ao_page_code: "home",
      ao_ai_source: "claude",
    });
  });
  it("omits unrecognized source without changing existing event shape", () => {
    const readAiSource = vi.fn(() => null);
    const push = vi.fn();
    const gate = createAnalytics({
      enabled: true,
      policy: neutral,
      push,
      load: vi.fn(),
      stop: vi.fn(),
      readAiSource,
    });
    gate.applyPreferences(preferences);
    gate.applyPreferences(preferences);
    expect(readAiSource).toHaveBeenCalledOnce();
    expect(push).toHaveBeenCalledWith({
      event: "ao_page_view",
      ao_page_code: "home",
    });
    expect(JSON.stringify(push.mock.calls)).not.toContain("ao_ai_source");
  });
});
