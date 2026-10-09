import { expect, test, type Locator, type Page } from "@playwright/test";

// Arrow presses must land on a card's snap point by themselves. iOS Safari
// does not re-snap programmatic scrolls, so one variant switches snap off.
async function settle(track: Locator) {
  let last = Number.NaN;
  let stable = 0;
  for (let i = 0; i < 80 && stable < 4; i++) {
    await track.page().waitForTimeout(50);
    const value = await track.evaluate((el) => el.scrollLeft);
    stable = Math.abs(value - last) < 0.5 ? stable + 1 : 0;
    last = value;
  }
}

async function alignment(track: Locator) {
  return track.evaluate((el) => {
    const port = el.getBoundingClientRect();
    const left = port.left + el.clientLeft;
    const right = left + el.clientWidth;
    const cards = [...el.children].map((card) => card.getBoundingClientRect());
    const firstFull = cards.findIndex(
      (card) => card.left >= left - 1 && card.right <= right + 1,
    );
    const atEnd = el.scrollLeft >= el.scrollWidth - el.clientWidth - 1;
    return {
      firstFull,
      offset: firstFull < 0 ? Number.NaN : cards[firstFull].left - left,
      cut: cards.some(
        (card, index) => index < firstFull && card.right > left + 1 && !atEnd,
      ),
      atEnd,
      lastFull:
        cards.at(-1)!.left >= left - 1 && cards.at(-1)!.right <= right + 1,
      count: cards.length,
    };
  });
}

async function openReviews(page: Page, width: number, snap: boolean) {
  await page.setViewportSize({ width, height: 844 });
  await page.goto("/");
  if (!snap)
    await page.addStyleTag({
      content: ".ao-carousel__track{scroll-snap-type:none!important}",
    });
  await page.evaluate(() => document.fonts.ready);
  const track = page.locator("#reviews-track");
  const carousel = page.locator("[data-carousel]", { has: track });
  await track.scrollIntoViewIfNeeded();
  return {
    track,
    next: carousel.locator('button[data-direction="1"]'),
    prev: carousel.locator('button[data-direction="-1"]'),
  };
}

for (const width of [390, 1440]) {
  for (const snap of [true, false]) {
    test(`review arrows land on whole cards at ${width}px${snap ? "" : " without scroll snap"}`, async ({
      page,
    }) => {
      await page.emulateMedia({
        reducedMotion: snap ? "no-preference" : "reduce",
      });
      const { track, next, prev } = await openReviews(page, width, snap);
      await expect(prev).toBeDisabled();
      const start = await alignment(track);
      expect(start.firstFull).toBe(0);

      let presses = 0;
      let lastFirst = 0;
      while (!(await next.isDisabled()) && presses < 10) {
        await next.click();
        await settle(track);
        presses += 1;
        const state = await alignment(track);
        if (state.atEnd) {
          expect(state.lastFull).toBe(true);
        } else {
          expect(state.firstFull).toBeGreaterThan(lastFirst);
          expect(Math.abs(state.offset)).toBeLessThanOrEqual(1);
          expect(state.cut).toBe(false);
          lastFirst = state.firstFull;
        }
      }
      expect(presses).toBeGreaterThan(0);
      await expect(next).toBeDisabled();
      expect((await alignment(track)).atEnd).toBe(true);

      let back = 0;
      while (!(await prev.isDisabled()) && back < 10) {
        await prev.click();
        await settle(track);
        back += 1;
        const state = await alignment(track);
        expect(Math.abs(state.offset)).toBeLessThanOrEqual(1);
        expect(state.cut).toBe(false);
      }
      expect(back).toBe(presses);
      await expect(prev).toBeDisabled();
      expect((await alignment(track)).firstFull).toBe(0);
    });
  }
}

test("book group links scroll the first card of a topic into place", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.addStyleTag({
    content: ".ao-carousel__track{scroll-snap-type:none!important}",
  });
  const track = page.locator(".ao-carousel__track--3").first();
  for (const group of ["perimenopause", "pcos"]) {
    await page
      .locator(`.ao-carousel__toolbar [data-book-group="${group}"]`)
      .click();
    await settle(track);
    const offset = await track.evaluate((el, name) => {
      const card = [...el.children].find(
        (child) => (child as HTMLElement).dataset.bookGroup === name,
      )!;
      return (
        card.getBoundingClientRect().left -
        el.getBoundingClientRect().left -
        el.clientLeft
      );
    }, group);
    expect(Math.abs(offset)).toBeLessThanOrEqual(1);
  }
});
