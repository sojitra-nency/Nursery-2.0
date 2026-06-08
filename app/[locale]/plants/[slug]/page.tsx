import { notFound } from "next/navigation";
import Image from "next/image";
import type { SanityImageSource } from "@sanity/image-url";
import { sanityFetch } from "@/sanity/lib/fetch";
import { PLANT_BY_SLUG_QUERY } from "@/sanity/lib/queries";
import { urlForImage } from "@/sanity/lib/image";
import { getLocalized } from "@/lib/i18n/getLocalized";
import type { Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { Badge } from "@/components/ui/Badge";
import { AVAILABILITY } from "@/sanity/lib/enums";

export default async function PlantPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const dict = await getDictionary(locale);

  const plant = await sanityFetch<{
    _id: string;
    name: { en?: string; hi?: string; gu?: string };
    description: { en?: string; hi?: string; gu?: string };
    images: Array<{ asset: SanityImageSource; alt?: { en?: string }; _key: string }>;
    availability: string;
    sunlight: string;
    watering: string;
  }>(PLANT_BY_SLUG_QUERY, { slug }, ["plant"]);

  if (!plant) notFound();

  const name = getLocalized(plant.name, locale as Locale);
  const description = getLocalized(plant.description, locale as Locale);
  const primary = plant.images?.[0];
  const imageUrl = primary ? urlForImage(primary.asset).width(880).height(660).url() : null;

  const avail = AVAILABILITY.find((a) => a.value === plant.availability);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {imageUrl && (
          <div className="relative aspect-[4/3] rounded-xl overflow-hidden">
            <Image src={imageUrl} alt={name} fill className="object-cover" />
          </div>
        )}
        <div className="space-y-4">
          <h1 className="text-3xl font-bold text-foreground">{name}</h1>
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
              {dict.common[avail.key as keyof typeof dict.common] ?? avail.label}
            </Badge>
          )}
          {description && <p className="text-muted leading-relaxed">{description}</p>}
        </div>
      </div>
    </div>
  );
}
