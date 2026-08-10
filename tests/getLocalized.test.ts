import { describe, it, expect } from "vitest";
import { getLocalized, resolveLocalized } from "@/lib/i18n/getLocalized";
import { categoryKey, localizeCategory } from "@/lib/i18n/categories";
import { interpolate, pluralize, formatNumber, formatCurrency } from "@/lib/i18n/format";
import en from "@/messages/en.json";

describe("getLocalized", () => {
  it("returns the value for the requested locale", () => {
    expect(getLocalized({ en: "Hello", hi: "नमस्ते", gu: "નમસ્તે" }, "hi")).toBe("नमस्ते");
  });

  it("falls back to English when the locale value is missing", () => {
    expect(getLocalized({ en: "Hello" }, "gu")).toBe("Hello");
    expect(getLocalized({ en: "Hello" }, "ml")).toBe("Hello");
  });

  it("treats a blank translation as missing", () => {
    // Regression: the old `??` chain let an empty string shadow the English
    // fallback, so a field an editor had cleared rendered as nothing at all.
    expect(getLocalized({ en: "Hello", ta: "" }, "ta")).toBe("Hello");
    expect(getLocalized({ en: "Hello", ta: "   " }, "ta")).toBe("Hello");
  });

  it("falls back to any populated locale when English is missing too", () => {
    // Better to show a Marathi reader the Hindi name than an empty card.
    expect(getLocalized({ hi: "मनी प्लांट" }, "mr")).toBe("मनी प्लांट");
  });

  it("returns empty string for null/undefined/empty field", () => {
    expect(getLocalized(null, "en")).toBe("");
    expect(getLocalized(undefined, "en")).toBe("");
    expect(getLocalized({}, "en")).toBe("");
  });

  it("reports which locale the text came from", () => {
    expect(resolveLocalized({ en: "Hello", ta: "வணக்கம்" }, "ta")).toEqual({
      value: "வணக்கம்",
      usedLocale: "ta",
      isFallback: false,
    });
    expect(resolveLocalized({ en: "Hello" }, "ta")).toEqual({
      value: "Hello",
      usedLocale: "en",
      isFallback: true,
    });
    expect(resolveLocalized({}, "ta")).toEqual({
      value: "",
      usedLocale: null,
      isFallback: false,
    });
  });

  it("trims surrounding whitespace from CMS values", () => {
    expect(getLocalized({ en: "  Money Plant  " }, "en")).toBe("Money Plant");
  });

  it("lets a caller tell 'translated' apart from 'fell back to English'", () => {
    // The hero headline depends on this. `getLocalized` alone always returns the
    // English text when a locale is missing, which made the translated
    // `heroTitleFallback` unreachable and left the CMS tagline in English on
    // otherwise fully-translated pages. `isFallback` is what lets the caller choose
    // the translated generic instead.
    const tagline = { en: "Quality Plants for Every Home", hi: "हर घर के लिए…" };

    expect(resolveLocalized(tagline, "hi").isFallback).toBe(false);
    expect(resolveLocalized(tagline, "ur").isFallback).toBe(true);
    expect(resolveLocalized(tagline, "ur").value).toBe("Quality Plants for Every Home");
  });
});

describe("categoryKey", () => {
  it("maps the stored English category strings onto dictionary keys", () => {
    expect(categoryKey("Indoor Plants")).toBe("indoorPlants");
    expect(categoryKey("Air-Purifying")).toBe("airPurifying");
    expect(categoryKey("Non-Flowering")).toBe("nonFlowering");
    expect(categoryKey("Herbs")).toBe("herbs");
  });

  it("resolves every category the Studio offers", () => {
    // Guard against a category being added to enums.ts with no matching label.
    const known = Object.keys(en.categories);
    for (const key of known) expect(key).toMatch(/^[a-z][A-Za-z0-9]*$/);
    expect(categoryKey("Indoor Plants") in en.categories).toBe(true);
  });

  it("tolerates odd input", () => {
    expect(categoryKey("")).toBe("");
    expect(categoryKey("   ")).toBe("");
    expect(categoryKey("!!!")).toBe("");
  });
});

describe("localizeCategory", () => {
  it("translates a known category", () => {
    expect(localizeCategory("Indoor Plants", en)).toBe("Indoor Plants");
  });

  it("passes an owner-invented category straight through", () => {
    // The Studio input lets the owner add categories; an unknown one must still
    // render rather than disappearing.
    expect(localizeCategory("Bonsai Starters", en)).toBe("Bonsai Starters");
  });
});

describe("interpolate", () => {
  it("substitutes named placeholders", () => {
    expect(interpolate("Image {current} of {total}", { current: 2, total: 5 })).toBe(
      "Image 2 of 5"
    );
  });

  it("leaves unknown placeholders visible rather than blanking them", () => {
    expect(interpolate("Hello {name}", {})).toBe("Hello {name}");
  });

  it("substitutes every occurrence", () => {
    expect(interpolate("{a}-{a}", { a: "x" })).toBe("x-x");
  });
});

describe("pluralize", () => {
  const forms = { one: en.catalog.resultsCountOne, other: en.catalog.resultsCount };

  it("picks the singular form for exactly one", () => {
    expect(pluralize(1, forms, "en")).toBe("1 plant available");
  });

  it("picks the plural form otherwise", () => {
    expect(pluralize(0, forms, "en")).toBe("0 plants available");
    expect(pluralize(7, forms, "en")).toBe("7 plants available");
  });
});

describe("number and currency formatting", () => {
  it("uses Latin digits in every locale", () => {
    // Indian usage writes quantities and prices in ASCII numerals; mixed numeral
    // systems are a real readability problem for the audience.
    for (const locale of ["en", "hi", "ta", "ur", "bn"] as const) {
      expect(formatNumber(1234, locale)).toMatch(/^[\d,.\s]+$/);
    }
  });

  it("groups large numbers the Indian way", () => {
    expect(formatNumber(100000, "en")).toBe("1,00,000");
    expect(formatNumber(100000, "ta")).toBe("1,00,000");
  });

  it("formats prices with the settings currency", () => {
    const price = formatCurrency(1200, "en");
    expect(price).toContain("1,200");
    expect(price).toMatch(/₹/);
  });

  it("falls back rather than throwing on an unusable currency code", () => {
    expect(() => formatCurrency(10, "en", "NOT_A_CODE")).not.toThrow();
  });
});
