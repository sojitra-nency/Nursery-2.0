import { notFound } from "next/navigation";
import { sanityFetch } from "@/sanity/lib/fetch";
import { PLANT_BY_SLUG_QUERY, PLANT_SLUGS_QUERY, RELATED_PLANTS_QUERY } from "@/sanity/lib/queries";
import { urlForImage } from "@/sanity/lib/image";
import { getLocalized } from "@/lib/i18n/getLocalized";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getSettings } from "@/lib/site";
import type { Locale } from "@/lib/i18n/config";
import { VarietyShowcase, type ShowcaseVariety } from "@/components/plant/VarietyShowcase";
import { PlantCard, type PlantCardData } from "@/components/ui/PlantCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { SanityImageSource } from "@sanity/image-url";

type LocaleField = { en?: string; hi?: string; gu?: string };

interface PlantImage {
  _key: string;
  asset: SanityImageSource;
  alt?: LocaleField;
  caption?: LocaleField;
}

interface PriceTier {
  minQty: number;
  maxQty?: number;
  price: number;
}

interface BagSizePricing {
  size: string;
  tiers: PriceTier[];
}

interface PlantVariety {
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

interface PlantData {
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

export async function generateStaticParams() {
  const slugs = await sanityFetch<Array<{ slug: string }>>(PLANT_SLUGS_QUERY, {}, ["plant"]);
  if (!slugs) return [];
  const locales = ["en", "hi", "gu"];
  return slugs.flatMap(({ slug }) => locales.map((locale) => ({ locale, slug })));
}

function prepareImages(images: PlantImage[] | undefined, locale: Locale, fallbackAlt: string) {
  return (images ?? [])
    .filter((img) => img?.asset)
    .map((img) => ({
      key: img._key,
      url: urlForImage(img.asset).width(880).height(660).fit("crop").url(),
      alt: getLocalized(img.alt, locale) || fallbackAlt,
    }));
}

export default async function PlantPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const typedLocale = locale as Locale;

  const [dict, settings, plant] = await Promise.all([
    getDictionary(locale),
    getSettings(),
    sanityFetch<PlantData>(PLANT_BY_SLUG_QUERY, { slug }, ["plant"]),
  ]);

  if (!plant) notFound();

  const name = getLocalized(plant.name, typedLocale);
  const description = getLocalized(plant.description, typedLocale);
  const careTips = getLocalized(plant.careTips, typedLocale);
  const whatsapp = settings.whatsapp || "9876543210";
  const waText = encodeURIComponent(`Hi, I'm interested in ${name} from Greenskill Landscape`);
  const waLink = `https://wa.me/91${whatsapp}?text=${waText}`;

  // Build the showcase varieties. If the plant has none, fall back to a single
  // "default" variety built from the plant-level images + description.
  const varieties: ShowcaseVariety[] = (plant.varieties ?? []).length
    ? (plant.varieties ?? []).map((v) => ({
        key: v._key,
        name: getLocalized(v.name, typedLocale),
        description: getLocalized(v.description, typedLocale),
        sizeRange: v.sizeRange,
        bagSizes: v.bagSizes,
        availability: v.availability,
        sunlight: v.sunlight,
        watering: v.watering,
        growthRate: v.growthRate,
        maxHeight: v.maxHeight,
        bloomSeason: v.bloomSeason,
        images: prepareImages(v.images, typedLocale, name),
      }))
    : [
        {
          key: "default",
          name: "",
          description,
          images: prepareImages(plant.images, typedLocale, name),
        },
      ];

  const categories = plant.categories ?? [];
  const related =
    categories.length > 0
      ? await sanityFetch<PlantCardData[]>(RELATED_PLANTS_QUERY, { categories, slug }, ["plant"])
      : null;

  return (
    <div className="container mx-auto px-4 py-10">
      {/* Breadcrumb */}
      <nav className="text-sm text-muted mb-6 flex gap-2 flex-wrap">
        <a href={`/${locale}`} className="hover:text-foreground">
          Home
        </a>
        <span>/</span>
        <a href={`/${locale}/catalog`} className="hover:text-foreground">
          {dict.nav.catalog}
        </a>
        {categories[0] && (
          <>
            <span>/</span>
            <a
              href={`/${locale}/catalog?category=${encodeURIComponent(categories[0])}`}
              className="hover:text-foreground"
            >
              {categories[0]}
            </a>
          </>
        )}
        <span>/</span>
        <span className="text-foreground">{name}</span>
      </nav>

      {/* Title */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">{name}</h1>
        {plant.scientificName && <p className="text-muted italic mt-1">{plant.scientificName}</p>}
        <div className="flex gap-2 mt-3 flex-wrap">
          {plant.fragrant && (
            <span className="px-2.5 py-0.5 rounded-full bg-accent/10 text-accent text-xs font-medium">
              🌸 Fragrant
            </span>
          )}
          {plant.petSafe && (
            <span className="px-2.5 py-0.5 rounded-full bg-accent/10 text-accent text-xs font-medium">
              🐾 Pet-Friendly
            </span>
          )}
        </div>
      </div>

      {/* Description (plant-level) */}
      {description && plant.varieties?.length ? (
        <p className="text-muted leading-relaxed max-w-3xl mb-8">{description}</p>
      ) : null}

      {/* Varieties + per-variety gallery & care */}
      <VarietyShowcase varieties={varieties} fallbackName={name} dict={dict} />

      {/* Care tips + WhatsApp CTA */}
      <div className="max-w-xl mt-8 space-y-5">
        {careTips && (
          <div className="rounded-xl border border-border bg-surface p-4">
            <h3 className="font-semibold text-foreground text-sm mb-1">Care Tips</h3>
            <p className="text-muted text-sm leading-relaxed">{careTips}</p>
          </div>
        )}
        <a
          href={waLink}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full py-3 bg-[#25D366] text-white font-semibold rounded-xl hover:bg-[#1ebe5d] transition-colors"
        >
          💬 {dict.plant.whatsappCta}
        </a>
      </div>

      {/* Related plants */}
      {related && related.length > 0 && (
        <section className="mt-16">
          <SectionHeading title={dict.plant.relatedPlants} />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {related.map((p) => (
              <PlantCard key={p.slug.current} plant={p} locale={typedLocale} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
