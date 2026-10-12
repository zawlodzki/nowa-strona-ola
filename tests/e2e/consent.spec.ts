import AxeBuilder from "@axe-core/playwright";
import { expect, test, type BrowserContext, type Page } from "@playwright/test";
import initFixture from "../fixtures/c15t/init.json" with { type: "json" };
import postFixture from "../fixtures/c15t/subjects-post.json" with { type: "json" };
import getFixture from "../fixtures/c15t/subject-get.json" with { type: "json" };

const key = "olesiewicz-consent";
const banner = (page: Page) => page.locator("[data-consent-banner]");
const dialog = (page: Page) =>
  page.getByRole("dialog", { name: "Ustawienia cookies", exact: true });
const denied = { necessary: true, measurement: false, marketing: false };
const all = { necessary: true, measurement: true, marketing: true };

test.beforeEach(async ({ context }) => {
  await context.route("**/*", async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    if (
      request.method() === "POST" ||
      /googletagmanager|google-analytics|clarity\.ms|facebook|flows\.zawlodzki/.test(
        url.hostname,
      )
    ) {
      await route.abort("blockedbyclient");
      return;
    }
    await route.continue();
  });
});

async function backend(context: BrowserContext) {
  const posts: Record<string, unknown>[] = [];
  let initBody: unknown = initFixture;
  let status = 200;
  let held: Promise<void> | undefined;
  let heldRead: Promise<void> | undefined;
  let newest = getFixture.consents[0];
  let subject = postFixture.subjectId;
  let readCount = 0;
  await context.route("**/api/c15t/**", async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    if (url.pathname.endsWith("/init")) {
      await route.fulfill({ json: initBody });
      return;
    }
    if (request.method() === "POST" && url.pathname.endsWith("/subjects")) {
      const parsed: unknown = request.postDataJSON();
      if (
        typeof parsed !== "object" ||
        parsed === null ||
        Array.isArray(parsed)
      )
        throw new Error("Consent POST must be a JSON object");
      const body = Object.fromEntries(Object.entries(parsed));
      posts.push(body);
      const wait = held;
      const responseStatus = status;
      if (wait) await wait;
      if (responseStatus !== 200) {
        await route.fulfill({
          status: responseStatus,
          json: { error: "unavailable" },
        });
        return;
      }
      expect(typeof body.subjectId).toBe("string");
      expect(typeof body.givenAt).toBe("number");
      if (
        typeof body.subjectId !== "string" ||
        typeof body.givenAt !== "number"
      )
        throw new Error("Invalid consent receipt fields");
      subject = body.subjectId;
      const preferences = body.preferences;
      if (
        typeof preferences !== "object" ||
        preferences === null ||
        Array.isArray(preferences)
      )
        throw new Error("Missing consent preferences");
      const choice = Object.fromEntries(Object.entries(preferences));
      newest = {
        ...getFixture.consents[0],
        id: `consent-${posts.length}`,
        givenAt: new Date(body.givenAt).toISOString(),
        preferences: {
          necessary: choice.necessary === true,
          measurement: choice.measurement === true,
          marketing: choice.marketing === true,
        },
      };
      await route.fulfill({
        json: {
          ...postFixture,
          subjectId: subject,
          consentId: newest.id,
          domain: url.hostname,
          appliedPreferences: newest.preferences,
          uiSource: body.uiSource,
          givenAt: newest.givenAt,
        },
      });
      return;
    }
    if (request.method() === "GET" && url.pathname.includes("/subjects/")) {
      readCount++;
      if (heldRead) await heldRead;
      await route.fulfill({
        json: {
          ...getFixture,
          subject: { ...getFixture.subject, id: subject },
          consents: [newest],
        },
      });
      return;
    }
    await route.abort("blockedbyclient");
  });
  return {
    posts,
    holdRead(value: Promise<void> | undefined) {
      heldRead = value;
    },
    get readCount() {
      return readCount;
    },
    fail(value: number) {
      status = value;
    },
    policy(value: unknown) {
      initBody = value;
    },
    hold(value: Promise<void> | undefined) {
      held = value;
    },
    supersede() {
      newest = { ...newest, id: "newest-server-record" };
    },
  };
}

