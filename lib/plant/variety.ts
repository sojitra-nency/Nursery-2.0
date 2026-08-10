/**
 * Variety identity and pricing helpers.
 *
 * Varieties are embedded objects on the plant document (`sanity/schemaTypes/objects/variety.ts`),
 * not documents, so they have no author-managed slug — only the array `_key` Sanity
 * assigns. To give each variety a real, shareable product URL without a CMS migration
 * (and without writing to the dataset), the slug is *derived* from the variety name and
 * kept stable by falling back to `_key` whenever a name can't produce a usable one.
 *
 * The derivation is deliberately locale-independent: the English name is the slug
 * source for every locale, exactly like `plant.slug`, so `/hi/plants/mango/kesar` and
 * `/ta/plants/mango/kesar` address the same product.
 *
 * This module is pure — no Sanity or Next imports — so client components can use it too.
 */
import type { LocaleField } from "@/lib/i18n/getLocalized";
import type { BagSizePricing } from "@/lib/types/plant";

/** Prefix for key-derived slugs, so an unnamed variety still gets a legible URL. */
const KEY_SLUG_PREFIX = "v-";

/** Slugs longer than this get truncated at a word boundary. */
const MAX_SLUG_LENGTH = 60;

/** The minimum a variety needs for us to address it: a key, and maybe a name. */
export interface VarietyIdentity {
  _key: string;
  name?: LocaleField;
}

/**
 * ASCII slug from a display name.
 *
 * Non-Latin scripts (Hindi, Gujarati, …) decompose to nothing here and return `""`;
 * callers treat that as "no usable name" and fall back to the `_key`. That is
 * intentional — a percent-encoded Devanagari URL is unreadable and unshareable over
 * WhatsApp, which is how this catalog actually circulates.
 */
export function slugifyName(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "") // strip combining accents: "Á" → "A"
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, MAX_SLUG_LENGTH)
    .replace(/-+$/g, "");
}

/** Slug source for one variety, ignoring collisions: English name → any name → "". */
function baseSlug(variety: VarietyIdentity): string {
  const english = variety.name?.en?.trim();
  if (english) return slugifyName(english);

  // Fall back to any populated locale. Latin-script content authored only in a
  // non-default locale still yields a readable slug instead of a bare key.
  for (const value of Object.values(variety.name ?? {})) {
    if (typeof value === "string" && value.trim()) {
      const slug = slugifyName(value);
      if (slug) return slug;
    }
  }
  return "";
}

/**
 * Slugs for a plant's varieties, positionally aligned with the input array.
 *
 * Must be given the *complete, unfiltered* variety list: collision resolution depends
 * on seeing every sibling. Two varieties named the same both get their `_key`
 * appended (rather than an index suffix) so the URL survives an editor reordering
 * the array in the Studio.
 */
export function varietySlugs(varieties: readonly VarietyIdentity[]): string[] {
  const bases = varieties.map(baseSlug);

  const baseCounts = new Map<string, number>();
  for (const base of bases) {
    if (base) baseCounts.set(base, (baseCounts.get(base) ?? 0) + 1);
  }

  const resolved = bases.map((base, i) => {
    const key = varieties[i]._key || String(i);
    if (!base) return `${KEY_SLUG_PREFIX}${key}`;
    return (baseCounts.get(base) ?? 0) > 1 ? `${base}-${key}` : base;
  });

  // Final safety net for the pathological case where a real name slugifies onto
  // another variety's key-derived slug (e.g. a variety literally named "V 1a2b").
  const seen = new Set<string>();
  return resolved.map((slug, i) => {
    if (!seen.has(slug)) {
      seen.add(slug);
      return slug;
    }
    const unique = `${slug}-${varieties[i]._key || i}`;
    seen.add(unique);
    return unique;
  });
}

export interface VarietyMatch<T extends VarietyIdentity> {
  variety: T;
  /** The canonical slug, which may differ from the one that was looked up. */
  slug: string;
  index: number;
}

/**
 * Resolve a URL segment back to a variety.
 *
 * Also accepts a raw `_key`, so links minted before a variety was renamed (or by
 * anything working straight off the CMS payload) keep resolving; the caller can
 * compare `match.slug` to the requested segment and redirect to the canonical URL.
 */
export function findVarietyBySlug<T extends VarietyIdentity>(
  varieties: readonly T[],
  slug: string
): VarietyMatch<T> | null {
  const slugs = varietySlugs(varieties);

  const bySlug = slugs.indexOf(slug);
  if (bySlug !== -1) return { variety: varieties[bySlug], slug: slugs[bySlug], index: bySlug };

  const byKey = varieties.findIndex((v) => v._key === slug);
  if (byKey !== -1) return { variety: varieties[byKey], slug: slugs[byKey], index: byKey };

  return null;
}

/** Product URL for a variety. Locale-prefixed like every other route. */
export function varietyHref(locale: string, plantSlug: string, varietySlug: string): string {
  return `/${locale}/plants/${plantSlug}/${varietySlug}`;
}

/**
 * Cheapest price across every bag size and quantity tier, or `null` when the variety
 * has no pricing at all. Powers the "From ₹X" hint on variety cards — dealers scan
 * for the entry price before opening anything.
 */
export function lowestPrice(bagSizes: BagSizePricing[] | undefined): number | null {
  let lowest: number | null = null;
  for (const bag of bagSizes ?? []) {
    for (const tier of bag?.tiers ?? []) {
      if (typeof tier?.price !== "number" || !Number.isFinite(tier.price) || tier.price < 0) {
        continue;
      }
      if (lowest === null || tier.price < lowest) lowest = tier.price;
    }
  }
  return lowest;
}
