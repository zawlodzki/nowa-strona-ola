import { expect, test } from "@playwright/test";

test.use({ javaScriptEnabled: false });

test("article remains readable without JavaScript and does not POST", async ({
  page,
}) => {
  const posts: string[] = [];
  page.on("request", (request) => {
    if (request.method() === "POST") posts.push(request.url());
  });
  await page.goto("/blog/przygotowanie-do-konsultacji-pcos/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(
    page.getByRole("navigation", { name: "W tym artykule" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Udostępnij", exact: true }),
  ).toBeDisabled();
  await expect(page.locator(".article-recommendations")).toBeVisible();
  await expect(page.locator("#faq")).toBeVisible();
  await expect(page.locator("#newsletter")).toBeVisible();
  const form = page.locator("#newsletter form");
  await expect(form).not.toHaveAttribute("method", "post");
  await expect(form.locator('button[type="submit"]')).toBeDisabled();
  expect(posts).toEqual([]);
});
