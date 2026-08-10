import { cache } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { sanityFetch } from "@/sanity/lib/fetch";
import {
  PLANT_BY_SLUG_QUERY,
  PLANT_VARIETY_PATHS_QUERY,
  RELATED_PLANTS_QUERY,
} from "@/sanity/lib/queries";
import { urlForImage } from "@/sanity/lib/image";
import { getLocalized } from "@/lib/i18n/getLocalized";
import { localizeCategory } from "@/lib/i18n/categories";
import { interpolate } from "@/lib/i18n/format";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getSettings } from "@/lib/site";
import { hasLocale, locales } from "@/lib/i18n/config";
import { buildMetadata } from "@/lib/seo/metadata";
import { productJsonLd, breadcrumbJsonLd } from "@/lib/seo/jsonld";
import { SITE_DOMAIN, NURSERY_NAME, DEFAULT_PHONE } from "@/lib/constants";
import { findVarietyBySlug, varietySlugs } from "@/lib/plant/variety";
import { VarietyGallery } from "@/components/plant/VarietyGallery";
import { VarietyDetailPanel } from "@/components/plant/VarietyDetailPanel";
import { VarietyCardGrid, type VarietyGridItem } from "@/components/plant/VarietyCardGrid";
import { ExplorePlantsSection } from "@/components/plant/ExplorePlantsSection";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { PlantCardData } from "@/components/ui/PlantCard";
import { ChevronRightIcon, WhatsAppIcon } from "@/components/ui/icons";
import { prepareGalleryImages } from "@/lib/plant/gallery";
import type { PlantData, PlantVariety } from "@/lib/types/plant";

const breadcrumbLinkClass = "link-focus transition-colors hover:text-foreground";

/** Fetch a plant once per request — shared by generateMetadata and the page. */
const getPlant = cache((slug: string) =>
  sanityFetch<PlantData>(PLANT_BY_SLUG_QUERY, { slug }, ["plant"])
);

/**
 * A variety only earns its own page when there is a choice to be made. With zero or
 * one variety the plant page already *is* the product page, so pointing a second URL
 * at the same content would split its ranking signals and give people two links for
 * one thing.
 */
function hasVarietyPages(plant: PlantData): boolean {
  return (plant.varieties?.length ?? 0) > 1;
}

export async function generateStaticParams() {
  const plants = await sanityFetch<Array<{ slug: string; varieties?: PlantVariety[] }>>(
    PLANT_VARIETY_PATHS_QUERY,
    {},
    ["plant"]
  );
  if (!plants) return [];

  return plants.flatMap(({ slug, varieties }) => {
    const list = varieties ?? [];
    if (list.length <= 1) return [];
    return varietySlugs(list).flatMap((variety) =>
      locales.map((locale) => ({ locale, slug, variety }))
    );
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string; variety: string }>;
}): Promise<Metadata> {
  const { locale, slug, variety } = await params;
  if (!hasLocale(locale)) return {};

  const plant = await getPlant(slug);
  if (!plant) return {};

  const match = findVarietyBySlug(plant.varieties ?? [], variety);
  if (!match) return {};

  const dict = await getDictionary(locale);
  const plantName = getLocalized(plant.name, locale);
  const varietyName = getLocalized(match.variety.name, locale) || plantName;
  // "Kesar — Mango" reads as a product in a search result and in a shared link
  // preview; the bare variety name alone would be meaningless out of context.
  const title = varietyName === plantName ? plantName : `${varietyName} — ${plantName}`;
  const description =
    getLocalized(match.variety.description, locale) ||
    getLocalized(plant.description, locale) ||
    dict.seo.defaultDescription;

  const asset = match.variety.images?.[0]?.asset ?? plant.varieties?.[0]?.images?.[0]?.asset;
  const imageUrl = asset ? urlForImage(asset).width(1200).height(630).fit("crop").url() : undefined;

  return buildMetadata({
    title,
    description,
    imageUrl,
    slug: `plants/${slug}/${match.slug}`,
    locale,
  });
}

