import { defaultLocale, locales, type Locale } from "./config";

/**
 * A localized CMS field: one optional string per locale, e.g.
 * `{ en: "Money Plant", hi: "मनी प्लांट" }`. Sanity stores these as objects
 * whose keys come from the locale registry (see `sanity/schemaTypes/objects`).
 */
export type LocaleField = Partial<Record<Locale, string>> | null | undefined;

function nonEmpty(value: unknown): value is string {
  return typeof value === "string" && value.trim() !== "";
}

export interface ResolvedLocalized {
  value: string;
  /** Which locale the text actually came from (`null` when the field is empty). */
  usedLocale: Locale | null;
  /** True when the requested locale had no text and we substituted another. */
  isFallback: boolean;
}

/**
 * Resolve a localized field, reporting which locale was used.
 *
 * Chain: requested locale → English → any locale with text. The last step matters
 * for partially-translated content: showing a plant's Hindi name to a Marathi
 * reader is strictly better than showing an empty card.
 *
 * Blank strings are treated as missing (the old `??` chain let an empty
 * translation shadow the English text and render nothing).
 */
export function resolveLocalized(field: LocaleField, locale: Locale): ResolvedLocalized {
  if (!field) return { value: "", usedLocale: null, isFallback: false };

  if (nonEmpty(field[locale])) {
    return { value: field[locale]!.trim(), usedLocale: locale, isFallback: false };
  }
  if (nonEmpty(field[defaultLocale])) {
    return { value: field[defaultLocale]!.trim(), usedLocale: defaultLocale, isFallback: true };
  }
  for (const candidate of locales) {
    if (nonEmpty(field[candidate])) {
      return { value: field[candidate]!.trim(), usedLocale: candidate, isFallback: true };
    }
  }
  return { value: "", usedLocale: null, isFallback: false };
}

/** The common case: just the text. */
export function getLocalized(field: LocaleField, locale: Locale): string {
  return resolveLocalized(field, locale).value;
}