async function saved(page: Page) {
  return page.evaluate((storageKey) => {
    const raw = localStorage.getItem(storageKey);
    return raw ? JSON.parse(raw) : null;
  }, key);
}

async function optionalState(
  page: Page,
  choice: { measurement: boolean; marketing: boolean },
) {
  await page
    .getByRole("button", { name: "Ustawienia cookies", exact: true })
    .click();
  await expect(
    dialog(page).getByRole("checkbox", { name: /^Analityczne/ }),
  ).toHaveJSProperty("checked", choice.measurement);
  await expect(
    dialog(page).getByRole("checkbox", { name: /^Marketingowe/ }),
  ).toHaveJSProperty("checked", choice.marketing);
}

test("settings wait for the saved consent to be read after navigation", async ({
  page,
  context,
}) => {
  const api = await backend(context);
  await page.goto("/");
  await banner(page)
    .getByRole("button", { name: "Akceptuję wszystkie", exact: true })
    .click();
  await expect(banner(page)).not.toBeVisible();
  let release!: () => void;
  api.holdRead(
    new Promise<void>((resolve) => {
      release = resolve;
    }),
  );
  await page.goto("/o-mnie/");
  const settings = page.getByRole("button", {
    name: "Ustawienia cookies",
    exact: true,
  });
  await expect.poll(() => api.readCount).toBeGreaterThan(0);
  await expect(settings).toBeDisabled();
  release();
  await expect(settings).toBeEnabled();
  await optionalState(page, all);
});

test("custom selection confirms exact private-data-free payload and restores only a current backend receipt", async ({
  page,
  context,
}) => {
  const api = await backend(context);
  await page.goto("/kontakt/?email=private@example.com&topic=PCOS");
  await banner(page)
    .getByRole("button", { name: "Dostosuj", exact: true })
    .click();
  const modal = dialog(page);
  await expect(
    modal.getByRole("checkbox", { name: /^Niezbędne/ }),
  ).toBeChecked();
  await expect(
    modal.getByRole("checkbox", { name: /^Niezbędne/ }),
  ).toBeDisabled();
  await expect(
    modal.getByRole("checkbox", { name: /^Analityczne/ }),
  ).not.toBeChecked();
  await expect(
    modal.getByRole("checkbox", { name: /^Marketingowe/ }),
  ).not.toBeChecked();
  await modal.getByRole("checkbox", { name: /^Analityczne/ }).check();
  await modal
    .getByRole("button", { name: "Zapisuję wybór", exact: true })
    .click();
  await expect(modal).not.toBeVisible();
  expect(api.posts).toHaveLength(1);
  expect(api.posts[0]).toEqual({
    subjectId: expect.stringMatching(/^sub_[1-9A-HJ-NP-Za-km-z]{24}$/),
    domain: "127.0.0.1",
    type: "cookie_banner",
    preferences: { necessary: true, measurement: true, marketing: false },
    consentAction: "custom",
    uiSource: "dialog",
    givenAt: expect.any(Number),
    policySnapshotToken: "signed-fixture-token",
  });
  expect(JSON.stringify(api.posts)).not.toMatch(
    /private@example|PCOS|client_id|page_url|email/,
  );
  await expect
    .poll(() => saved(page))
    .toMatchObject({
      kind: "receipt",
      preferences: { necessary: true, measurement: true, marketing: false },
    });
  await page.reload();
  await expect(page.locator("[data-consent-panel]")).toHaveAttribute(
    "aria-busy",
    "false",
  );
  expect(api.readCount).toBeGreaterThan(0);
  await optionalState(page, { measurement: true, marketing: false });
  await page.keyboard.press("Escape");
  api.supersede();
  await page.reload();
  await expect(banner(page)).toBeVisible();
  await optionalState(page, denied);
});

test("reject optional records refusal and persists it across navigation", async ({
  page,
  context,
}) => {
  const api = await backend(context);
  await page.goto("/");
  await banner(page)
    .getByRole("button", { name: "Odrzucam opcjonalne", exact: true })
    .click();
  await expect(banner(page)).not.toBeVisible();
  expect(api.posts[0]).toMatchObject({
    preferences: denied,
    consentAction: "necessary",
    uiSource: "banner",
  });
  await page
    .getByRole("navigation", { name: "Nawigacja główna", exact: true })
    .getByRole("link", { name: "O mnie", exact: true })
    .click();
  await expect(page.locator("[data-consent-panel]")).toHaveAttribute(
    "aria-busy",
    "false",
  );
  await expect(banner(page)).not.toBeVisible();
  await optionalState(page, denied);
});

