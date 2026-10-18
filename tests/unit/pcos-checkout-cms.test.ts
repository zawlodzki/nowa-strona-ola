import { describe, expect, it } from "vitest";
import { mapEbook } from "../../src/content/map-ebook";
import {
  mapPcosCheckoutSettings,
  pcosCheckoutSettingsFixture,
} from "../../src/content/pcos-checkout-settings";
import { PCOS_PRODUCTS } from "../../src/lib/checkout-products";
import { getEbook, getPcosCheckoutSettings } from "../../src/sanity/repository";

describe("PCOS checkout content", () => {
  it("keeps sales paused and offers the two missing ebooks only as a pair", async () => {
    const settings = await getPcosCheckoutSettings({ environment: {} });
    expect(settings.salesState).toBe("paused");
    expect(settings.singlePriceGross).toBe(97);
    expect(settings.pairPriceGross).toBe(97);
    expect(settings.bundleOnlyNotice).toContain(
      "wyłącznie zakup obu pozostałych e-booków razem",
    );
    expect(settings.continueLabel).toBe("Zamawiam z obowiązkiem zapłaty");
  });

  it("rejects unsupported prices instead of displaying different checkout amounts", () => {
    expect(() =>
      mapPcosCheckoutSettings({
        ...pcosCheckoutSettingsFixture,
        pairPriceGross: 48.5,
      }),
    ).toThrow("97 zł za parę");
  });

  it.each(PCOS_PRODUCTS)(
    "links $code to its own internal order when available",
    async ({ code, slug }) => {
      const ebook = structuredClone(
        await getEbook("pl", slug, { environment: {} }),
      );
      const planned = mapEbook(ebook, "pl");
      expect(planned.productCode).toBe(code);
      expect(planned.checkoutUrl).toBeUndefined();
      ebook.availability = "available";
      expect(mapEbook(ebook, "pl").checkoutUrl).toBe(
        `/zamowienie/?produkt=${code}`,
      );
    },
  );

  it("rejects a payment code attached to a different ebook", async () => {
    const ebook = structuredClone(
      await getEbook("pl", "suplementy-w-pcos", { environment: {} }),
    );
    ebook.productCode = "ebook-02";
    expect(() => mapEbook(ebook, "pl")).toThrow("nie odpowiada e-bookowi");
  });
});
