import Link from "next/link";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getSettings } from "@/lib/site";
import { sanityFetch } from "@/sanity/lib/fetch";
import { FEATURED_CATEGORIES_QUERY, FEATURED_PLANTS_QUERY } from "@/sanity/lib/queries";
import { HeroSection } from "@/components/sections/HeroSection";
import { FeaturedCategoriesSection } from "@/components/sections/FeaturedCategoriesSection";
import { FeaturedPlantsSection } from "@/components/sections/FeaturedPlantsSection";
import { getLocalized } from "@/lib/i18n/getLocalized";
import type { Locale } from "@/lib/i18n/config";
import type { SanityImageSource } from "@sanity/image-url";

interface Category {
  title: { en?: string; hi?: string; gu?: string };
  slug: { current: string };
  heroImage?: { asset: SanityImageSource };
}

interface Plant {
  name: { en?: string; hi?: string; gu?: string };
  slug: { current: string };
  images?: Array<{ asset: SanityImageSource }>;
  availability?: string;
  category?: { slug: { current: string } };
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const [dict, settings, categories, plants] = await Promise.all([
    getDictionary(locale),
    getSettings(),
    sanityFetch<Category[]>(FEATURED_CATEGORIES_QUERY, {}, ["category"]),
    sanityFetch<Plant[]>(FEATURED_PLANTS_QUERY, {}, ["plant"]),
  ]);

  const typedLocale = locale as Locale;
  const description = getLocalized(settings.description, typedLocale);

  return (
    <>
      <HeroSection settings={settings} locale={typedLocale} dict={dict} />
      <FeaturedCategoriesSection categories={categories ?? []} locale={typedLocale} dict={dict} />
      <FeaturedPlantsSection plants={plants ?? []} locale={typedLocale} dict={dict} />

      {/* About teaser */}
      {description && (
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4 max-w-3xl text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              {dict.home.aboutTeaser}
            </h2>
            <p className="text-muted leading-relaxed mb-6">{description}</p>
            <Link
              href={`/${locale}/about`}
              className="text-accent font-medium hover:text-accent-dark"
            >
              {dict.common.learnMore} →
            </Link>
          </div>
        </section>
      )}

      {/* Visit teaser */}
      <section className="py-16 bg-accent text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-3">{dict.home.visitTeaser}</h2>
          <p className="text-white/80 mb-6">{dict.contact.openingHours}</p>
          <Link
            href={`/${locale}/visit`}
            className="inline-flex items-center px-6 py-3 bg-white text-accent font-semibold rounded-lg hover:bg-white/90 transition-colors"
          >
            {dict.contact.getDirections} →
          </Link>
        </div>
      </section>
    </>
  );
}
