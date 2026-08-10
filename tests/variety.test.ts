import { describe, it, expect } from "vitest";
import {
  slugifyName,
  varietySlugs,
  findVarietyBySlug,
  varietyHref,
  lowestPrice,
} from "@/lib/plant/variety";

const v = (key: string, name?: Record<string, string>) => ({ _key: key, name });

describe("slugifyName", () => {
  it("lowercases and hyphenates", () => {
    expect(slugifyName("Golden Pothos")).toBe("golden-pothos");
  });

  it("strips punctuation and collapses separators", () => {
    expect(slugifyName("Alphonso (Hapus)")).toBe("alphonso-hapus");
    expect(slugifyName("Barbadensis  —  Common Aloe")).toBe("barbadensis-common-aloe");
  });

  it("folds accents to ASCII", () => {
    expect(slugifyName("Miyazaki Élite")).toBe("miyazaki-elite");
  });

  it("returns empty for scripts with no ASCII equivalent", () => {
    expect(slugifyName("केसर")).toBe("");
    expect(slugifyName("મિયાઝાકી")).toBe("");
  });

  it("returns empty for blank or punctuation-only input", () => {
    expect(slugifyName("")).toBe("");
    expect(slugifyName("   ")).toBe("");
    expect(slugifyName("!!! ---")).toBe("");
  });

  it("truncates very long names without a trailing hyphen", () => {
    const slug = slugifyName(`${"Very Long Variety Name ".repeat(10)}End`);
    expect(slug.length).toBeLessThanOrEqual(60);
    expect(slug.endsWith("-")).toBe(false);
  });
});

describe("varietySlugs", () => {
  it("derives readable slugs from the English name", () => {
    expect(
      varietySlugs([v("a1", { en: "Kesar", hi: "केसर" }), v("b2", { en: "Alphonso (Hapus)" })])
    ).toEqual(["kesar", "alphonso-hapus"]);
  });

  it("stays positionally aligned with the input", () => {
    const list = [v("a", { en: "One" }), v("b", { en: "Two" }), v("c", { en: "Three" })];
    expect(varietySlugs(list)).toHaveLength(list.length);
    expect(varietySlugs(list)[1]).toBe("two");
  });

  it("falls back to another locale when English is missing", () => {
    // Latin text authored only in a non-default locale still yields a real slug.
    expect(varietySlugs([v("a1", { hi: "Kesar Special" })])).toEqual(["kesar-special"]);
  });

  it("falls back to the key when no locale yields ASCII", () => {
    expect(varietySlugs([v("b87cd887", { hi: "केसर", gu: "કેસર" })])).toEqual(["v-b87cd887"]);
  });

  it("falls back to the key when the variety has no name at all", () => {
    expect(varietySlugs([v("abc123")])).toEqual(["v-abc123"]);
    expect(varietySlugs([v("abc123", { en: "   " })])).toEqual(["v-abc123"]);
  });

  it("disambiguates duplicate names by key, not by position", () => {
    const slugs = varietySlugs([v("k1", { en: "Red Rose" }), v("k2", { en: "Red Rose" })]);
    expect(slugs).toEqual(["red-rose-k1", "red-rose-k2"]);
    // Reordering in the Studio must not change either URL.
    expect(varietySlugs([v("k2", { en: "Red Rose" }), v("k1", { en: "Red Rose" })])).toEqual([
      "red-rose-k2",
      "red-rose-k1",
    ]);
  });

  it("leaves a unique name untouched even when a sibling collides", () => {
    expect(
      varietySlugs([
        v("k1", { en: "Red Rose" }),
        v("k2", { en: "Red Rose" }),
        v("k3", { en: "Pink Rose" }),
      ])
    ).toEqual(["red-rose-k1", "red-rose-k2", "pink-rose"]);
  });

  it("never emits the same slug twice, even when a name collides with a key slug", () => {
    const slugs = varietySlugs([v("abc", { en: "V Abc" }), v("abc2")]);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("handles an empty list", () => {
    expect(varietySlugs([])).toEqual([]);
  });
});

describe("findVarietyBySlug", () => {
  const list = [v("k1", { en: "Kesar" }), v("k2", { en: "Langra" })];

  it("resolves by derived slug", () => {
    const match = findVarietyBySlug(list, "langra");
    expect(match?.variety._key).toBe("k2");
    expect(match?.slug).toBe("langra");
    expect(match?.index).toBe(1);
  });

  it("resolves by raw key and reports the canonical slug", () => {
    // Lets the page redirect a `_key` URL to the readable one.
    const match = findVarietyBySlug(list, "k1");
    expect(match?.variety._key).toBe("k1");
    expect(match?.slug).toBe("kesar");
  });

  it("returns null for an unknown slug", () => {
    expect(findVarietyBySlug(list, "nope")).toBeNull();
    expect(findVarietyBySlug([], "kesar")).toBeNull();
  });

  it("is case-sensitive, so casing variants redirect rather than double-serve", () => {
    expect(findVarietyBySlug(list, "Kesar")).toBeNull();
  });
});

describe("varietyHref", () => {
  it("builds a locale-prefixed product URL", () => {
    expect(varietyHref("hi", "mango", "kesar")).toBe("/hi/plants/mango/kesar");
  });
});

describe("lowestPrice", () => {
  it("returns the cheapest tier across every bag size", () => {
    expect(
      lowestPrice([
        {
          size: "12 × 12",
          tiers: [
            { minQty: 1, maxQty: 5, price: 2200 },
            { minQty: 6, price: 2000 },
          ],
        },
        {
          size: "12 × 15",
          tiers: [
            { minQty: 1, price: 2600 },
            { minQty: 21, price: 1800 },
          ],
        },
      ])
    ).toBe(1800);
  });

  it("returns null when there is no pricing", () => {
    expect(lowestPrice(undefined)).toBeNull();
    expect(lowestPrice([])).toBeNull();
    expect(lowestPrice([{ size: "8 × 8", tiers: [] }])).toBeNull();
  });

  it("accepts a legitimate zero price", () => {
    expect(lowestPrice([{ size: "8 × 8", tiers: [{ minQty: 1, price: 0 }] }])).toBe(0);
  });

  it("ignores malformed tiers rather than returning NaN", () => {
    const bags = [
      {
        size: "8 × 8",
        tiers: [
          { minQty: 1, price: Number.NaN },
          { minQty: 2, price: -5 },
        ],
      },
      { size: "6 × 6", tiers: [{ minQty: 1, price: 120 }] },
    ] as Parameters<typeof lowestPrice>[0];
    expect(lowestPrice(bags)).toBe(120);
  });

  it("survives a bag with no tiers array at all", () => {
    const bags = [{ size: "6 × 6" }, { size: "8 × 8", tiers: [{ minQty: 1, price: 90 }] }];
    expect(lowestPrice(bags as Parameters<typeof lowestPrice>[0])).toBe(90);
  });
});
