import { test, expect } from "@playwright/test";

// The default (Forest Green) preset — what the FALLBACK settings resolve to.
const FOREST_ACCENT_HEX = "#2f7d32";
const FOREST_ACCENT_RGB = "rgb(47, 125, 50)";

// These assertions expect light mode; pin the context so a dark-OS runner can't flip it.
test.use({ colorScheme: "light" });

test("injects the theme color tokens into <html> (light)", async ({ page }) => {
  await page.goto("/en");

  const accentVar = await page.evaluate(() =>
    getComputedStyle(document.documentElement).getPropertyValue("--color-accent").trim()
  );
  expect(accentVar).toBe(FOREST_ACCENT_HEX);

  // A `bg-accent` utility must resolve to that same color (no FOUC, server-rendered).
  const bg = await page
    .locator(".bg-accent")
    .first()
    .evaluate((el) => getComputedStyle(el).backgroundColor);
  expect(bg).toBe(FOREST_ACCENT_RGB);
});

test("reveal content is visible immediately under reduced motion", async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: "reduce" });
  const page = await context.newPage();
  await page.goto("/en");

  const heading = page.locator("h1.reveal").first();
  await expect(heading).toBeVisible();
  const opacity = await heading.evaluate((el) => getComputedStyle(el).opacity);
  expect(opacity).toBe("1");

  await context.close();
});

test("hero reveal becomes visible on load (default motion)", async ({ page }) => {
  await page.goto("/en");
  const heading = page.locator("h1.reveal").first();
  await expect(heading).toHaveClass(/is-visible/, { timeout: 5000 });
});
