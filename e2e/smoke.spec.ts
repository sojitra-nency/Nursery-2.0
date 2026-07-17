import { test, expect } from "@playwright/test";

test("redirects / to /en", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/en/);
});

test("locale switcher navigates to Hindi", async ({ page }) => {
  await page.goto("/en");
  // On small screens the locale switcher lives inside the mobile menu.
  const menuButton = page.getByRole("button", { name: "Open menu" });
  if (await menuButton.isVisible()) await menuButton.click();
  await page.getByText("हिन्दी").filter({ visible: true }).click();
  await expect(page).toHaveURL(/\/hi/);
});
