/**
 * Which varieties a search term should surface.
 *
 * The GROQ filter (`sanity/lib/queries.ts`) decides which *plants* come back — it can
 * tell that some variety of a plant matched, but not which one. This module does the
 * second half: given the returned plants, work out which individual varieties deserve
 * their own result card.
 *
 * The rule that makes "Mango" behave the way a buyer expects:
 *   - the plant name matched  → surface *every* one of its varieties
 *     (searching "Mango" should reveal Kesar, Alphonso, Langra, Miyazaki)
 *   - only a variety matched  → surface just the matching varieties
 *     (searching "Kesar" shouldn't dump the whole mango range on you)
 *
 * Pure and dependency-free so it can be unit-tested without Sanity or React.
 */
import type { LocaleField } from "@/lib/i18n/getLocalized";
import { varietySlugs, type VarietyIdentity } from "./variety";

/** Minimum plant shape the matcher needs; queries may project more. */
export interface SearchablePlant<V extends VarietyIdentity = VarietyIdentity> {
  name: LocaleField;
  slug: { current: string };
  scientificName?: string;
  tags?: string[];
  varieties?: V[] | null;
}

export interface VarietyHit<V extends VarietyIdentity = VarietyIdentity> {
  variety: V;
  /** Derived URL segment for this variety within its plant. */
  varietySlug: string;
  plantSlug: string;
  plantName: LocaleField;
  /** True when the parent plant name matched, not the variety's own name. */
  viaPlant: boolean;
}

/**
 * Fold case and accents so "Alphonso" and "alphónso" compare equal. Deliberately more
 * forgiving than GROQ's token-prefix `match` — this only ever narrows an already
 * fetched result set, so a false positive here is a visible card, never a missed one.
 */
export function normalizeTerm(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function textMatches(value: string | undefined | null, term: string): boolean {
  return typeof value === "string" && normalizeTerm(value).includes(term);
}

/** True when any locale's translation of the field contains the term. */
export function localeFieldMatches(field: LocaleField, term: string): boolean {
  if (!field) return false;
  return Object.values(field).some((value) => textMatches(value, term));
}

/** True when the plant itself matched — by name in any locale, botanical name, or tag. */
export function plantMatches(plant: SearchablePlant, term: string): boolean {
  return (
    localeFieldMatches(plant.name, term) ||
    textMatches(plant.scientificName, term) ||
    (plant.tags ?? []).some((tag) => textMatches(tag, term))
  );
}

/**
 * Variety result cards for a search term, in plant order then variety order.
 *
 * Returns `[]` for a blank term: plain browsing shows the plant grid alone, so the
 * default catalog stays exactly as it was.
 */
export function collectVarietyHits<V extends VarietyIdentity>(
  plants: readonly SearchablePlant<V>[],
  rawTerm: string
): VarietyHit<V>[] {
  const term = normalizeTerm(rawTerm);
  if (!term) return [];

  const hits: VarietyHit<V>[] = [];

  for (const plant of plants) {
    const varieties = plant.varieties ?? [];
    if (varieties.length === 0) continue;

    // Slugs are computed over the *whole* list so collision suffixes match the ones
    // the plant and variety pages derive.
    const slugs = varietySlugs(varieties);
    const viaPlant = plantMatches(plant, term);

    varieties.forEach((variety, i) => {
      if (!viaPlant && !localeFieldMatches(variety.name, term)) return;
      hits.push({
        variety,
        varietySlug: slugs[i],
        plantSlug: plant.slug.current,
        plantName: plant.name,
        viaPlant,
      });
    });
  }

  return hits;
}
