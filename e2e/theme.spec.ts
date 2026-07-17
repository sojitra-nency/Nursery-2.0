import { test, expect } from "@playwright/test";
import { accentVar, hexToRgbString, injectedAccents } from "./utils";

// These assertions expect light mode; pin the context so a dark-OS runner can't flip it.
test.use({ colorScheme: "light" });

test("injects the theme color tokens into <html> (light)", async ({ page }) => {
  await page.goto("/en");

  // The computed token must match whatever the server injected (any preset).
  const { light } = await injectedAccents(page);
  expect(light).toBeTruthy();
  expect(await accentVar(page)).toBe(light);

  // A `bg-accent` utility must resolve to that same color (no FOUC, server-rendered).
  const bg = await page
    .locator(".bg-accent")
    .first()
    .evaluate((el) => getComputedStyle(el).backgroundColor);
  expect(bg).toBe(hexToRgbString(light!));
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
