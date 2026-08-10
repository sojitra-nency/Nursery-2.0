import { cache } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { sanityFetch } from "@/sanity/lib/fetch";
import { PLANT_BY_SLUG_QUERY, PLANT_SLUGS_QUERY, RELATED_PLANTS_QUERY } from "@/sanity/lib/queries";
import { urlForImage } from "@/sanity/lib/image";
import { getLocalized } from "@/lib/i18n/getLocalized";
import { localizeCategory } from "@/lib/i18n/categories";
import { interpolate, pluralize } from "@/lib/i18n/format";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getSettings } from "@/lib/site";
import { hasLocale, locales } from "@/lib/i18n/config";
import { buildMetadata } from "@/lib/seo/metadata";
import { productJsonLd, breadcrumbJsonLd } from "@/lib/seo/jsonld";
import { SITE_DOMAIN, NURSERY_NAME, DEFAULT_PHONE } from "@/lib/constants";
import { varietySlugs } from "@/lib/plant/variety";
import { prepareGalleryImages, preparePlantHeroImages } from "@/lib/plant/gallery";
import { VarietyGallery } from "@/components/plant/VarietyGallery";
import { VarietyDetailPanel } from "@/components/plant/VarietyDetailPanel";
import { VarietiesSection, VARIETIES_SECTION_ID } from "@/components/plant/VarietiesSection";
import type { VarietyGridItem } from "@/components/plant/VarietyCardGrid";
import { ExplorePlantsSection } from "@/components/plant/ExplorePlantsSection";
import type { PlantCardData } from "@/components/ui/PlantCard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ChevronRightIcon, GridIcon, LeafIcon, WhatsAppIcon } from "@/components/ui/icons";
import type { PlantData } from "@/lib/types/plant";

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

  const varieties = plant.varieties ?? [];
  /**
   * With two or more varieties this page becomes a chooser: the hero previews the
   * range and the varieties grid is the call to action, each card opening a real
   * product page. With one (or none) there is nothing to choose, so the plant page
   * keeps showing that variety's care guide and pricing inline — otherwise a
   * single-variety plant would hide its own details behind a pointless extra click.
   */
  const isChooser = varieties.length > 1;
  const slugs = varietySlugs(varieties);

  const heroImages = isChooser
    ? preparePlantHeroImages(plant.images, varieties, locale, name)
    : prepareGalleryImages(varieties[0]?.images ?? plant.images, locale, name);

  const varietyItems: VarietyGridItem[] = isChooser
    ? varieties.map((variety, i) => ({
        variety: { ...variety, image: variety.images?.[0] },
        varietySlug: slugs[i],
        plantSlug: slug,
        fallbackName: name,
      }))
    : [];

  const soleVariety = !isChooser ? varieties[0] : undefined;

  const varietyCountLabel = pluralize(
    varieties.length,
    { one: dict.plant.varietyCountOne, other: dict.plant.varietyCount },
    locale
  );

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
        <h1 className="font-display text-3xl font-semibold tracking-tight text-balance text-foreground md:text-4xl">
          {name}
        </h1>
        {plant.scientificName && <p className="mt-1 text-muted italic">{plant.scientificName}</p>}
        <div className="mt-3 flex flex-wrap gap-2">
          {isChooser && (
            <Badge tone="accent">
              <GridIcon className="h-3.5 w-3.5" />
              {varietyCountLabel}
            </Badge>
          )}
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

      {/* Hero: gallery + either the variety chooser prompt or the sole variety's detail */}
      <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
        <VarietyGallery images={heroImages} name={name} dict={dict} locale={locale} priority />

        <div className="space-y-5">
          {description && <p className="leading-relaxed text-muted">{description}</p>}

          {isChooser ? (
            // The jump link is the bridge between "keep the hero" and "don't let the
            // varieties get skipped": on a phone the grid starts below the fold, so
            // the hero has to say out loud that there is a choice waiting.
            <div className="rounded-2xl border border-accent/25 bg-accent/5 p-4">
              <p className="flex items-center gap-2 font-semibold text-foreground">
                <GridIcon className="h-5 w-5 shrink-0 text-accent" />
                {dict.plant.varietiesEyebrow}
              </p>
              <p className="mt-1 text-sm text-muted">{dict.plant.varietiesHint}</p>
              <Button href={`#${VARIETIES_SECTION_ID}`} className="mt-3 w-full sm:w-auto">
                {dict.plant.seeVarieties}
                <ChevronRightIcon className="rtl-flip h-4 w-4" />
              </Button>
            </div>
          ) : (
            soleVariety && (
              <VarietyDetailPanel
                variety={{
                  key: soleVariety._key,
                  name: getLocalized(soleVariety.name, locale) || name,
                  description: getLocalized(soleVariety.description, locale),
                  sizeRange: soleVariety.sizeRange,
                  bagSizes: soleVariety.bagSizes,
                  availability: soleVariety.availability,
                  sunlight: soleVariety.sunlight,
                  watering: soleVariety.watering,
                  growthRate: soleVariety.growthRate,
                  maxHeight: soleVariety.maxHeight,
                  bloomSeason: soleVariety.bloomSeason,
                }}
                dict={dict}
                locale={locale}
                currency={settings.currency}
              />
            )
          )}

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

      {/* All varieties, as tappable cards — the primary action on this page. */}
      <VarietiesSection
        items={varietyItems}
        locale={locale}
        dict={dict}
        currency={settings.currency}
      />

      {/* Care tips */}
      {careTips && (
        <div className="mt-8 max-w-xl rounded-xl border border-border bg-surface p-4">
          <h2 className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-foreground">
            <LeafIcon className="h-4 w-4 text-accent" />
            {dict.plant.careTips}
          </h2>
          <p className="text-sm leading-relaxed text-muted">{careTips}</p>
        </div>
      )}

      {/* Explore other plants */}
      <ExplorePlantsSection plants={related ?? []} locale={locale} dict={dict} />
    </div>
  );
}
