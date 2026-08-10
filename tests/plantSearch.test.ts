import { describe, it, expect } from "vitest";
import {
  normalizeTerm,
  localeFieldMatches,
  plantMatches,
  collectVarietyHits,
  type SearchablePlant,
} from "@/lib/plant/search";

const variety = (key: string, name: Record<string, string>) => ({ _key: key, name });

const mango: SearchablePlant<{ _key: string; name: Record<string, string> }> = {
  name: { en: "Mango", hi: "आम", gu: "કેરી" },
  slug: { current: "mango" },
  scientificName: "Mangifera indica",
  tags: ["grafted", "fruit"],
  varieties: [
    variety("v1", { en: "Kesar", hi: "केसर" }),
    variety("v2", { en: "Alphonso (Hapus)", hi: "अल्फांसो" }),
    variety("v3", { en: "Langra", hi: "लंगड़ा" }),
  ],
};

const rose: SearchablePlant<{ _key: string; name: Record<string, string> }> = {
  name: { en: "Rose", hi: "गुलाब" },
  slug: { current: "rose" },
  varieties: [variety("r1", { en: "Red Rose" }), variety("r2", { en: "Pink Rose" })],
};

describe("normalizeTerm", () => {
  it("folds case, accents and surrounding space", () => {
    expect(normalizeTerm("  Álphonso ")).toBe("alphonso");
  });

  it("leaves Indic scripts intact", () => {
    expect(normalizeTerm(" केसर ")).toBe("केसर");
  });
});

describe("localeFieldMatches", () => {
  it("matches any locale's translation", () => {
    expect(localeFieldMatches({ en: "Mango", hi: "आम" }, "आम")).toBe(true);
    expect(localeFieldMatches({ en: "Mango", hi: "आम" }, "mang")).toBe(true);
  });

  it("returns false for empty or missing fields", () => {
    expect(localeFieldMatches(null, "mango")).toBe(false);
    expect(localeFieldMatches(undefined, "mango")).toBe(false);
    expect(localeFieldMatches({}, "mango")).toBe(false);
  });
});

describe("plantMatches", () => {
  it("matches the localized name, the botanical name and tags", () => {
    expect(plantMatches(mango, "mango")).toBe(true);
    expect(plantMatches(mango, "आम")).toBe(true);
    expect(plantMatches(mango, "mangifera")).toBe(true);
    expect(plantMatches(mango, "grafted")).toBe(true);
  });

  it("does not match on a variety name", () => {
    // That distinction is what stops a "Kesar" search dumping the whole range.
    expect(plantMatches(mango, "kesar")).toBe(false);
  });
});

describe("collectVarietyHits", () => {
  it("surfaces every variety when the plant name matched", () => {
    const hits = collectVarietyHits([mango], "Mango");
    expect(hits.map((h) => h.varietySlug)).toEqual(["kesar", "alphonso-hapus", "langra"]);
    expect(hits.every((h) => h.viaPlant)).toBe(true);
    expect(hits[0].plantSlug).toBe("mango");
  });

  it("surfaces only the matching variety when the plant name did not match", () => {
    const hits = collectVarietyHits([mango], "Kesar");
    expect(hits).toHaveLength(1);
    expect(hits[0].varietySlug).toBe("kesar");
    expect(hits[0].viaPlant).toBe(false);
  });

  it("matches a variety in the visitor's own script", () => {
    const hits = collectVarietyHits([mango], "लंगड़ा");
    expect(hits.map((h) => h.varietySlug)).toEqual(["langra"]);
  });

  it("expands the whole range for a localized plant-name search", () => {
    expect(collectVarietyHits([mango], "आम")).toHaveLength(3);
  });

  it("returns nothing for a blank term so plain browsing is unaffected", () => {
    expect(collectVarietyHits([mango], "")).toEqual([]);
    expect(collectVarietyHits([mango], "   ")).toEqual([]);
  });

  it("spans multiple plants and keeps each variety with its own plant", () => {
    const hits = collectVarietyHits([mango, rose], "rose");
    expect(hits.map((h) => `${h.plantSlug}/${h.varietySlug}`)).toEqual([
      "rose/red-rose",
      "rose/pink-rose",
    ]);
  });

  it("carries the parent plant name for the card subtitle", () => {
    const [hit] = collectVarietyHits([mango], "Kesar");
    expect(hit.plantName).toEqual(mango.name);
  });

  it("skips plants with no varieties", () => {
    const bare: SearchablePlant = { name: { en: "Tulsi" }, slug: { current: "tulsi" } };
    expect(collectVarietyHits([bare], "tulsi")).toEqual([]);
    expect(collectVarietyHits([{ ...bare, varieties: null }], "tulsi")).toEqual([]);
  });

  it("is case and accent insensitive", () => {
    expect(collectVarietyHits([mango], "ALPHONSO")).toHaveLength(1);
    expect(collectVarietyHits([mango], "álphonso")).toHaveLength(1);
  });

  it("returns an empty list when nothing matches", () => {
    expect(collectVarietyHits([mango, rose], "zzzz")).toEqual([]);
  });
});
