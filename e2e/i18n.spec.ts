import { test, expect, type Page } from "@playwright/test";

/**
 * Language selection, persistence and switching — end to end.
 *
 * Every test runs twice, on Desktop Chrome and on a Pixel 7 (see
 * playwright.config.ts), because the whole point of this feature is a
 * mobile-first audience and the two viewports lay the header out differently.
 */

const STORAGE_KEY = "nursery-locale";

const storedLocale = (page: Page) => page.evaluate((key) => localStorage.getItem(key), STORAGE_KEY);

/**
 * Assert an attribute on <html>, waiting for the document that carries it.
 *
 * Deliberately a locator assertion rather than `page.evaluate`: moving between the
 * `(entry)` and `(site)` root layouts is a full document load, and `toHaveURL`
 * resolves as soon as the URL changes — which can be *before* the new document
 * commits, a window in which `document.documentElement` is briefly null. Locator
 * assertions retry against the live DOM and ride out the swap.
 */
const expectHtmlAttr = (page: Page, attr: string, value: string) =>
  expect(page.locator("html")).toHaveAttribute(attr, value);

/**
 * The header control that opens the language dialog.
 *
 * Selected by its ARIA relationship rather than its accessible name — the name is
 * itself translated ("ભાષા: ગુજરાતી. ભાષા બદલો"), so any text-based locator would
 * only ever work on the English pages.
 */
const languageTrigger = (page: Page) => page.locator('header button[aria-haspopup="dialog"]');

test.describe("first visit", () => {
  test("shows the chooser at / instead of redirecting", async ({ page }) => {
    await page.goto("/");

    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole("heading", { name: "Choose your language" })).toBeVisible();
  });

  test("offers all thirteen languages, each named in its own script", async ({ page }) => {
    await page.goto("/");

    const links = page.getByRole("navigation", { name: /choose a language/i }).getByRole("link");
    await expect(links).toHaveCount(13);

    // A sample across scripts — these are the labels a non-English reader acts on.
    for (const native of ["English", "हिन्दी", "বাংলা", "தமிழ்", "اردو", "ଓଡ଼ିଆ"]) {
      await expect(page.getByRole("link", { name: new RegExp(native) })).toBeVisible();
    }
  });

  test("works without JavaScript — the cards are real links", async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto("/");

    await expect(page.getByRole("link", { name: /தமிழ்/ })).toHaveAttribute("href", "/ta");
    await context.close();
  });
});

test.describe("choosing a language", () => {
  test("navigates to the locale and remembers the choice", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /தமிழ்/ }).click();

    // Assert on the document first — this waits for the new one to commit, which
    // makes the URL and localStorage reads below safe.
    await expectHtmlAttr(page, "lang", "ta");
    await expect(page).toHaveURL(/\/ta$/);
    expect(await storedLocale(page)).toBe("ta");

    // The nav is genuinely in Tamil, not English with a Tamil URL.
    await expect(page.getByRole("link", { name: "பட்டியல்" }).first()).toBeVisible();
  });

  test("sends a returning visitor straight past the chooser", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /বাংলা/ }).click();
    await expect(page).toHaveURL(/\/bn$/);

    // Second visit to the root: the blocking script restores the saved language.
    await page.goto("/");
    await expect(page).toHaveURL(/\/bn$/);
  });

  test("still shows the chooser when asked for explicitly", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /मराठी/ }).click();
    await expect(page).toHaveURL(/\/mr$/);

    // `?change=1` is the escape hatch the header link uses.
    await page.goto("/?change=1");
    await expect(page.getByRole("heading", { name: "Choose your language" })).toBeVisible();
  });

  test("never gates a deep link", async ({ page }) => {
    // A WhatsApp-shared plant link must open the plant, not a language screen.
    await page.goto("/ml/catalog");
    await expect(page).toHaveURL(/\/ml\/catalog/);
    await expectHtmlAttr(page, "lang", "ml");
  });
});

test.describe("changing language later", () => {
  test("opens the dialog and switches in place", async ({ page }) => {
    await page.goto("/en/catalog");

    await languageTrigger(page).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();

    await dialog.getByRole("link", { name: /ಕನ್ನಡ/ }).click();

    // Same page, new language — not bounced to the home page.
    await expect(page).toHaveURL(/\/kn\/catalog/);
    expect(await storedLocale(page)).toBe("kn");
  });

  test("marks the current language and keeps the choice after reload", async ({ page }) => {
    await page.goto("/gu");
    await languageTrigger(page).click();

    const current = page.getByRole("dialog").getByRole("link", { name: /ગુજરાતી/ });
    await expect(current).toHaveAttribute("aria-current", "true");

    await page.reload();
    await expectHtmlAttr(page, "lang", "gu");
  });

  test("closes on Escape and returns focus to the trigger", async ({ page }) => {
    await page.goto("/en");

    const trigger = languageTrigger(page);
    await trigger.click();
    await expect(page.getByRole("dialog")).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toBeHidden();
    await expect(trigger).toBeFocused();
  });

  test("the trigger meets the 44px touch-target floor", async ({ page }) => {
    await page.goto("/en");

    const box = await languageTrigger(page).boundingBox();
    expect(box).not.toBeNull();
    expect(box!.height).toBeGreaterThanOrEqual(44);
  });
});

test.describe("per-locale document setup", () => {
  test("Urdu renders right-to-left", async ({ page }) => {
    await page.goto("/ur");

    await expectHtmlAttr(page, "dir", "rtl");
    await expectHtmlAttr(page, "data-script", "arabic");
  });

  test("Indic locales stay left-to-right with the right script font", async ({ page }) => {
    for (const [locale, script] of [
      ["hi", "devanagari"],
      ["ta", "tamil"],
      ["pa", "gurmukhi"],
    ] as const) {
      await page.goto(`/${locale}`);
      await expectHtmlAttr(page, "dir", "ltr");
      await expectHtmlAttr(page, "data-script", script);

      // `--font-script` is what makes Indic text render in Noto rather than an
      // arbitrary OS fallback.
      const family = await page.evaluate(() =>
        getComputedStyle(document.documentElement).getPropertyValue("--font-script").trim()
      );
      expect(family).toMatch(/Noto/i);
    }
  });

  test("advertises every language plus x-default to search engines", async ({ page }) => {
    await page.goto("/en");

    const hreflangs = await page.evaluate(() =>
      Array.from(document.querySelectorAll('link[rel="alternate"]')).map((el) =>
        el.getAttribute("hreflang")
      )
    );
    expect(hreflangs).toContain("x-default");
    for (const locale of ["en", "hi", "ta", "ur", "as"]) {
      expect(hreflangs).toContain(locale);
    }
  });
});

test.describe("layout resilience", () => {
  test("no locale causes horizontal overflow on a phone", async ({ page }) => {
    // Translations run far longer than their English source; the failure mode is a
    // page the user can scroll sideways.
    await page.setViewportSize({ width: 360, height: 740 });

    for (const locale of ["en", "ml", "ta", "ur", "as"]) {
      await page.goto(`/${locale}`);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth
      );
      expect(overflow, `${locale} overflows horizontally by ${overflow}px`).toBeLessThanOrEqual(1);
    }
  });
});
