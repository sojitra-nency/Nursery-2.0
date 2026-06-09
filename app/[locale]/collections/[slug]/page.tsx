import { notFound } from "next/navigation";
import { sanityFetch } from "@/sanity/lib/fetch";
import {
  COLLECTION_BY_SLUG_QUERY,
  COLLECTION_SLUGS_QUERY,
  PLANTS_BY_COLLECTION_QUERY,
} from "@/sanity/lib/queries";
import { getLocalized } from "@/lib/i18n/getLocalized";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { CatalogGrid } from "@/components/catalog/CatalogGrid";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { Locale } from "@/lib/i18n/config";
import type { SanityImageSource } from "@sanity/image-url";

interface CollectionData {
  title: { en?: string; hi?: string; gu?: string };
  slug: { current: string };
  description?: { en?: string; hi?: string; gu?: string };
}

export async function generateStaticParams() {
  const slugs = await sanityFetch<Array<{ slug: string }>>(COLLECTION_SLUGS_QUERY, {}, [
    "collection",
  ]);
  if (!slugs) return [];
  const locales = ["en", "hi", "gu"];
  return slugs.flatMap(({ slug }) => locales.map((locale) => ({ locale, slug })));
}

export default async function CollectionPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const typedLocale = locale as Locale;

  const [dict, collection, plants] = await Promise.all([
    getDictionary(locale),
    sanityFetch<CollectionData>(COLLECTION_BY_SLUG_QUERY, { slug }, ["collection"]),
    sanityFetch<
      Array<{
        name: { en?: string; hi?: string; gu?: string };
        slug: { current: string };
        images?: Array<{ asset: SanityImageSource }>;
        availability?: string;
        category?: { slug: { current: string } };
      }>
    >(PLANTS_BY_COLLECTION_QUERY, { slug }, ["plant"]),
  ]);

  if (!collection) notFound();

  const title = getLocalized(collection.title, typedLocale);
  const description = getLocalized(collection.description, typedLocale);

  return (
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

      <SectionHeading title={title} subtitle={description || undefined} />

      {plants && plants.length > 0 ? (
        <CatalogGrid plants={plants} locale={typedLocale} />
      ) : (
        <p className="text-muted py-20 text-center">{dict.catalog.noResults}</p>
      )}
    </div>
  );
}
