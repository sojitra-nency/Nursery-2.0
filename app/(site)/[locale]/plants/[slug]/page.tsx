import { cache } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { sanityFetch } from "@/sanity/lib/fetch";
import { PLANT_BY_SLUG_QUERY, PLANT_SLUGS_QUERY, RELATED_PLANTS_QUERY } from "@/sanity/lib/queries";
import { urlForImage } from "@/sanity/lib/image";
import { getLocalized } from "@/lib/i18n/getLocalized";
import { localizeCategory } from "@/lib/i18n/categories";
import { interpolate } from "@/lib/i18n/format";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getSettings } from "@/lib/site";
import { hasLocale, locales, type Locale } from "@/lib/i18n/config";
import { buildMetadata } from "@/lib/seo/metadata";
import { productJsonLd, breadcrumbJsonLd } from "@/lib/seo/jsonld";
import { SITE_DOMAIN, NURSERY_NAME, DEFAULT_PHONE } from "@/lib/constants";
import { VarietyShowcase, type ShowcaseVariety } from "@/components/plant/VarietyShowcase";
import { PlantCard, type PlantCardData } from "@/components/ui/PlantCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Badge } from "@/components/ui/Badge";
import { ChevronRightIcon, LeafIcon, WhatsAppIcon } from "@/components/ui/icons";
import type { PlantData, PlantImage } from "@/lib/types/plant";

const breadcrumbLinkClass = "link-focus transition-colors hover:text-foreground";

/** Fetch a plant once per request — shared by generateMetadata and the page. */
const getPlant = cache((slug: string) =>
  sanityFetch<PlantData>(PLANT_BY_SLUG_QUERY, { slug }, ["plant"])
);

/** Primary image asset: first variety image, else first plant image. */
function primaryAsset(plant: PlantData) {
  return plant.varieties?.[0]?.images?.[0]?.asset ?? plant.images?.[0]?.asset;
}