test("Escape closes customization without consent and restores native trigger focus", async ({
  page,
  context,
}) => {
  const api = await backend(context);
  await page.goto("/");
  const trigger = banner(page).getByRole("button", {
    name: "Dostosuj",
    exact: true,
  });
  await trigger.focus();
  await page.keyboard.press("Enter");
  await expect(dialog(page)).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(dialog(page)).not.toBeVisible();
  await expect(trigger).toBeFocused();
  expect(api.posts).toEqual([]);
  expect(await saved(page)).toBeNull();
  await banner(page)
    .getByRole("button", { name: "Zamknij bez zmiany zgód", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Ustawienia cookies", exact: true })
    .click();
  await expect(dialog(page)).toBeVisible();
});

test("failed new grant stays unconfirmed and can be retried", async ({
  page,
  context,
}) => {
  const api = await backend(context);
  api.fail(500);
  await page.goto("/");
  await banner(page)
    .getByRole("button", { name: "Akceptuję wszystkie", exact: true })
    .click();
  await expect(banner(page).getByRole("status")).toContainText(
    "Nie udało się zapisać",
  );
  expect(await saved(page)).toBeNull();
  await optionalState(page, denied);
  await page.keyboard.press("Escape");
  api.fail(200);
  await banner(page)
    .getByRole("button", { name: "Akceptuję wszystkie", exact: true })
    .click();
  await expect(banner(page)).not.toBeVisible();
  expect(await saved(page)).toMatchObject({
    kind: "receipt",
    preferences: all,
  });
});

test("pending grant does not activate checkboxes before backend confirmation", async ({
  page,
  context,
}) => {
  const api = await backend(context);
  let release = () => {};
  api.hold(
    new Promise<void>((done) => {
      release = done;
    }),
  );
  await page.goto("/");
  await banner(page)
    .getByRole("button", { name: "Akceptuję wszystkie", exact: true })
    .click();
  await expect(banner(page).getByRole("status")).toHaveText(
    "Zapisywanie ustawień cookies…",
  );
  await expect.poll(() => api.posts.length).toBe(1);
  expect(await saved(page)).toBeNull();
  await banner(page)
    .getByRole("button", { name: "Dostosuj", exact: true })
    .click();
  await expect(
    dialog(page).getByRole("checkbox", { name: /^Analityczne/ }),
  ).not.toBeChecked();
  release();
  await expect(banner(page)).not.toBeVisible();
  await expect.poll(() => saved(page)).toMatchObject({ preferences: all });
});

test("offline revocation immediately persists denied pending state in both tabs and after reload", async ({
  page,
  context,
}) => {
  const api = await backend(context);
  await page.goto("/");
  await banner(page)
    .getByRole("button", { name: "Akceptuję wszystkie", exact: true })
    .click();
  await expect(banner(page)).not.toBeVisible();
  const second = await context.newPage();
  await second.goto("/o-mnie/");
  await optionalState(second, all);
  await second.keyboard.press("Escape");
  api.fail(500);
  await optionalState(page, all);
  await dialog(page)
    .getByRole("button", { name: "Odrzucam opcjonalne", exact: true })
    .click();
  await expect(dialog(page).getByRole("status")).toContainText(
    "Nie udało się zapisać",
  );
  await expect
    .poll(() => saved(page))
    .toMatchObject({ kind: "pending", preferences: denied });
  await optionalState(second, denied);
  await second.keyboard.press("Escape");
  await second.reload();
  await expect(banner(second)).toBeVisible();
  await optionalState(second, denied);
});

test("late grant cannot replace a newer refusal made in another tab", async ({
  page,
  context,
}) => {
  const api = await backend(context);
  let release = () => {};
  api.hold(
    new Promise<void>((done) => {
      release = done;
    }),
  );
  await page.goto("/");
  await banner(page)
    .getByRole("button", { name: "Akceptuję wszystkie", exact: true })
    .click();
  await expect.poll(() => api.posts.length).toBe(1);
  const second = await context.newPage();
  await second.goto("/o-mnie/");
  api.hold(undefined);
  await banner(second)
    .getByRole("button", { name: "Odrzucam opcjonalne", exact: true })
    .click();
  await expect(banner(second)).not.toBeVisible();
  await expect
    .poll(() => saved(page))
    .toMatchObject({ kind: "receipt", preferences: denied });
  release();
  await expect(page.locator("[data-consent-panel]")).toHaveAttribute(
    "aria-busy",
    "false",
  );
  expect(await saved(page)).toMatchObject({ preferences: denied });
  await optionalState(page, denied);
  await optionalState(second, denied);
});

test("unexpected shared-instance policy fails closed instead of collecting the wrong profile", async ({
  page,
  context,
}) => {
  const api = await backend(context);
  api.policy({
    ...initFixture,
    policy: { ...initFixture.policy, id: "zawlodzki_global_opt_in_v2" },
  });
  await page.goto("/");
  await expect(banner(page).getByRole("status")).toContainText(
    "Nie udało się zapisać",
  );
  await banner(page)
    .getByRole("button", { name: "Akceptuję wszystkie", exact: true })
    .click();
  await expect(banner(page).getByRole("status")).toContainText(
    "Nie udało się zapisać",
  );
  expect(api.posts).toEqual([]);
  await optionalState(page, denied);
});

for (const path of ["/", "/konsultacje/", "/ebooki/suplementy-w-pcos/"]) {
  test(`confirmed acceptance loads no trackers on excluded health page ${path}`, async ({
    page,
    context,
  }) => {
    await backend(context);
    const trackers: string[] = [];
    page.on("request", (request) => {
      if (
        /googletagmanager|google-analytics|clarity\.ms|facebook/.test(
          request.url(),
        )
      )
        trackers.push(request.url());
    });
    await page.goto(path);
    await banner(page)
      .getByRole("button", { name: "Akceptuję wszystkie", exact: true })
      .click();
    await expect(banner(page)).not.toBeVisible();
    expect(await saved(page)).toMatchObject({ preferences: all });
    expect(trackers).toEqual([]);
    await expect(
      page.locator(
        'script[src*="googletagmanager"], iframe[src*="googletagmanager"]',
      ),
    ).toHaveCount(0);
    const latestConsent = await page.evaluate(() => {
      const layer: unknown = Reflect.get(window, "dataLayer");
      if (!Array.isArray(layer)) return null;
      return layer
        .filter((entry) => typeof entry === "object" && entry !== null)
        .map((entry) => Object.fromEntries(Object.entries(entry)))
        .filter((entry) => entry[0] === "consent" && entry[1] === "update")
        .at(-1)?.[2];
    });
    expect(latestConsent).toMatchObject({
      analytics_storage: "denied",
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
    });
  });
}

for (const colorScheme of ["light", "dark"] satisfies ("light" | "dark")[]) {
  test(`320px ${colorScheme} reduced-motion dialog supports keyboard, zoom and accessible labels`, async ({
    page,
    context,
  }) => {
    await backend(context);
    await page.setViewportSize({ width: 320, height: 800 });
    await page.emulateMedia({ colorScheme, reducedMotion: "reduce" });
    await page.goto("/");
    await expect(banner(page)).toBeVisible();
    expect(
      (
        await new AxeBuilder({ page })
          .include("[data-consent-banner]")
          .analyze()
      ).violations,
    ).toEqual([]);
    const trigger = banner(page).getByRole("button", {
      name: "Dostosuj",
      exact: true,
    });
    await trigger.focus();
    await page.keyboard.press("Enter");
    await expect(dialog(page)).toBeVisible();
    const measurement = dialog(page).getByRole("checkbox", {
      name: /^Analityczne/,
    });
    await measurement.focus();
    await page.keyboard.press("Space");
    await expect(measurement).toBeChecked();
    expect(
      (await new AxeBuilder({ page }).include("#ao-consent-dialog").analyze())
        .violations,
    ).toEqual([]);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.evaluate(() => {
      document.documentElement.style.zoom = "2";
    });
    await expect(
      dialog(page).getByRole("button", { name: "Zapisuję wybór", exact: true }),
    ).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.keyboard.press("Escape");
    await expect(trigger).toBeFocused();
  });
}

for (const [path, code] of [
  ["/", "home"],
  ["/o-mnie/", "about"],
  ["/blog/", "blog-index"],
  ["/ebooki/", "ebook-index"],
  ["/ebooki/suplementy-w-pcos/", "ebook-detail"],
  ["/kontakt/", null],
  ["/konsultacje/", null],
  ["/odstapienie/", null],
  ["/polityka-prywatnosci/", null],
] as const) {
  test(`GTM rollout: server policy ${path}`, async ({ page, context }) => {
    await backend(context);
    await page.goto(path);
    const policy = page.locator('meta[name="ao-tracking-policy"]');
    if (code === null) {
      await expect(policy).toHaveCount(0);
      await banner(page)
        .getByRole("button", { name: "Akceptuję wszystkie", exact: true })
        .click();
      await expect(banner(page)).not.toBeVisible();
      await expect(page.locator('script[src*="googletagmanager"]')).toHaveCount(
        0,
      );
      const consent = await page.evaluate(() => {
        const layer: unknown = Reflect.get(window, "dataLayer");
        if (!Array.isArray(layer)) return null;
        return layer
          .filter(
            (entry) => entry && entry[0] === "consent" && entry[1] === "update",
          )
          .at(-1)?.[2];
      });
      expect(consent).toMatchObject({
        analytics_storage: "denied",
        ad_storage: "denied",
      });
    } else await expect(policy).toHaveAttribute("data-page-code", code);
  });
}

test("GTM rollout: consent gates one loader, late analytics and withdrawal cleanup", async ({
  page,
  context,
}) => {
  test.skip(
    process.env.E2E_GTM_ENABLED !== "true",
    "Requires the separate PUBLIC_GTM_ENABLED=true build; all vendor requests are mocked.",
  );
  await backend(context);
  const requests: string[] = [];
  await context.route(
    "https://www.googletagmanager.com/gtm.js**",
    async (route) => {
      requests.push(route.request().url());
      await route.fulfill({
        contentType: "application/javascript",
        body: "/* mocked vendor: no telemetry */",
      });
    },
  );
  await page.goto("/?email=private@example.com#sensitive");
  expect(requests).toEqual([]);
  await banner(page)
    .getByRole("button", { name: "Dostosuj", exact: true })
    .click();
  await dialog(page)
    .getByRole("checkbox", { name: /^Marketingowe/ })
    .check();
  await dialog(page)
    .getByRole("button", { name: "Zapisuję wybór", exact: true })
    .click();
  await expect.poll(() => requests.length).toBe(1);
  const events = () =>
    page.evaluate(() => {
      const layer: unknown = Reflect.get(window, "dataLayer");
      if (!Array.isArray(layer)) return [];
      return layer.filter(
        (entry) =>
          entry !== null && typeof entry === "object" && "event" in entry,
      );
    });
  expect(await events()).not.toContainEqual({
    event: "ao_page_view",
    ao_page_code: "home",
  });
  await page
    .getByRole("button", { name: "Ustawienia cookies", exact: true })
    .click();
  await dialog(page)
    .getByRole("checkbox", { name: /^Analityczne/ })
    .check();
  await dialog(page)
    .getByRole("button", { name: "Zapisuję wybór", exact: true })
    .click();
  await expect
    .poll(async () =>
      (await events()).filter((entry) => entry.event === "ao_page_view"),
    )
    .toEqual([{ event: "ao_page_view", ao_page_code: "home" }]);
  expect(requests).toHaveLength(1);
  expect(JSON.stringify(await events())).not.toMatch(
    /private|example\.com|sensitive|email|page_location|page_title|referrer/,
  );
  await page.evaluate(() => {
    document.cookie = "_ga=test; Path=/";
    document.cookie = "_fbp=test; Path=/";
    localStorage.setItem("_cltk", "test");
    localStorage.setItem("theme-proof", "keep");
  });
  await page
    .getByRole("button", { name: "Ustawienia cookies", exact: true })
    .click();
  await dialog(page)
    .getByRole("checkbox", { name: /^Analityczne/ })
    .uncheck();
  await dialog(page)
    .getByRole("checkbox", { name: /^Marketingowe/ })
    .uncheck();
  await Promise.all([
    page.waitForEvent("load"),
    dialog(page)
      .getByRole("button", { name: "Zapisuję wybór", exact: true })
      .click(),
  ]);
  expect(requests).toHaveLength(1);
  expect(
    await page.evaluate(() => ({
      cookie: document.cookie,
      clarity: localStorage.getItem("_cltk"),
      other: localStorage.getItem("theme-proof"),
    })),
  ).toEqual({
    cookie: expect.not.stringMatching(/_ga=|_fbp=/),
    clarity: null,
    other: "keep",
  });
  await expect(page.locator('script[src*="googletagmanager"]')).toHaveCount(0);
});

for (const blocked of [false, true]) {
  test(`GTM rollout: withdrawal waits for durable partial consent (blocked storage: ${blocked})`, async ({
    page,
    context,
  }) => {
    test.skip(
      process.env.E2E_GTM_ENABLED !== "true",
      "Requires enabled GTM build; vendor requests stay mocked.",
    );
    const api = await backend(context);
    const requests: string[] = [];
    await context.route(
      "https://www.googletagmanager.com/gtm.js**",
      async (route) => {
        requests.push(route.request().url());
        await route.fulfill({
          contentType: "application/javascript",
          body: "/* no telemetry */",
        });
      },
    );
    await page.goto("/");
    await banner(page)
      .getByRole("button", { name: "Akceptuję wszystkie", exact: true })
      .click();
    await expect.poll(() => requests.length).toBe(1);
    await expect(banner(page)).not.toBeVisible();
    let navigations = 0;
    page.on("framenavigated", (frame) => {
      if (frame === page.mainFrame()) navigations++;
    });
    if (blocked) {
      await page.evaluate((storageKey) => {
        const descriptor = Object.getOwnPropertyDescriptor(
          Document.prototype,
          "cookie",
        );
        if (!descriptor?.get || !descriptor.set)
          throw new Error("Missing cookie descriptor");
        const getter = descriptor.get;
        const setter = descriptor.set;
        Object.defineProperty(document, "cookie", {
          get() {
            return Reflect.apply(getter, document, []);
          },
          set(value: string) {
            if (!value.startsWith(`${storageKey}=`))
              Reflect.apply(setter, document, [value]);
          },
        });
        const setItem = Storage.prototype.setItem;
        Storage.prototype.setItem = function (name, value) {
          if (name !== storageKey) Reflect.apply(setItem, this, [name, value]);
        };
      }, key);
    }
    let release = () => {};
    api.hold(
      new Promise<void>((resolve) => {
        release = resolve;
      }),
    );
    await optionalState(page, all);
    await dialog(page)
      .getByRole("checkbox", { name: /^Marketingowe/ })
      .uncheck();
    await dialog(page)
      .getByRole("button", { name: "Zapisuję wybór", exact: true })
      .click();
    await expect.poll(() => api.posts.length).toBe(2);
    expect(api.posts[1].preferences).toEqual({ ...all, marketing: false });
    expect(
      await page.evaluate(() => Reflect.get(window, "ga-disable-G-9QW05JYZTL")),
    ).toBe(true);
    expect(navigations).toBe(0);
    if (blocked) {
      release();
      await expect(dialog(page).getByRole("status")).toContainText(
        "Przeglądarka blokuje trwały zapis",
      );
      expect(navigations).toBe(0);
      expect(requests).toHaveLength(1);
      expect(
        await page.evaluate(() =>
          Reflect.get(window, "ga-disable-G-9QW05JYZTL"),
        ),
      ).toBe(true);
    } else {
      await Promise.all([
        page.waitForEvent("load"),
        Promise.resolve().then(release),
      ]);
      await expect.poll(() => requests.length).toBe(2);
      expect(navigations).toBe(1);
      expect(await saved(page)).toMatchObject({
        kind: "receipt",
        preferences: { ...all, marketing: false },
      });
      await optionalState(page, { ...all, marketing: false });
    }
  });
}
