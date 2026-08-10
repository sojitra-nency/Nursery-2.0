import { intlLocale, type Locale } from "./config";

/**
 * Message interpolation and locale-aware number formatting.
 *
 * Replaces the ad-hoc `String(n)` + `.replace("{count}", …)` calls that were
 * scattered across the catalog and the variety carousel, and the hard-coded
 * `toLocaleString("en-IN")` / `₹` in the price table.
 */

/**
 * Substitute `{name}` placeholders in a catalog string.
 *
 * Unknown placeholders are left as written rather than blanked, so a bad key shows
 * up as visible `{whatever}` during review instead of silently disappearing from
 * the sentence.
 */
export function interpolate(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in values ? String(values[key]) : match
  );
}

/**
 * Pick the singular or plural form and fill in the count.
 *
 * A deliberately simple one/other split: these thirteen languages all distinguish
 * exactly those two categories for the counts this catalog shows, and a full
 * `Intl.PluralRules` + CLDR category setup would mean thirteen more keys per
 * countable string with no visible benefit.
 */
export function pluralize(
  count: number,
  forms: { one: string; other: string },
  locale: Locale
): string {
  const template = count === 1 ? forms.one : forms.other;
  return interpolate(template, { count: formatNumber(count, locale) });
}

export function formatNumber(value: number, locale: Locale): string {
  try {
    return new Intl.NumberFormat(intlLocale(locale)).format(value);
  } catch {
    return String(value);
  }
}

/**
 * Money, in the locale's grouping convention (Indian lakh/crore grouping for
 * `*-IN` tags) with the currency symbol placed where that locale puts it — which
 * is on the right in several of these scripts, not always the left.
 */
export function formatCurrency(value: number, locale: Locale, currency = "INR"): string {
  try {
    return new Intl.NumberFormat(intlLocale(locale), {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return `₹${value}`;
  }
}
