import { test, expect } from "@playwright/test";
import { accentVar, dataMode, injectedAccents, isAutoMode } from "./utils";

const FORCED_MODE_SKIP = "CMS forces a fixed dark-mode policy — auto/toggle behavior not active";

test("auto mode follows the OS dark preference before paint (no FOUC)", async ({ browser }) => {
  const context = await browser.newContext({ colorScheme: "dark" });
  const page = await context.newPage();
  await page.goto("/en");
  test.skip(!(await isAutoMode(page)), FORCED_MODE_SKIP);
  // The blocking head script stamps data-mode synchronously, so it's already set.
  expect(await dataMode(page)).toBe("dark");
  const { dark } = await injectedAccents(page);
  expect(dark).toBeTruthy();
  expect(await accentVar(page)).toBe(dark);
  await context.close();
});

test("auto mode follows the OS light preference", async ({ browser }) => {
  const context = await browser.newContext({ colorScheme: "light" });
  const page = await context.newPage();
  await page.goto("/en");
  test.skip(!(await isAutoMode(page)), FORCED_MODE_SKIP);
  expect(await dataMode(page)).toBe("light");
  const { light } = await injectedAccents(page);
  expect(light).toBeTruthy();
  expect(await accentVar(page)).toBe(light);
  await context.close();
});

test("the dark stylesheet rule swaps tokens when data-mode=dark", async ({ browser }) => {
  const context = await browser.newContext({ colorScheme: "light" });
  const page = await context.newPage();
  await page.goto("/en");
  const { light, dark } = await injectedAccents(page);
  expect(light).toBeTruthy();
  expect(dark).toBeTruthy();
  expect(dark).not.toBe(light); // dark map must actually differ
  expect(await accentVar(page)).toBe(light);
  await page.evaluate(() => (document.documentElement.dataset.mode = "dark"));
  expect(await accentVar(page)).toBe(dark);
  await context.close();
});

test("the toggle flips the mode and persists across reload", async ({ browser }) => {
  const context = await browser.newContext({ colorScheme: "light" });
  const page = await context.newPage();
  await page.goto("/en");
  test.skip(!(await isAutoMode(page)), FORCED_MODE_SKIP);
  expect(await dataMode(page)).toBe("light");

  await page.getByRole("button", { name: "Toggle dark mode" }).click();
  expect(await dataMode(page)).toBe("dark");
  expect(await page.evaluate(() => localStorage.getItem("nursery-theme"))).toBe("dark");

  await page.reload();
  // The stored choice survives reload (blocking script reads localStorage first).
  expect(await dataMode(page)).toBe("dark");
  const { dark } = await injectedAccents(page);
  expect(await accentVar(page)).toBe(dark);
  await context.close();
});
