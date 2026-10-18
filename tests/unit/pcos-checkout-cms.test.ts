import { describe, expect, it } from "vitest";
import { mapEbook } from "../../src/content/map-ebook";
import {
  mapPcosCheckoutSettings,
  pcosCheckoutSettingsFixture,
} from "../../src/content/pcos-checkout-settings";
import {
  parseCheckoutCatalog,
  PCOS_PRODUCTS,
} from "../../src/lib/checkout-products";
import { getEbook, getPcosCheckoutSettings } from "../../src/sanity/repository";

describe("PCOS checkout content", () => {
  it("keeps sales paused and offers the two missing ebooks only as a pair", async () => {
    const settings = await getPcosCheckoutSettings({ environment: {} });
    expect(settings.salesState).toBe("paused");
    expect(settings.singlePriceGross).toBe(97);
    expect(settings.pairPriceGross).toBe(97);
    expect(settings.bundleOnlyNotice).toBe(
      "Pakiet obejmuje oba pozostałe e-booki. To osobne zamówienie.",
    );
    expect(settings.bundleReference).toBe(
      "97 zł zamiast 194 zł za zakup osobno.",
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

  it("accepts a stable payment code for a new series", async () => {
    const ebook = structuredClone(
      await getEbook("pl", "czy-to-juz", { environment: {} }),
    );
    ebook.productCode = "perimenopause-start";
    expect(mapEbook(ebook, "pl").productCode).toBe("perimenopause-start");
    ebook.productCode = "Wrong code!";
    expect(() => mapEbook(ebook, "pl")).toThrow("nieznany kod");
  });
});

describe("checkout catalog boundary", () => {
  const products = ["01", "02", "03"].map((suffix) => ({
    productCode: `ebook-${suffix}`,
    title: `E-book ${suffix}`,
    stripePriceId: `price_${suffix}`,
    priceGross: 97,
    availability: "planned",
  }));
  function catalog() {
    return products.map((item) => ({
      ...item,
      crossSell: {
        products: products.filter(
          (other) => other.productCode !== item.productCode,
        ),
        kicker: "Pakiet",
        title: "Uzupełnij serię",
        lead: "Dwa poradniki za 97 zł.",
        stripeCouponId: "coupon_pair",
      },
    }));
  }
  it("resolves the configured complementary pair and its own copy", () => {
    const parsed = parseCheckoutCatalog(catalog());
    expect(
      parsed[0]?.crossSell?.products.map((item) => item.productCode),
    ).toEqual(["ebook-02", "ebook-03"]);
    expect(parsed[0]?.crossSell?.stripeCouponId).toBe("coupon_pair");
    expect(parsed[0]?.availability).toBe("planned");
  });
  it("excludes products without Stripe setup", () => {
    expect(
      parseCheckoutCatalog([
        ...catalog(),
        { productCode: "ebook-04", stripePriceId: null },
      ]),
    ).toHaveLength(3);
  });
  it("rejects a duplicate, missing product, unsupported price, and missing coupon", () => {
    const duplicate = catalog();
    duplicate[0]!.crossSell.products = [products[1]!, products[1]!];
    expect(() => parseCheckoutCatalog(duplicate)).toThrow("różnych");
    expect(() => parseCheckoutCatalog(catalog().slice(0, 2))).toThrow(
      "spoza katalogu",
    );
    const wrongPrice = catalog();
    wrongPrice[0]!.priceGross = 48.5;
    expect(() => parseCheckoutCatalog(wrongPrice)).toThrow("konfiguracja ceny");
    const coupon = catalog();
    coupon[0]!.crossSell.stripeCouponId = "";
    expect(() => parseCheckoutCatalog(coupon)).toThrow("stripeCouponId");
  });
});
