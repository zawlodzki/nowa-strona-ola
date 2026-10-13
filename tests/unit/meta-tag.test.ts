import vm from "node:vm";
import { describe, expect, it } from "vitest";
import container from "../../ops/gtm/ola-container.json";

const tag = container.containerVersion.tag.find(
  (entry) => entry.type === "html",
);
const html = tag?.parameter.find((entry) => entry.key === "html")?.value;
if (!html) throw new Error("Missing Meta HTML tag");
const code = html.replace(/^<script>\s*/, "").replace(/\s*<\/script>$/, "");

function runtime(state: string) {
  const scripts: {
    src?: string;
    referrerPolicy?: string;
    onload?: () => void;
  }[] = [];
  const calls: unknown[][] = [];
  const window = { aoTrackingState: state };
  const sandbox = vm.createContext({
    window,
    document: {
      createElement: () => ({}),
      head: {
        appendChild: (script: (typeof scripts)[number]) => scripts.push(script),
      },
    },
  });
  const run = () => vm.runInContext(code, sandbox);
  const ready = () => {
    const pixel: unknown = Reflect.get(window, "fbq");
    if (typeof pixel !== "function") throw new Error("Missing Pixel loader");
    Reflect.set(pixel, "callMethod", (...args: unknown[]) => calls.push(args));
    scripts[0]?.onload?.();
  };
  return { window, scripts, calls, run, ready };
}

describe("exported Meta tag", () => {
  it.each(["inactive", "measurement", "revoked", "unknown"])(
    "does not load or init in %s state, even when GTM replays an old grant",
    (state) => {
      const page = runtime(state);
      page.run();
      expect(page.scripts).toEqual([]);
      expect(page.calls).toEqual([]);
      expect(Reflect.get(page.window, "fbq")).toBeUndefined();
    },
  );

  it.each(["marketing", "all"])(
    "sends exactly one manual PageView after SDK readiness in %s",
    (state) => {
      const page = runtime(state);
      page.run();
      page.run();
      expect(page.scripts).toHaveLength(1);
      expect(page.scripts[0]).toMatchObject({
        src: "https://connect.facebook.net/en_US/fbevents.js",
        referrerPolicy: "no-referrer",
      });
      expect(page.calls).toEqual([]);
      page.ready();
      page.ready();
      page.run();
      expect(page.calls).toEqual([
        ["consent", "grant"],
        ["set", "autoConfig", false, "2915257895296567"],
        ["init", "2915257895296567"],
        ["trackSingle", "2915257895296567", "PageView"],
      ]);
      const pixel: unknown = Reflect.get(page.window, "fbq");
      expect(
        typeof pixel === "function" && Reflect.get(pixel, "disablePushState"),
      ).toBe(true);
    },
  );

  it("never initializes or queues PageView when consent is revoked during SDK download", () => {
    const page = runtime("all");
    page.run();
    Reflect.set(page.window, "aoTrackingState", "revoked");
    page.ready();
    expect(page.calls).toEqual([]);
    expect(Reflect.get(page.window, "aoMetaPageView")).toBe("loading");
  });
});
