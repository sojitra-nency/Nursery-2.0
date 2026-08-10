import type { Dictionary } from "./dictionary-type";

/**
 * Category labels are stored on plant documents as raw English strings
 * ("Indoor Plants", "Air-Purifying") because the Studio input lets the owner add
 * new ones freely. They were therefore rendering in English on every locale —
 * in the catalog filter chips, the featured-category grid and the breadcrumb.
 *
 * These helpers map a stored string onto a dictionary key, so the fixed set from
 * `sanity/lib/enums.ts` is translated while an owner-invented category still
 * renders (as typed) instead of vanishing.
 */

/** `"Air-Purifying"` → `"airPurifying"`, `"Indoor Plants"` → `"indoorPlants"`. */
export function categoryKey(name: string): string {
  const words = name
    .trim()
    .toLowerCase()
    .split(/[^a-z0-9]+/i)
    .filter(Boolean);
  if (words.length === 0) return "";
  return words.map((word, i) => (i === 0 ? word : word[0].toUpperCase() + word.slice(1))).join("");
}

/** Translated category label, falling back to the stored text. */
export function localizeCategory(name: string, dict: Dictionary): string {
  const labels = dict.categories as Record<string, string | undefined>;
  return labels[categoryKey(name)] ?? name;
}
