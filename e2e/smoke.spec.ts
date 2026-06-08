import { test, expect } from "@playwright/test";

test("redirects / to /en", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/en/);
});

test("locale switcher navigates to Hindi", async ({ page }) => {
  await page.goto("/en");
  await page.getByText("हिन्दी").click();
  await expect(page).toHaveURL(/\/hi/);
});