export default async function VarietyPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string; variety: string }>;
}) {
  const { locale, slug, variety: varietyParam } = await params;
  if (!hasLocale(locale)) notFound();

  const [dict, settings, plant] = await Promise.all([
    getDictionary(locale),
    getSettings(),
    getPlant(slug),
  ]);

  if (!plant) notFound();

  const plantHref = `/${locale}/plants/${slug}`;
  if (!hasVarietyPages(plant)) redirect(plantHref);

  const varieties = plant.varieties ?? [];
  const match = findVarietyBySlug(varieties, varietyParam);
  if (!match) notFound();

  // Reached via a stale link or a raw `_key`: send it to the canonical URL rather
  // than serving the same product from two addresses.
  if (match.slug !== varietyParam) redirect(`${plantHref}/${match.slug}`);

  const slugs = varietySlugs(varieties);
  const plantName = getLocalized(plant.name, locale);
  const varietyName = getLocalized(match.variety.name, locale) || plantName;
  const description = getLocalized(match.variety.description, locale);

  const nurseryName = getLocalized(settings.name, locale) || NURSERY_NAME;
  const whatsapp = settings.whatsapp || DEFAULT_PHONE;
  // Prefilled with the *variety* — a dealer messaging about Kesar shouldn't have to
  // retype which mango they meant.
  const waText = encodeURIComponent(
    interpolate(dict.contact.whatsappPlant, {
      plant: varietyName === plantName ? plantName : `${varietyName} (${plantName})`,
      nursery: nurseryName,
    })
  );
  const waLink = `https://wa.me/91${whatsapp}?text=${waText}`;

  const categories = plant.categories ?? [];
  const primaryCategory = categories[0];
  const primaryCategoryLabel = primaryCategory ? localizeCategory(primaryCategory, dict) : "";

  const images = prepareGalleryImages(match.variety.images, locale, varietyName);

  // Discovery: siblings first (same plant, a direct swap), then the wider catalog.
  const siblings: VarietyGridItem[] = varieties
    .map((v, i) => ({ v, varietySlug: slugs[i] }))
    .filter(({ v }) => v._key !== match.variety._key)
    .map(({ v, varietySlug }) => ({
      variety: { ...v, image: v.images?.[0] },
      varietySlug,
      plantSlug: slug,
      fallbackName: plantName,
    }));

  const related =
    categories.length > 0
      ? await sanityFetch<PlantCardData[]>(RELATED_PLANTS_QUERY, { categories, slug }, ["plant"])
      : null;

  const canonicalPath = `${SITE_DOMAIN}/${locale}/plants/${slug}/${match.slug}`;
  const productLd = productJsonLd({
    name: varietyName === plantName ? plantName : `${plantName} — ${varietyName}`,
    description: description || getLocalized(plant.description, locale) || undefined,
    imageUrl: images[0]?.url,
    slug: `${slug}/${match.slug}`,
    availability: match.variety.availability ?? "in_stock",
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
    { name: plantName, url: `${SITE_DOMAIN}/${locale}/plants/${slug}` },
    { name: varietyName, url: canonicalPath },
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
          <li aria-hidden="true">
            <ChevronRightIcon className="rtl-flip h-3.5 w-3.5 text-muted/70" />
          </li>
          <li>
            <Link href={plantHref} className={breadcrumbLinkClass}>
              {plantName}
            </Link>
          </li>
          <li aria-hidden="true">
            <ChevronRightIcon className="rtl-flip h-3.5 w-3.5 text-muted/70" />
          </li>
          <li aria-current="page" className="font-medium text-foreground">
            {varietyName}
          </li>
        </ol>
      </nav>

      <div className="mb-6">
        {/* The parent plant is a link, not decoration: it's the way back to the
            sibling varieties, and the breadcrumb alone is easy to miss on a phone. */}
        <Link
          href={plantHref}
          className="link-focus inline-flex items-center gap-1.5 text-sm font-medium text-accent transition-colors hover:text-accent-dark"
        >
          {interpolate(dict.plant.varietyOf, { plant: plantName })}
        </Link>
        <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight text-balance text-foreground md:text-4xl">
          {varietyName}
        </h1>
        {plant.scientificName && <p className="mt-1 text-muted italic">{plant.scientificName}</p>}
      </div>

      <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
        <VarietyGallery images={images} name={varietyName} dict={dict} locale={locale} priority />
        <div className="space-y-5">
          <VarietyDetailPanel
            variety={{
              key: match.variety._key,
              name: varietyName,
              description,
              sizeRange: match.variety.sizeRange,
              bagSizes: match.variety.bagSizes,
              availability: match.variety.availability,
              sunlight: match.variety.sunlight,
              watering: match.variety.watering,
              growthRate: match.variety.growthRate,
              maxHeight: match.variety.maxHeight,
              bloomSeason: match.variety.bloomSeason,
            }}
            dict={dict}
            locale={locale}
            currency={settings.currency}
          />
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center justify-center gap-2 rounded-full bg-whatsapp py-3 font-semibold text-on-whatsapp shadow-soft transition-[background-color,box-shadow,transform] duration-200 hover:bg-whatsapp-dark hover:shadow-lift focus-visible:ring-2 focus-visible:ring-whatsapp focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none active:scale-[0.99]"
          >
            <WhatsAppIcon className="h-5 w-5" />
            {dict.plant.whatsappCta}
          </a>
        </div>
      </div>

      {/* Discovery 1 — swap to another variety of the same plant. */}
      {siblings.length > 0 && (
        <section
          className="mt-16"
          aria-label={interpolate(dict.plant.otherVarieties, { plant: plantName })}
        >
          <SectionHeading
            eyebrow={dict.plant.varietiesEyebrow}
            title={interpolate(dict.plant.otherVarieties, { plant: plantName })}
          />
          <VarietyCardGrid
            items={siblings}
            locale={locale}
            dict={dict}
            currency={settings.currency}
          />
        </section>
      )}

      {/* Discovery 2 — widen to the rest of the catalog. */}
      <ExplorePlantsSection plants={related ?? []} locale={locale} dict={dict} />
    </div>
  );
}
