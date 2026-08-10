import { urlForImage } from "@/sanity/lib/image";
import { getLocalized } from "@/lib/i18n/getLocalized";
import type { Locale } from "@/lib/i18n/config";
import type { PlantImage } from "@/lib/types/plant";
import type { GalleryImage } from "@/components/plant/VarietyGallery";

/**
 * Sanity CDN renders at these exact dimensions — Next's own optimizer is disabled on
 * the Cloudflare deployment (see `next.config.ts`), so the size has to be baked in.
 */
const GALLERY_WIDTH = 880;
const GALLERY_HEIGHT = 660;

/**
 * CMS images → gallery slides, dropping any entry whose asset failed to resolve.
 *
 * Shared by the plant hero and the variety page so both crop identically; an empty
 * result is a normal state, which `VarietyGallery` renders as a leaf placeholder.
 */
export function prepareGalleryImages(
  images: PlantImage[] | undefined,
  locale: Locale,
  fallbackAlt: string
): GalleryImage[] {
  return (images ?? [])
    .filter((img) => img?.asset)
    .map((img) => ({
      key: img._key,
      url: urlForImage(img.asset).width(GALLERY_WIDTH).height(GALLERY_HEIGHT).fit("crop").url(),
      alt: getLocalized(img.alt, locale) || fallbackAlt,
    }));
}

/**
 * Hero slides for a plant that has several varieties.
 *
 * Uses the plant's own gallery when the owner curated one, otherwise the lead photo of
 * each variety — so the hero previews the range rather than showing four pictures of
 * whichever variety happens to sit first in the array. Each slide is labelled with its
 * variety name, which is the alt text a screen reader actually wants here.
 */
export function preparePlantHeroImages(
  plantImages: PlantImage[] | undefined,
  varieties: Array<{ _key: string; images?: PlantImage[]; name?: PlantImage["alt"] }>,
  locale: Locale,
  fallbackAlt: string
): GalleryImage[] {
  const curated = prepareGalleryImages(plantImages, locale, fallbackAlt);
  if (curated.length > 0) return curated;

  return varieties
    .map((variety) => {
      const first = variety.images?.find((img) => img?.asset);
      if (!first) return null;
      const varietyName = getLocalized(variety.name, locale) || fallbackAlt;
      return {
        key: `${variety._key}-${first._key}`,
        url: urlForImage(first.asset).width(GALLERY_WIDTH).height(GALLERY_HEIGHT).fit("crop").url(),
        alt: getLocalized(first.alt, locale) || varietyName,
      };
    })
    .filter((slide): slide is GalleryImage => slide !== null);
}
