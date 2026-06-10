import Link from "next/link";
import Image from "next/image";
import { Badge } from "./Badge";
import { Card } from "./Card";
import { urlForImage } from "@/sanity/lib/image";
import { getLocalized } from "@/lib/i18n/getLocalized";
import { AVAILABILITY } from "@/sanity/lib/enums";
import type { Locale } from "@/lib/i18n/config";
import type { SanityImageSource } from "@sanity/image-url";

export interface PlantCardData {
  name: { en?: string; hi?: string; gu?: string };
  slug: { current: string };
  categories?: string[];
  image?: { asset: SanityImageSource } | null;
  availability?: string;
}

interface PlantCardProps {
  plant: PlantCardData;
  locale: Locale;
}

export function PlantCard({ plant, locale }: PlantCardProps) {
  const name = getLocalized(plant.name, locale);
  const imageAsset = plant.image?.asset;
  const imageUrl = imageAsset
    ? urlForImage(imageAsset).width(400).height(300).fit("crop").url()
    : null;
  const avail = AVAILABILITY.find((a) => a.value === plant.availability);

  return (
    <Link href={`/${locale}/plants/${plant.slug.current}`}>
      <Card hover className="h-full flex flex-col">
        <div className="relative aspect-[4/3] bg-border">
          {imageUrl ? (
            <Image src={imageUrl} alt={name} fill className="object-cover" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-muted text-4xl">
              🌿
            </div>
          )}
        </div>
        <div className="p-3 flex flex-col gap-1.5 flex-1">
          <p className="font-semibold text-foreground text-sm leading-snug line-clamp-2">{name}</p>
          {avail && (
            <Badge
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
              {avail.label}
            </Badge>
          )}
        </div>
      </Card>
    </Link>
  );
}
