import Link from "next/link";
import Image from "next/image";
import { Badge } from "./Badge";
import { Card } from "./Card";
import { LeafIcon } from "./icons";
import { urlForImage } from "@/sanity/lib/image";
import { getLocalized } from "@/lib/i18n/getLocalized";
import { AVAILABILITY } from "@/sanity/lib/enums";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/config";
import type { PlantCardData } from "@/lib/types/plant";

export type { PlantCardData };

interface PlantCardProps {
  plant: PlantCardData;
  locale: Locale;
  dict: Dictionary;
}

export function PlantCard({ plant, locale, dict }: PlantCardProps) {
  const name = getLocalized(plant.name, locale);
  const imageAsset = plant.image?.asset;
  const imageUrl = imageAsset
    ? urlForImage(imageAsset).width(400).height(300).fit("crop").url()
    : null;
  const avail = AVAILABILITY.find((a) => a.value === plant.availability);

  return (
    <Link
      href={`/${locale}/plants/${plant.slug.current}`}
      className="group block h-full rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      <Card hover className="h-full flex flex-col">
        <div className="relative aspect-[4/3] overflow-hidden bg-border">
          {imageUrl ? (
            <>
              <Image
                src={imageUrl}
                alt={name}
                fill
                sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                className="object-cover transition-transform duration-500 ease-soft group-hover:scale-105"
              />
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-t from-scrim/25 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              />
            </>
          ) : (
            <div
              aria-hidden="true"
              className="absolute inset-0 flex items-center justify-center bg-accent/5"
            >
              <LeafIcon className="h-10 w-10 text-accent/40 transition-transform duration-500 ease-soft group-hover:scale-110" />
            </div>
          )}
        </div>
        <div className="p-3.5 flex flex-col items-start gap-2 flex-1">
          <p className="font-semibold text-foreground text-sm leading-snug line-clamp-2 transition-colors group-hover:text-accent">
            {name}
          </p>
          {avail && (
            <Badge
              dot
              tone={
                plant.availability === "in_stock"
                  ? "success"
                  : plant.availability === "out_of_stock"
                    ? "danger"
                    : plant.availability === "limited"
                      ? "warning"
                      : "neutral"
              }
            >
              {dict.common[avail.key]}
            </Badge>
          )}
        </div>
      </Card>
    </Link>
  );
}
