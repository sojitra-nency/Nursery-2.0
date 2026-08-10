import Image from "next/image";
import Link from "next/link";
import type { SanityImageSource } from "@sanity/image-url";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { ChevronRightIcon, LeafIcon } from "@/components/ui/icons";
import { urlForImage } from "@/sanity/lib/image";
import { AVAILABILITY } from "@/sanity/lib/enums";
import { getLocalized, type LocaleField } from "@/lib/i18n/getLocalized";
import { formatCurrency, interpolate } from "@/lib/i18n/format";
import type { Dictionary } from "@/lib/i18n/dictionary-type";
import type { Locale } from "@/lib/i18n/config";
import type { BagSizePricing } from "@/lib/types/plant";
import { lowestPrice, varietyHref } from "@/lib/plant/variety";

/**
 * The subset of a variety a card needs, in the shape both call sites already have:
 * the plant page passes `images[0]`, the catalog search query projects `image`
 * directly. Everything is optional because real catalog rows are patchy — most
 * varieties in the dataset have no photo yet.
 */
export interface VarietyCardSource {
  _key: string;
  name?: LocaleField;
  availability?: string;
  sizeRange?: string;
  bagSizes?: BagSizePricing[];
  image?: { asset?: SanityImageSource | null; alt?: LocaleField } | null;
}

interface VarietyCardProps {
  variety: VarietyCardSource;
  varietySlug: string;
  plantSlug: string;
  /** Shown under the name in search results, where the parent plant isn't obvious. */
  plantName?: string;
  /** Used when the variety itself has no name in any locale. */
  fallbackName: string;
  locale: Locale;
  dict: Dictionary;
  currency?: string;
}

function availabilityTone(value?: string) {
  if (value === "in_stock") return "success" as const;
  if (value === "out_of_stock") return "danger" as const;
  if (value === "limited") return "warning" as const;
  return "neutral" as const;
}

/**
 * A tappable variety, linking to its own product page.
 *
 * Mirrors `PlantCard` on purpose — same aspect ratio, radius, hover lift and leaf
 * placeholder — so a grid of varieties reads as the same kind of object as a grid of
 * plants. The differences are the ones that matter to a buyer: the entry price and an
 * explicit "view details" affordance, because the audience includes people who won't
 * assume a picture is tappable.
 */
export function VarietyCard({
  variety,
  varietySlug,
  plantSlug,
  plantName,
  fallbackName,
  locale,
  dict,
  currency = "INR",
}: VarietyCardProps) {
  const name = getLocalized(variety.name, locale) || fallbackName;
  const asset = variety.image?.asset;
  const imageUrl = asset ? urlForImage(asset).width(400).height(300).fit("crop").url() : null;
  const avail = AVAILABILITY.find((a) => a.value === variety.availability);
  const from = lowestPrice(variety.bagSizes);

  return (
    <Link
      href={varietyHref(locale, plantSlug, varietySlug)}
      className="group block h-full rounded-2xl focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none"
    >
      <Card hover className="flex h-full flex-col">
        <div className="relative aspect-[4/3] overflow-hidden bg-border">
          {imageUrl ? (
            <Image
              src={imageUrl}
              // Decorative: the variety name sits directly below inside the same
              // link, so a duplicate alt would read the name twice per card.
              alt=""
              fill
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
              className="object-cover transition-transform duration-500 ease-soft group-hover:scale-105"
            />
          ) : (
            <div
              aria-hidden="true"
              className="absolute inset-0 flex items-center justify-center bg-accent/5"
            >
              <LeafIcon className="h-10 w-10 text-accent/40 transition-transform duration-500 ease-soft group-hover:scale-110" />
            </div>
          )}
          {avail && (
            // Solid backdrop: the badge tones are translucent and would be
            // unreadable straight over a photo.
            <div className="absolute start-2 top-2 rounded-full bg-background/90 shadow-soft backdrop-blur-sm">
              <Badge dot tone={availabilityTone(variety.availability)}>
                {dict.common[avail.key]}
              </Badge>
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col gap-1 p-3.5">
          <p className="line-clamp-2 text-sm leading-snug font-semibold text-foreground transition-colors group-hover:text-accent">
            {name}
          </p>
          {plantName && (
            <p className="line-clamp-1 text-xs text-muted">
              {interpolate(dict.plant.varietyOf, { plant: plantName })}
            </p>
          )}
          {variety.sizeRange && (
            <p className="line-clamp-1 text-xs text-muted">{variety.sizeRange}</p>
          )}

          <div className="mt-auto flex flex-wrap items-center justify-between gap-x-2 gap-y-1 pt-2">
            {from !== null ? (
              <span className="text-sm font-semibold text-foreground">
                {interpolate(dict.plant.priceFrom, {
                  price: formatCurrency(from, locale, currency),
                })}
              </span>
            ) : (
              <span aria-hidden="true" />
            )}
            <span className="inline-flex items-center gap-1 text-xs font-medium text-accent">
              {dict.plant.viewVariety}
              <ChevronRightIcon className="rtl-flip h-3.5 w-3.5 transition-transform duration-300 ease-soft group-hover:translate-x-0.5" />
            </span>
          </div>
        </div>
      </Card>
    </Link>
  );
}
