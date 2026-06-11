import { test, expect, type Page } from "@playwright/test";

const FOREST_LIGHT_ACCENT = "#2f7d32";
const FOREST_DARK_ACCENT = "#5fcf66";

const accentVar = (page: Page) =>
  page.evaluate(() =>
    getComputedStyle(document.documentElement).getPropertyValue("--color-accent").trim()
  );
const dataMode = (page: Page) => page.evaluate(() => document.documentElement.dataset.mode ?? null);

test("auto mode follows the OS dark preference before paint (no FOUC)", async ({ browser }) => {
  const context = await browser.newContext({ colorScheme: "dark" });
  const page = await context.newPage();
  await page.goto("/en");
  // The blocking head script stamps data-mode synchronously, so it's already set.
  expect(await dataMode(page)).toBe("dark");
  expect(await accentVar(page)).toBe(FOREST_DARK_ACCENT);
  await context.close();
});

test("auto mode follows the OS light preference", async ({ browser }) => {
  const context = await browser.newContext({ colorScheme: "light" });
  const page = await context.newPage();
  await page.goto("/en");
  expect(await dataMode(page)).toBe("light");
  expect(await accentVar(page)).toBe(FOREST_LIGHT_ACCENT);
  await context.close();
});

test("the dark stylesheet rule swaps tokens when data-mode=dark", async ({ browser }) => {
  const context = await browser.newContext({ colorScheme: "light" });
  const page = await context.newPage();
  await page.goto("/en");
  expect(await accentVar(page)).toBe(FOREST_LIGHT_ACCENT);
  await page.evaluate(() => (document.documentElement.dataset.mode = "dark"));
  expect(await accentVar(page)).toBe(FOREST_DARK_ACCENT);
  await context.close();
});

test("the toggle flips the mode and persists across reload", async ({ browser }) => {
  const context = await browser.newContext({ colorScheme: "light" });
  const page = await context.newPage();
  await page.goto("/en");
  expect(await dataMode(page)).toBe("light");

  await page.getByRole("button", { name: "Toggle dark mode" }).click();
  expect(await dataMode(page)).toBe("dark");
  expect(await page.evaluate(() => localStorage.getItem("nursery-theme"))).toBe("dark");

  await page.reload();
  // The stored choice survives reload (blocking script reads localStorage first).
  expect(await dataMode(page)).toBe("dark");
  expect(await accentVar(page)).toBe(FOREST_DARK_ACCENT);
  await context.close();
});
