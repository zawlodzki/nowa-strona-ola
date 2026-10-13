import { afterEach, expect, it, vi } from "vitest";
import { clearMeasurementStorage } from "../../src/lib/analytics";

afterEach(() => vi.unstubAllGlobals());
it("removes only vendor identifiers, preserving consent, theme and unrelated storage", () => {
  const deleted: string[] = [];
  vi.stubGlobal("document", {
    get cookie() {
      return "_ga=x; _ga_TEST=x; _gid=x; _gat=x; _fbp=x; _fbc=x; _clck=x; _clsk=x; olesiewicz-consent=receipt; theme=dark; other=keep";
    },
    set cookie(value: string) {
      deleted.push(value);
    },
  });
  const local = vi.fn();
  const session = vi.fn();
  vi.stubGlobal("window", {
    location: { hostname: "www.example.com", protocol: "https:" },
    localStorage: { removeItem: local },
    sessionStorage: { removeItem: session },
  });
  clearMeasurementStorage();
  expect([...new Set(deleted.map((entry) => entry.split("=")[0]))]).toEqual([
    "_ga",
    "_ga_TEST",
    "_gid",
    "_gat",
    "_fbp",
    "_fbc",
    "_clck",
    "_clsk",
  ]);
  expect(deleted).toContain(
    "_ga=; Path=/; Max-Age=0; SameSite=Lax; Domain=example.com; Secure",
  );
  expect(local.mock.calls).toEqual([["_cltk"]]);
  expect(session.mock.calls).toEqual([["_cltk"]]);
});
it("does not block shutdown when access to browser storage throws", () => {
  vi.stubGlobal("document", { cookie: "" });
  vi.stubGlobal("window", {
    location: { hostname: "localhost", protocol: "http:" },
    get localStorage() {
      throw new Error("Blocked");
    },
    get sessionStorage() {
      throw new Error("Blocked");
    },
  });
  expect(() => clearMeasurementStorage()).not.toThrow();
});
