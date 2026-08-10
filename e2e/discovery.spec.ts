import { test, expect, type Page } from "@playwright/test";

/**
 * Browse → search → variety → product, end to end.
 *
 * Pinned to `/en` and to href-based locators rather than accessible names: names are
 * translated in thirteen languages, but the URL a card points at is the contract this
 * feature actually makes. Runs against the seeded Mango document, which has four
 * varieties — two with photos, two without — so the missing-image path is covered by
 * the same pass rather than needing a fixture.
 */

const PLANT = "/en/plants/mango";
const VARIETIES = ["kesar", "alphonso-hapus", "langra", "miyazaki"];

/**
 * Every variety card in the page body, located by the product URL it links to.
 *
 * Scoped to `main` on purpose: the header's language switcher links to the current
 * path in all thirteen locales, so an unscoped selector also matches the English
 * entry of whatever variety page you happen to be on.
 */
function varietyCards(page: Page) {
  return page.locator(`main a[href^="${PLANT}/"]`);
}

async function expectNoHorizontalOverflow(page: Page) {
  const overflow = await page.evaluate(() => {
    const el = document.documentElement;
    return el.scrollWidth - el.clientWidth;
  });
  expect(overflow, "page must not scroll horizontally").toBeLessThanOrEqual(0);
}

test.describe("plant page → varieties", () => {
  test("shows every variety as a tappable card linking to its product page", async ({ page }) => {
    await page.goto(PLANT);

    const cards = varietyCards(page);
    await expect(cards).toHaveCount(VARIETIES.length);

    for (const slug of VARIETIES) {
      await expect(page.locator(`main a[href="${PLANT}/${slug}"]`).first()).toBeVisible();
    }
  });

  test("the varieties section is a labelled landmark, not a footnote", async ({ page }) => {
    await page.goto(PLANT);

    const section = page.locator("#varieties");
    await expect(section).toBeVisible();
    // Named by its own heading, so it shows up in a screen reader's landmark list.
    await expect(section.getByRole("heading", { level: 2 })).toBeVisible();

    // The hero points at it, so the choice is announced above the fold.
    await expect(page.locator('main a[href="#varieties"]')).toBeVisible();
  });

  test("variety cards meet the 44px touch target floor", async ({ page }) => {
    await page.goto(PLANT);

    const cards = varietyCards(page);
    const count = await cards.count();
    for (let i = 0; i < count; i++) {
      const box = await cards.nth(i).boundingBox();
      expect(box, "card should be laid out").not.toBeNull();
      expect(box!.height).toBeGreaterThanOrEqual(44);
      expect(box!.width).toBeGreaterThanOrEqual(44);
    }
  });

  test("a variety with no photo still renders a complete card", async ({ page }) => {
    await page.goto(PLANT);

    // Langra has no images in the dataset — it must not collapse or show a broken frame.
    const langra = page.locator(`main a[href="${PLANT}/langra"]`);
    await expect(langra).toBeVisible();
    await expect(langra).toContainText("Langra");

    const withPhoto = await page.locator(`main a[href="${PLANT}/kesar"]`).boundingBox();
    const withoutPhoto = await langra.boundingBox();
    expect(withoutPhoto!.height).toBeCloseTo(withPhoto!.height, 0);
  });

  test("tapping a variety opens its product page", async ({ page }) => {
    await page.goto(PLANT);
    await page.locator(`main a[href="${PLANT}/kesar"]`).click();

    await expect(page).toHaveURL(new RegExp(`${PLANT}/kesar$`));
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Kesar");
  });

  test("renders without horizontal overflow on a small phone", async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 740 });
    await page.goto(PLANT);
    await expectNoHorizontalOverflow(page);
  });
});

