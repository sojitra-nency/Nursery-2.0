import type { Locale } from "./config";
import { defaultLocale } from "./config";

export type LocaleField = { en?: string; hi?: string; gu?: string } | null | undefined;

export function getLocalized(field: LocaleField, locale: Locale): string {
  if (!field) return "";
  return field[locale] ?? field[defaultLocale] ?? field.en ?? "";
}
