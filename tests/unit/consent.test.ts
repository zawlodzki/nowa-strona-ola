import { afterEach, describe, expect, it, vi } from "vitest";
import { createAnalytics } from "../../src/lib/analytics";
import init from "../fixtures/c15t/init.json";
import postFixture from "../fixtures/c15t/subjects-post.json";
import getFixture from "../fixtures/c15t/subject-get.json";
import {
  createConsentController,
  type ConsentStorage,
  type ConsentView,
  type ConsentPreferences,
} from "../../src/lib/consent";
const origin = "https://aleksandraolesiewicz.com";
const all: ConsentPreferences = {
  necessary: true,
  measurement: true,
  marketing: true,
};
const denied: ConsentPreferences = {
  necessary: true,
  measurement: false,
  marketing: false,
};
const controllers: ReturnType<typeof createConsentController>[] = [];
afterEach(() => {
  controllers.splice(0).forEach((controller) => controller.dispose());
  vi.useRealTimers();
});
function setup() {
  let cookie: string | null = null;
  let mirror: string | null = null;
  const storage: ConsentStorage = {
    readCookie: () => cookie,
    writeCookie: (value) => {
      cookie = value;
    },
    readMirror: () => mirror,
    writeMirror: (value) => {
      mirror = value;
    },
  };
  let postStatus = 200;
  let initBody: unknown = init;
  let lastPost: Record<string, unknown> | undefined;
  let latest: Record<string, unknown> | undefined;
  let postWait: Promise<void> | undefined;
  let wrongDomain = false;
  let getWait: Promise<void> | undefined;
  let getStatus = 200;
  const fetcher = vi.fn<typeof fetch>(async (url, options) => {
    if (String(url).endsWith("/init")) return Response.json(initBody);
    if (options?.method === "POST") {
      const body: Record<string, unknown> = JSON.parse(String(options.body));
      lastPost = body;
      const waiting = postWait;
      if (waiting) await waiting;
      if (postStatus !== 200) return new Response("", { status: postStatus });
      latest = {
        ...getFixture.consents[0],
        id: `consent-${Date.now()}`,
        type: "cookie_banner",
        policyId: "pol_fixture",
        policyVersion: 1,
        policyHash: "database-policy-hash",
        isLatestPolicy: true,
        preferences: body.preferences,
        givenAt: new Date(Number(body.givenAt)).toISOString(),
      };
      return Response.json({
        ...postFixture,
        subjectId: body.subjectId,
        consentId: latest.id,
        domainId: "dom_fixture",
        domain: wrongDomain ? "www.zawlodzki.pl" : body.domain,
        type: "cookie_banner",
        metadata: null,
        appliedPreferences: body.preferences,
        uiSource: body.uiSource,
        givenAt: latest.givenAt,
      });
    }
    if (getWait) await getWait;
    if (getStatus !== 200) return new Response("", { status: getStatus });
    return Response.json({
      ...getFixture,
      subject: { id: lastPost?.subjectId, createdAt: new Date().toISOString() },
      consents: latest ? [latest] : [],
      isValid: true,
    });
  });
  const target = new EventTarget();
  const make = () => {
    const controller = createConsentController({
      endpoint: "https://c15t.test/api/c15t",
      origin,
      storage,
      fetch: fetcher,
      eventTarget: target,
    });
    controllers.push(controller);
    return controller;
  };
  const controller = make();
  let view: ConsentView | undefined;
  controller.subscribe((value) => {
    view = value;
  });
  return {
    controller,
    make,
    storage,
    fetcher,
    target,
    get view() {
      return view;
    },
    get cookie() {
      return cookie;
    },
    get mirror() {
      return mirror;
    },
    get post() {
      return lastPost;
    },
    wrongDomain() {
      wrongDomain = true;
    },
    setStatus(value: number) {
      postStatus = value;
    },
    setInit(value: unknown) {
      initBody = value;
    },
    setStorage(value: string) {
      cookie = value;
      mirror = value;
    },
    setGetWait(value: Promise<void> | undefined) {
      getWait = value;
    },
    setGetStatus(value: number) {
      getStatus = value;
    },
    setWait(value: Promise<void> | undefined) {
      postWait = value;
    },
    changeLatest() {
      if (latest) latest.id = "newer-unconfirmed-consent";
    },
  };
}
describe("confirmed c15t consent", () => {
  it("starts denied, confirms the exact backend2.2.1 POST and restores by latest GET receipt", async () => {
    const s = setup();
    await s.controller.start();
    expect(s.view?.phase).toBe("undecided");
    expect(await s.controller.choose(all, "all", "banner")).toBe(true);
    expect(s.post).toMatchObject({
      domain: "aleksandraolesiewicz.com",
      type: "cookie_banner",
      givenAt: expect.any(Number),
      policySnapshotToken: "signed-fixture-token",
    });
    expect(s.post?.subjectId).toMatch(/^sub_[1-9A-HJ-NP-Za-km-z]{24}$/);
    expect(s.cookie).toBe(s.mirror);
    const next = s.make();
    const states: ConsentView[] = [];
    next.subscribe((v) => states.push(v));
    await next.start();
    expect(states.at(-1)?.preferences).toEqual(all);
    expect(states[0]?.preferences).toEqual(denied);
  });
  it("does not grant while a POST is pending", async () => {
    const s = setup();
    await s.controller.start();
    let resolve = () => {};
    s.setWait(
      new Promise<void>((done) => {
        resolve = done;
      }),
    );
    const choice = s.controller.choose(all, "all", "banner");
    await vi.waitFor(() => expect(s.post).toBeDefined());
    expect(s.view).toMatchObject({ phase: "saving", preferences: denied });
    resolve();
    expect(await choice).toBe(true);
  });
  it.each([500, 409])("denies a new grant after HTTP %s", async (status) => {
    const s = setup();
    await s.controller.start();
    s.setStatus(status);
    expect(await s.controller.choose(all, "all", "banner")).toBe(false);
    expect(s.view?.preferences).toEqual(denied);
    expect(s.cookie).toBeNull();
    expect(s.view?.phase).toBe(status === 409 ? "undecided" : "unavailable");
  });
  it("persists a restricting offline revocation across reload", async () => {
    const s = setup();
    await s.controller.start();
    await s.controller.choose(all, "all", "banner");
    s.setStatus(500);
    const revoke = s.controller.choose(denied, "necessary", "dialog");
    expect(s.view?.preferences).toEqual(denied);
    expect(await revoke).toBe(false);
    expect(JSON.parse(s.cookie ?? "null").kind).toBe("pending");
    const next = s.make();
    let view: ConsentView | undefined;
    next.subscribe((v) => {
      view = v;
    });
    await next.start();
    expect(view?.preferences).toEqual(denied);
    expect(view?.phase).toBe("unavailable");
  });
  it("does not restore a policy fingerprint change or expired receipt", async () => {
    const s = setup();
    await s.controller.start();
    await s.controller.choose(all, "all", "banner");
    s.setInit({
      ...init,
      policyDecision: { ...init.policyDecision, fingerprint: "changed-policy" },
    });
    await s.controller.start();
    expect(s.view?.preferences).toEqual(denied);
    s.setInit(init);
    vi.useFakeTimers();
    vi.setSystemTime(Date.now() + 366 * 86400000);
    await s.controller.start();
    expect(s.view?.phase).toBe("undecided");
  });
  it("denies a receipt copied from another origin and a newer unknown backend record", async () => {
    const s = setup();
    await s.controller.start();
    await s.controller.choose(all, "all", "banner");
    const saved = s.cookie ?? "";
    s.setStorage(
      JSON.stringify({
        ...JSON.parse(saved),
        origin: "https://www.zawlodzki.pl",
      }),
    );
    await s.controller.start();
    expect(s.view?.preferences).toEqual(denied);
    s.setStorage(saved);
    s.changeLatest();
    await s.controller.start();
    expect(s.view?.phase).toBe("undecided");
  });
  it("rejects a late grant after a newer same-tab decision", async () => {
    const s = setup();
    await s.controller.start();
    let release = () => {};
    s.setWait(
      new Promise<void>((done) => {
        release = done;
      }),
    );
    const grant = s.controller.choose(all, "all", "banner");
    await vi.waitFor(() => expect(s.post).toBeDefined());
    s.setWait(undefined);
    expect(await s.controller.choose(denied, "necessary", "dialog")).toBe(true);
    release();
    expect(await grant).toBe(false);
    expect(s.view?.preferences).toEqual(denied);
  });
  it.each(["focus", "pageshow", "visibilitychange", "storage"])(
    "preserves an identical validated receipt during %s until GET fails",
    async (event) => {
      const s = setup();
      await s.controller.start();
      await s.controller.choose(all, "all", "banner");
      const stop = vi.fn();
      const load = vi.fn();
      const analytics = createAnalytics({
        enabled: true,
        policy: {
          pageCode: "neutral",
          measurement: true,
          marketing: true,
          clarity: true,
        },
        push: vi.fn(),
        load,
        stop,
      });
      s.controller.subscribe((state) =>
        analytics.applyPreferences(state.preferences),
      );
      expect(load).toHaveBeenCalledOnce();
      let release = () => {};
      s.setGetWait(
        new Promise<void>((done) => {
          release = done;
        }),
      );
      s.setGetStatus(500);
      s.target.dispatchEvent(new Event(event));
      expect(s.view).toMatchObject({ phase: "loading", preferences: all });
      expect(stop).not.toHaveBeenCalled();
      release();
      await vi.waitFor(() => expect(s.view?.phase).toBe("unavailable"));
      expect(s.view?.preferences).toEqual(denied);
      expect(stop).toHaveBeenCalledOnce();
    },
  );
  it("does not reload analytics across repeated successful lifecycle revalidation", async () => {
    const s = setup();
    const stop = vi.fn();
    const load = vi.fn();
    const analytics = createAnalytics({
      enabled: true,
      policy: {
        pageCode: "neutral",
        measurement: true,
        marketing: true,
        clarity: true,
      },
      push: vi.fn(),
      load,
      stop,
    });
    s.controller.subscribe((state) =>
      analytics.applyPreferences(state.preferences),
    );
    await s.controller.start();
    await s.controller.choose(all, "all", "banner");
    for (const event of ["focus", "pageshow", "visibilitychange"]) {
      s.target.dispatchEvent(new Event(event));
      expect(s.view?.preferences).toEqual(all);
      await vi.waitFor(() => expect(s.view?.phase).toBe("settled"));
    }
    expect(stop).not.toHaveBeenCalled();
    expect(load).toHaveBeenCalledOnce();
  });
  it("closes the gate immediately when a canonical receipt changes", async () => {
    const s = setup();
    await s.controller.start();
    await s.controller.choose(all, "all", "banner");
    s.setStorage(
      JSON.stringify({
        ...JSON.parse(s.cookie ?? "null"),
        consentId: "other-receipt",
      }),
    );
    s.target.dispatchEvent(new Event("storage"));
    expect(s.view?.preferences).toEqual(denied);
    await vi.waitFor(() => expect(s.view?.phase).toBe("undecided"));
  });
  it("synchronizes interrupted revocation after reload without restoring grants", async () => {
    const s = setup();
    await s.controller.start();
    await s.controller.choose(all, "all", "banner");
    let release = () => {};
    s.setWait(
      new Promise<void>((done) => {
        release = done;
      }),
    );
    const revoke = s.controller.choose(
      { ...denied, measurement: true },
      "custom",
      "dialog",
    );
    expect(s.view?.preferences).toEqual({ ...denied, measurement: true });
    s.controller.dispose();
    s.setWait(undefined);
    const next = s.make();
    const states: ConsentView[] = [];
    next.subscribe((value) => states.push(value));
    await next.start();
    expect(s.post?.preferences).toEqual(denied);
    expect(
      states.every(
        (state) =>
          !state.preferences.measurement && !state.preferences.marketing,
      ),
    ).toBe(true);
    expect(states.at(-1)?.phase).toBe("settled");
    expect(JSON.parse(s.cookie ?? "null").kind).toBe("receipt");
    release();
    expect(await revoke).toBe(false);
  });
  it("retries pending denial under a changed policy without reviving optional grants", async () => {
    const s = setup();
    await s.controller.start();
    await s.controller.choose(all, "all", "banner");
    s.setStatus(500);
    await s.controller.choose(
      { ...denied, measurement: true },
      "custom",
      "dialog",
    );
    s.setInit({
      ...init,
      policyDecision: { ...init.policyDecision, fingerprint: "changed-policy" },
    });
    s.setStatus(200);
    const next = s.make();
    await next.start();
    expect(s.post?.preferences).toEqual(denied);
    expect(JSON.parse(s.cookie ?? "null")).toMatchObject({
      kind: "receipt",
      fingerprint: "changed-policy",
      preferences: denied,
    });
  });
  it("closes an expiring receipt even while revalidation waits for the backend", async () => {
    const s = setup();
    await s.controller.start();
    await s.controller.choose(all, "all", "banner");
    const receipt = JSON.parse(s.cookie ?? "null");
    vi.useFakeTimers();
    vi.setSystemTime(receipt.expiresAt - 5_000);
    s.fetcher.mockImplementation(
      (_url, options) =>
        new Promise((_resolve, reject) => {
          options?.signal?.addEventListener(
            "abort",
            () => reject(new Error("timeout")),
            { once: true },
          );
        }),
    );
    const revalidation = s.controller.start();
    expect(s.view?.preferences).toEqual(all);
    await vi.advanceTimersByTimeAsync(5_000);
    expect(s.view?.preferences).toEqual(denied);
    s.controller.dispose();
    await revalidation;
  });
  it("fails closed on revalidation timeout without scheduling an offline retry loop", async () => {
    const s = setup();
    await s.controller.start();
    await s.controller.choose(all, "all", "banner");
    vi.useFakeTimers();
    s.fetcher.mockImplementation(
      (_url, options) =>
        new Promise((_resolve, reject) => {
          options?.signal?.addEventListener(
            "abort",
            () => reject(new Error("timeout")),
            { once: true },
          );
        }),
    );
    const revalidation = s.controller.start();
    expect(s.view?.preferences).toEqual(all);
    await vi.advanceTimersByTimeAsync(10_000);
    await revalidation;
    expect(s.view).toMatchObject({ phase: "unavailable", preferences: denied });
    const calls = s.fetcher.mock.calls.length;
    await vi.advanceTimersByTimeAsync(60_000);
    expect(s.fetcher).toHaveBeenCalledTimes(calls);
  });
  it("fails closed when cookie cannot retain a confirmed grant", async () => {
    const s = setup();
    s.storage.writeCookie = () => {};
    await s.controller.start();
    expect(await s.controller.choose(all, "all", "banner")).toBe(false);
    expect(s.view?.preferences).toEqual(denied);
  });
  it("rejects a successful response from a different domain", async () => {
    const s = setup();
    await s.controller.start();
    s.wrongDomain();
    expect(await s.controller.choose(all, "all", "banner")).toBe(false);
    expect(s.view?.preferences).toEqual(denied);
    expect(s.cookie).toBeNull();
  });
  it("rejects a late cross-tab grant when a persistent revocation appears", async () => {
    const s = setup();
    await s.controller.start();
    let release = () => {};
    s.setWait(
      new Promise<void>((done) => {
        release = done;
      }),
    );
    const grant = s.controller.choose(all, "all", "banner");
    await vi.waitFor(() => expect(s.post).toBeDefined());
    s.setStorage(
      JSON.stringify({
        version: 1,
        kind: "pending",
        origin,
        subjectId: s.post?.subjectId,
        preferences: denied,
      }),
    );
    release();
    expect(await grant).toBe(false);
    expect(s.view?.preferences).toEqual(denied);
    expect(JSON.parse(s.cookie ?? "null").kind).toBe("pending");
  });
  it.each([
    { ...init, policy: { ...init.policy, id: "zawlodzki_global_opt_in_v2" } },
    { ...init, policySnapshotToken: "" },
    { ...init, policy: { ...init.policy, model: "opt-out" } },
    {
      ...init,
      policy: {
        ...init.policy,
        consent: {
          ...init.policy.consent,
          preselectedCategories: ["necessary", "measurement"],
        },
      },
    },
  ])("fails closed for incompatible init profile %#", async (value) => {
    const s = setup();
    s.setInit(value);
    await s.controller.start();
    expect(s.view).toMatchObject({ phase: "unavailable", preferences: denied });
    expect(await s.controller.choose(all, "all", "banner")).toBe(false);
    expect(s.post).toBeUndefined();
  });
  it("keeps a durable restriction in mirror if cookies stop accepting writes", async () => {
    const s = setup();
    await s.controller.start();
    await s.controller.choose(all, "all", "banner");
    s.storage.writeCookie = () => {};
    s.setStatus(500);
    expect(await s.controller.choose(denied, "necessary", "dialog")).toBe(
      false,
    );
    expect(JSON.parse(s.mirror ?? "null").kind).toBe("pending");
    const next = s.make();
    let view: ConsentView | undefined;
    next.subscribe((value) => {
      view = value;
    });
    await next.start();
    expect(view?.preferences).toEqual(denied);
  });
  it("explains failed durable revocation when both stores reject writes", async () => {
    const s = setup();
    await s.controller.start();
    await s.controller.choose(all, "all", "banner");
    s.storage.writeCookie = () => {};
    s.storage.writeMirror = () => {};
    s.setStatus(500);
    expect(await s.controller.choose(denied, "necessary", "dialog")).toBe(
      false,
    );
    expect(s.view?.preferences).toEqual(denied);
    expect(s.view?.error).toContain(
      "po przejściu dalej wcześniejszy wybór może wrócić",
    );
  });
});
