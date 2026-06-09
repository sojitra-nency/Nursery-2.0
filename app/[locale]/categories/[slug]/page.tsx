import { notFound } from "next/navigation";
import Image from "next/image";
import { sanityFetch } from "@/sanity/lib/fetch";
import {
  CATEGORY_BY_SLUG_QUERY,
  CATEGORY_SLUGS_QUERY,
  PLANTS_BY_CATEGORY_QUERY,
} from "@/sanity/lib/queries";
import { urlForImage } from "@/sanity/lib/image";
import { getLocalized } from "@/lib/i18n/getLocalized";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { CatalogGrid } from "@/components/catalog/CatalogGrid";
import type { Locale } from "@/lib/i18n/config";
import type { SanityImageSource } from "@sanity/image-url";

interface CategoryData {
  title: { en?: string; hi?: string; gu?: string };
  slug: { current: string };
  description?: { en?: string; hi?: string; gu?: string };
  heroImage?: { asset: SanityImageSource };
}

export async function generateStaticParams() {
  const slugs = await sanityFetch<Array<{ slug: string }>>(CATEGORY_SLUGS_QUERY, {}, ["category"]);
  if (!slugs) return [];
  const locales = ["en", "hi", "gu"];
  return slugs.flatMap(({ slug }) => locales.map((locale) => ({ locale, slug })));
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const typedLocale = locale as Locale;

  const [dict, category, plants] = await Promise.all([
    getDictionary(locale),
    sanityFetch<CategoryData>(CATEGORY_BY_SLUG_QUERY, { slug }, ["category"]),
    sanityFetch<
      Array<{
        name: { en?: string; hi?: string; gu?: string };
        slug: { current: string };
        images?: Array<{ asset: SanityImageSource }>;
        availability?: string;
        category?: { slug: { current: string } };
      }>
    >(PLANTS_BY_CATEGORY_QUERY, { slug }, ["plant"]),
  ]);

  if (!category) notFound();

  const title = getLocalized(category.title, typedLocale);
  const description = getLocalized(category.description, typedLocale);
  const heroUrl = category.heroImage?.asset
    ? urlForImage(category.heroImage.asset).width(1400).height(400).fit("crop").url()
    : null;

  return (
    <div>
      {/* Hero banner */}
      <div className="relative h-48 md:h-64 bg-accent/10">
        {heroUrl && <Image src={heroUrl} alt={title} fill className="object-cover" />}
        <div className="absolute inset-0 bg-black/40 flex items-end">
          <div className="container mx-auto px-4 pb-6">
            <h1 className="text-3xl md:text-4xl font-bold text-white">{title}</h1>
            {description && <p className="text-white/80 mt-1 text-sm">{description}</p>}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10">
        <nav className="text-sm text-muted mb-6 flex gap-2">
          <a href={`/${locale}`} className="hover:text-foreground">
            Home
          </a>
          <span>/</span>
          <a href={`/${locale}/catalog`} className="hover:text-foreground">
            {dict.nav.catalog}
          </a>
          <span>/</span>
          <span className="text-foreground">{title}</span>
        </nav>

        {plants && plants.length > 0 ? (
          <CatalogGrid plants={plants} locale={typedLocale} />
        ) : (
          <p className="text-muted py-20 text-center">{dict.catalog.noResults}</p>
        )}
      </div>
    </div>
  );
}
