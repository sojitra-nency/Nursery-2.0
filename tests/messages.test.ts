import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { LOCALES, locales, defaultLocale, hasLocale, localeMeta } from "@/lib/i18n/config";
import { mergeDictionary } from "@/lib/i18n/merge";
import en from "@/messages/en.json";

/**
 * The catalogs are hand-authored across thirteen languages and nine scripts, most
 * of which nobody on the team can proofread. These tests are the guard rail: they
 * can't judge whether a translation is *good*, but they catch every structural way
 * one can be wrong — a key that was never added, a placeholder that got dropped in
 * translation (which would silently print "{count} plants available"), or a blank
 * value that would collapse a button.
 */

type Json = Record<string, unknown>;

function flatten(obj: Json, prefix = ""): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(obj)) {
    const full = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === "object" && !Array.isArray(value)) {
      Object.assign(out, flatten(value as Json, full));
    } else {
      out[full] = String(value);
    }
  }
  return out;
}

function loadCatalog(code: string): Json {
  const file = path.join(process.cwd(), "messages", `${code}.json`);
  return JSON.parse(readFileSync(file, "utf8")) as Json;
}

const placeholders = (value: string) => [...value.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();

const englishFlat = flatten(en as Json);
const englishKeys = Object.keys(englishFlat).sort();

describe("locale registry", () => {
  it("has a catalog file for every registered locale", () => {
    for (const locale of locales) {
      expect(() => loadCatalog(locale)).not.toThrow();
    }
  });

  it("has unique codes and complete metadata", () => {
    const codes = LOCALES.map((l) => l.code);
    expect(new Set(codes).size).toBe(codes.length);

    for (const meta of LOCALES) {
      expect(meta.nativeName.trim()).not.toBe("");
      expect(meta.englishName.trim()).not.toBe("");
      expect(["ltr", "rtl"]).toContain(meta.dir);
      // Must be a tag `Intl` actually accepts, or number formatting breaks.
      expect(() => new Intl.NumberFormat(meta.intl)).not.toThrow();
    }
  });

  it("starts with English as the default and fallback locale", () => {
    expect(locales[0]).toBe(defaultLocale);
    expect(defaultLocale).toBe("en");
  });

  it("recognises registered codes and rejects everything else", () => {
    expect(hasLocale("ta")).toBe(true);
    expect(hasLocale("xx")).toBe(false);
    expect(hasLocale("")).toBe(false);
    expect(hasLocale(undefined)).toBe(false);
    // Unknown codes resolve to English rather than throwing.
    expect(localeMeta("xx").code).toBe("en");
  });

  it("marks Urdu as the only RTL locale", () => {
    const rtl = LOCALES.filter((l) => l.dir === "rtl").map((l) => l.code);
    expect(rtl).toEqual(["ur"]);
  });
});

describe.each(locales.filter((code) => code !== defaultLocale))("catalog: %s", (code) => {
  const catalog = flatten(loadCatalog(code));

  it("has exactly the English key set — no missing, no stray keys", () => {
    expect(Object.keys(catalog).sort()).toEqual(englishKeys);
  });

  it("has no blank values", () => {
    const blank = Object.entries(catalog)
      .filter(([, value]) => value.trim() === "")
      .map(([key]) => key);
    expect(blank).toEqual([]);
  });

  it("preserves every interpolation placeholder", () => {
    const broken = englishKeys.filter(
      (key) => placeholders(englishFlat[key]).join() !== placeholders(catalog[key]).join()
    );
    expect(broken).toEqual([]);
  });

  it("is actually translated, not a copy of English", () => {
    const identical = englishKeys.filter((key) => catalog[key] === englishFlat[key]);
    // "WhatsApp" is a brand name and stays in Latin script in every language.
    expect(identical).toEqual(["contact.whatsapp"]);
  });
});

describe("mergeDictionary", () => {
  it("fills gaps from English so no key is ever undefined", () => {
    const merged = mergeDictionary(en, { nav: { catalog: "பட்டியல்" } });
    expect(merged.nav.catalog).toBe("பட்டியல்");
    expect(merged.nav.about).toBe(en.nav.about);
    expect(merged.errors.retry).toBe(en.errors.retry);
  });

  it("treats blank and whitespace-only overrides as missing", () => {
    const merged = mergeDictionary(en, { nav: { catalog: "", about: "   " } });
    expect(merged.nav.catalog).toBe(en.nav.catalog);
    expect(merged.nav.about).toBe(en.nav.about);
  });

  it("ignores a malformed catalog entirely", () => {
    expect(mergeDictionary(en, null)).toEqual(en);
    expect(mergeDictionary(en, "nonsense")).toEqual(en);
    expect(mergeDictionary(en, { nav: "not an object" }).nav).toEqual(en.nav);
  });

  it("does not mutate the English base", () => {
    const before = JSON.stringify(en);
    mergeDictionary(en, { nav: { catalog: "changed" } });
    expect(JSON.stringify(en)).toBe(before);
  });
});