test.describe("variety product page", () => {
  test("shows pricing, a way back, and both discovery sections", async ({ page }) => {
    await page.goto(`${PLANT}/kesar`);

    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Kesar");
    // Quantity-tiered pricing is the reason a dealer opened this page at all.
    await expect(page.getByRole("table")).toBeVisible();

    // Discovery 1: siblings, excluding the one being viewed.
    const siblings = page.locator(`main a[href^="${PLANT}/"]`);
    await expect(siblings).toHaveCount(VARIETIES.length - 1);
    await expect(page.locator(`main a[href="${PLANT}/kesar"]`)).toHaveCount(0);

    // Discovery 2: the wider catalog.
    await expect(page.getByRole("region", { name: "Explore other plants" })).toBeVisible();
    await expect(page.locator('a[href="/en/catalog"]').last()).toBeVisible();

    // And a route back up to the full range.
    await expect(page.locator(`main a[href="${PLANT}"]`).first()).toBeVisible();
  });

  test("moves between sibling varieties", async ({ page }) => {
    await page.goto(`${PLANT}/kesar`);
    await page.locator(`main a[href="${PLANT}/miyazaki"]`).click();

    await expect(page).toHaveURL(new RegExp(`${PLANT}/miyazaki$`));
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Miyazaki");
  });

  test("redirects a raw CMS key to the readable slug", async ({ page }) => {
    // Keeps links minted before a rename — or straight off the CMS payload — working,
    // without serving the same product from two URLs.
    await page.goto(`${PLANT}/b87cd887`);
    await expect(page).toHaveURL(new RegExp(`${PLANT}/kesar$`));
  });

  test("returns 404 for an unknown variety", async ({ page }) => {
    const response = await page.goto(`${PLANT}/not-a-variety`);
    expect(response?.status()).toBe(404);
  });

  test("renders without horizontal overflow on a small phone", async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 740 });
    await page.goto(`${PLANT}/miyazaki`);
    await expectNoHorizontalOverflow(page);
  });
});

test.describe("search → varieties", () => {
  test("a plant-name search returns the plant and its whole range", async ({ page }) => {
    await page.goto("/en/catalog?q=Mango");

    await expect(
      page.getByRole("heading", { level: 2, name: "Plants", exact: true })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { level: 2, name: "Varieties", exact: true })
    ).toBeVisible();

    await expect(page.locator(`main a[href="${PLANT}"]`).first()).toBeVisible();
    await expect(page.locator(`main a[href^="${PLANT}/"]`)).toHaveCount(VARIETIES.length);
  });

  test("a variety-name search returns only that variety", async ({ page }) => {
    await page.goto("/en/catalog?q=Kesar");

    const varieties = page.locator(`main a[href^="${PLANT}/"]`);
    await expect(varieties).toHaveCount(1);
    await expect(page.locator(`main a[href="${PLANT}/kesar"]`)).toBeVisible();
  });

  test("finds a variety searched in the visitor's own script", async ({ page }) => {
    // "केसर" — search covered only the plant's en/hi/gu names before, never varieties.
    await page.goto("/hi/catalog?q=%E0%A4%95%E0%A5%87%E0%A4%B8%E0%A4%B0");
    await expect(page.locator('main a[href="/hi/plants/mango/kesar"]')).toBeVisible();
  });

  test("a variety result opens its product page directly", async ({ page }) => {
    await page.goto("/en/catalog?q=Mango");
    await page.locator(`main a[href="${PLANT}/alphonso-hapus"]`).click();

    await expect(page).toHaveURL(new RegExp(`${PLANT}/alphonso-hapus$`));
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Alphonso (Hapus)");
  });

  test("typing in the search box surfaces varieties", async ({ page }) => {
    await page.goto("/en/catalog");
    // No term yet: plain browsing keeps the unlabelled plant grid.
    await expect(page.locator(`main a[href^="${PLANT}/"]`)).toHaveCount(0);

    await page.getByRole("searchbox").fill("Mango");
    await expect(page).toHaveURL(/q=Mango/);
    await expect(page.locator(`main a[href^="${PLANT}/"]`)).toHaveCount(VARIETIES.length);
  });

  test("a search with no matches still shows the empty state", async ({ page }) => {
    await page.goto("/en/catalog?q=zzzznotaplant");

    await expect(page.locator(`main a[href^="${PLANT}"]`)).toHaveCount(0);
    // Neither section renders, and the clear-filters escape hatch is offered.
    await expect(page.getByRole("heading", { name: "No plants found" })).toBeVisible();
    await expect(
      page.getByRole("heading", { level: 2, name: "Varieties", exact: true })
    ).toHaveCount(0);
  });

  test("results render without horizontal overflow on a small phone", async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 740 });
    await page.goto("/en/catalog?q=Mango");
    await expect(page.locator(`main a[href^="${PLANT}/"]`).first()).toBeVisible();
    await expectNoHorizontalOverflow(page);
  });
});
