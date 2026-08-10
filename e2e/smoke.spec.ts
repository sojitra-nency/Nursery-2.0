import { test, expect } from "@playwright/test";

test("/ serves the language chooser", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Choose your language" })).toBeVisible();
});

test("a locale page renders its nav in that language", async ({ page }) => {
  await page.goto("/hi");
  await expect(page).toHaveURL(/\/hi/);
  // "कैटलॉग" — proves the dictionary resolved, not just that the URL changed.
  await expect(page.getByRole("link", { name: "कैटलॉग" }).first()).toBeVisible();
});