export async function generateStaticParams() {
  const slugs = await sanityFetch<Array<{ slug: string }>>(PLANT_SLUGS_QUERY, {}, ["plant"]);
  if (!slugs) return [];
  return slugs.flatMap(({ slug }) => locales.map((locale) => ({ locale, slug })));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!hasLocale(locale)) return {};

  const plant = await getPlant(slug);
  if (!plant) return {};

  const name = getLocalized(plant.name, locale);
  const dict = await getDictionary(locale);
  const description = getLocalized(plant.description, locale) || dict.seo.defaultDescription;
  const asset = primaryAsset(plant);
  const imageUrl = asset ? urlForImage(asset).width(1200).height(630).fit("crop").url() : undefined;

  return buildMetadata({ title: name, description, imageUrl, slug: `plants/${slug}`, locale });
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
  if (!hasLocale(locale)) notFound();

  const [dict, settings, plant] = await Promise.all([
    getDictionary(locale),
    getSettings(),
    getPlant(slug),
  ]);

  if (!plant) notFound();

  const name = getLocalized(plant.name, locale);
  const description = getLocalized(plant.description, locale);
  const careTips = getLocalized(plant.careTips, locale);
  const nurseryName = getLocalized(settings.name, locale) || NURSERY_NAME;
  const whatsapp = settings.whatsapp || DEFAULT_PHONE;
  // Prefilled in the visitor's own language — see HeroSection for the reasoning.
  const waText = encodeURIComponent(
    interpolate(dict.contact.whatsappPlant, { plant: name, nursery: nurseryName })
  );
  const waLink = `https://wa.me/91${whatsapp}?text=${waText}`;
  const categories = plant.categories ?? [];
  // Stored as English strings so the owner can invent new ones; translated for
  // display, falling back to the stored text for anything not in the catalog.
  const primaryCategory = categories[0];
  const primaryCategoryLabel = primaryCategory ? localizeCategory(primaryCategory, dict) : "";

  // Build the showcase varieties. If the plant has none, fall back to a single
  // "default" variety built from the plant-level images + description.
  const varieties: ShowcaseVariety[] = (plant.varieties ?? []).length
    ? (plant.varieties ?? []).map((v) => ({
        key: v._key,
        name: getLocalized(v.name, locale),
        description: getLocalized(v.description, locale),
        sizeRange: v.sizeRange,
        bagSizes: v.bagSizes,
        availability: v.availability,
        sunlight: v.sunlight,
        watering: v.watering,
        growthRate: v.growthRate,
        maxHeight: v.maxHeight,
        bloomSeason: v.bloomSeason,
        images: prepareImages(v.images, locale, name),
      }))
    : [
        {
          key: "default",
          name: "",
          description,
          images: prepareImages(plant.images, locale, name),
        },
      ];

  const related =
    categories.length > 0
      ? await sanityFetch<PlantCardData[]>(RELATED_PLANTS_QUERY, { categories, slug }, ["plant"])
      : null;

  // Structured data (reuses the existing, previously-unwired helpers).
  const asset = primaryAsset(plant);
  const imageUrl = asset ? urlForImage(asset).width(1200).height(630).fit("crop").url() : undefined;
  const productLd = productJsonLd({
    name,
    description: description || undefined,
    imageUrl,
    slug,
    availability: plant.varieties?.[0]?.availability ?? "in_stock",
    locale,
  });
  const breadcrumbLd = breadcrumbJsonLd([
    { name: dict.nav.home, url: `${SITE_DOMAIN}/${locale}` },
    { name: dict.nav.catalog, url: `${SITE_DOMAIN}/${locale}/catalog` },
    ...(primaryCategory
      ? [
          {
            name: primaryCategoryLabel,
            url: `${SITE_DOMAIN}/${locale}/catalog?category=${encodeURIComponent(primaryCategory)}`,
          },
        ]
      : []),
    { name, url: `${SITE_DOMAIN}/${locale}/plants/${slug}` },
  ]);

  return (
    <div className="container mx-auto px-4 py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />

      {/* Breadcrumb */}
      <nav aria-label={dict.common.breadcrumb} className="mb-6">
        <ol className="flex flex-wrap items-center gap-1.5 text-sm text-muted">
          <li>
            <Link href={`/${locale}`} className={breadcrumbLinkClass}>
              {dict.nav.home}
            </Link>
          </li>
          <li aria-hidden="true">
            <ChevronRightIcon className="rtl-flip h-3.5 w-3.5 text-muted/70" />
          </li>
          <li>
            <Link href={`/${locale}/catalog`} className={breadcrumbLinkClass}>
              {dict.nav.catalog}
            </Link>
          </li>
          {primaryCategory && (
            <>
              <li aria-hidden="true">
                <ChevronRightIcon className="rtl-flip h-3.5 w-3.5 text-muted/70" />
              </li>
              <li>
                <Link
                  href={`/${locale}/catalog?category=${encodeURIComponent(primaryCategory)}`}
                  className={breadcrumbLinkClass}
                >
                  {primaryCategoryLabel}
                </Link>
              </li>
            </>
          )}
          <li aria-hidden="true">
            <ChevronRightIcon className="rtl-flip h-3.5 w-3.5 text-muted/70" />
          </li>
          <li aria-current="page" className="font-medium text-foreground">
            {name}
          </li>
        </ol>
      </nav>

      {/* Title */}
      <div className="mb-6">
        <h1 className="font-display text-3xl md:text-4xl font-semibold tracking-tight text-balance text-foreground">
          {name}
        </h1>
        {plant.scientificName && <p className="text-muted italic mt-1">{plant.scientificName}</p>}
        <div className="flex gap-2 mt-3 flex-wrap">
          {plant.fragrant && (
            <Badge tone="accent">
              <span aria-hidden="true">🌸</span> {dict.plant.fragrant}
            </Badge>
          )}
          {plant.petSafe && (
            <Badge tone="accent">
              <span aria-hidden="true">🐾</span> {dict.plant.petFriendly}
            </Badge>
          )}
        </div>
      </div>

      {/* Description (plant-level) */}
      {description && plant.varieties?.length ? (
        <p className="text-muted leading-relaxed max-w-3xl mb-8">{description}</p>
      ) : null}

      {/* Varieties + per-variety gallery & care */}
      <VarietyShowcase
        varieties={varieties}
        fallbackName={name}
        dict={dict}
        locale={locale}
        currency={settings.currency}
      />

      {/* Care tips + WhatsApp CTA */}
      <div className="max-w-xl mt-8 space-y-5">
        {careTips && (
          <div className="rounded-xl border border-border bg-surface p-4">
            <h2 className="flex items-center gap-2 font-semibold text-foreground text-sm mb-1.5">
              <LeafIcon className="h-4 w-4 text-accent" />
              {dict.plant.careTips}
            </h2>
            <p className="text-muted text-sm leading-relaxed">{careTips}</p>
          </div>
        )}
        <a
          href={waLink}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full py-3 bg-whatsapp text-on-whatsapp font-semibold rounded-full shadow-soft transition-[background-color,box-shadow,transform] duration-200 hover:bg-whatsapp-dark hover:shadow-lift active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-whatsapp focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <WhatsAppIcon className="h-5 w-5" />
          {dict.plant.whatsappCta}
        </a>
      </div>

      {/* Related plants */}
      {related && related.length > 0 && (
        <section className="mt-16">
          <SectionHeading title={dict.plant.relatedPlants} />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {related.map((p) => (
              <PlantCard key={p.slug.current} plant={p} locale={locale} dict={dict} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
