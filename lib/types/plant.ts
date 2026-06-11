/**
 * Shared shapes for plant data as it comes back from Sanity (see
 * `sanity/lib/queries.ts`). Centralized here so pages and components stop
 * redefining the same interfaces.
 *
 * Presentation-only types (e.g. `ShowcaseVariety`, `PlantCardData`) live with
 * their components and are re-exported there.
 */
import type { SanityImageSource } from "@sanity/image-url";
import type { LocaleField } from "@/lib/i18n/getLocalized";

export type { LocaleField };

export interface PriceTier {
  minQty: number;
  maxQty?: number;
  price: number;
}

export interface BagSizePricing {
  size: string;
  tiers: PriceTier[];
}

export interface PlantImage {
  _key: string;
  asset: SanityImageSource;
  alt?: LocaleField;
  caption?: LocaleField;
}

export interface PlantVariety {
  _key: string;
  name?: LocaleField;
  description?: LocaleField;
  sizeRange?: string;
  bagSizes?: BagSizePricing[];
  availability?: string;
  sunlight?: string;
  watering?: string;
  growthRate?: string;
  maxHeight?: string;
  bloomSeason?: string;
  images?: PlantImage[];
}

export interface PlantData {
  _id: string;
  name: LocaleField;
  scientificName?: string;
  slug: { current: string };
  description?: LocaleField;
  categories?: string[];
  careTips?: LocaleField;
  fragrant?: boolean;
  petSafe?: boolean;
  images?: PlantImage[];
  varieties?: PlantVariety[];
}

/** Compact shape used by plant cards (catalog grid, featured, related). */
export interface PlantCardData {
  name: LocaleField;
  slug: { current: string };
  categories?: string[];
  image?: { asset: SanityImageSource } | null;
  availability?: string;
}
