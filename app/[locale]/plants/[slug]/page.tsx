import { notFound } from "next/navigation";
import { sanityFetch } from "@/sanity/lib/fetch";
import { PLANT_BY_SLUG_QUERY, PLANT_SLUGS_QUERY, RELATED_PLANTS_QUERY } from "@/sanity/lib/queries";
import { urlForImage } from "@/sanity/lib/image";
import { getLocalized } from "@/lib/i18n/getLocalized";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getSettings } from "@/lib/site";
import type { Locale } from "@/lib/i18n/config";
import { AVAILABILITY } from "@/sanity/lib/enums";
import { Badge } from "@/components/ui/Badge";
import { ImageGallery } from "@/components/plant/ImageGallery";
import { CareGuideTable } from "@/components/plant/CareGuideTable";
import { PlantCard } from "@/components/ui/PlantCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { SanityImageSource } from "@sanity/image-url";

interface PlantData {
  _id: string;
  name: { en?: string; hi?: string; gu?: string };
  scientificName?: string;
  slug: { current: string };
  description?: { en?: string; hi?: string; gu?: string };
  category?: { _id: string; title: { en?: string }; slug: { current: string } };
  images?: Array<{
    _key: string;
    asset: SanityImageSource;
    alt?: { en?: string };
    hotspot?: unknown;
  }>;
  sunlight?: string;
  watering?: string;
  growthRate?: string;
  availability?: string;
  size?: string;
  floweringSeason?: string;
}

interface RelatedPlant {
  name: { en?: string; hi?: string; gu?: string };
  slug: { current: string };
  images?: Array<{ asset: SanityImageSource }>;
  availability?: string;
  category?: { slug: { current: string } };
}

export async function generateStaticParams() {
  const slugs = await sanityFetch<Array<{ slug: string }>>(PLANT_SLUGS_QUERY, {}, ["plant"]);
  if (!slugs) return [];
  const locales = ["en", "hi", "gu"];
  return slugs.flatMap(({ slug }) => locales.map((locale) => ({ locale, slug })));
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
  const avail = AVAILABILITY.find((a) => a.value === plant.availability);
  const whatsapp = settings.whatsapp || "9876543210";
  const waText = encodeURIComponent(`Hi, I'm interested in ${name} from Greenskill Landscape`);
  const waLink = `https://wa.me/91${whatsapp}?text=${waText}`;

  const galleryImages = (plant.images ?? [])
    .filter((img) => img?.asset)
    .map((img) => ({
      _key: img._key,
      url: urlForImage(img.asset).width(880).height(660).fit("crop").url(),
      alt: img.alt?.en ?? name,
    }));

  const related = plant.category?._id
    ? await sanityFetch<RelatedPlant[]>(RELATED_PLANTS_QUERY, { catId: plant.category._id, slug }, [
        "plant",
      ])
    : null;

  return (
    <div className="container mx-auto px-4 py-10">
      {/* Breadcrumb */}
      <nav className="text-sm text-muted mb-6 flex gap-2">
        <a href={`/${locale}`} className="hover:text-foreground">
          Home
        </a>
        <span>/</span>
        <a href={`/${locale}/catalog`} className="hover:text-foreground">
          {dict.nav.catalog}
        </a>
        {plant.category && (
          <>
            <span>/</span>
            <a
              href={`/${locale}/categories/${plant.category.slug.current}`}
              className="hover:text-foreground"
            >
              {plant.category.title.en}
            </a>
          </>
        )}
        <span>/</span>
        <span className="text-foreground">{name}</span>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Gallery */}
        <ImageGallery images={galleryImages} name={name} />

        {/* Info */}
        <div className="space-y-5">
          <div>
            <h1 className="text-3xl font-bold text-foreground">{name}</h1>
            {plant.scientificName && (
              <p className="text-muted italic mt-1">{plant.scientificName}</p>
            )}
          </div>

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

          {description && <p className="text-muted leading-relaxed">{description}</p>}

          <CareGuideTable
            sunlight={plant.sunlight}
            watering={plant.watering}
            growthRate={plant.growthRate}
            size={plant.size}
            floweringSeason={plant.floweringSeason}
            dict={dict}
          />

          {/* WhatsApp CTA */}
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-3 bg-[#25D366] text-white font-semibold rounded-xl hover:bg-[#1ebe5d] transition-colors"
          >
            💬 {dict.plant.whatsappCta}
          </a>
        </div>
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
