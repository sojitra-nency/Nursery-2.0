import Link from "next/link";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getSettings } from "@/lib/site";
import { sanityFetch } from "@/sanity/lib/fetch";
import { USED_CATEGORIES_QUERY, FEATURED_PLANTS_QUERY } from "@/sanity/lib/queries";
import { HeroSection } from "@/components/sections/HeroSection";
import { FeaturedCategoriesSection } from "@/components/sections/FeaturedCategoriesSection";
import { FeaturedPlantsSection } from "@/components/sections/FeaturedPlantsSection";
import { Reveal } from "@/components/ui/Reveal";
import type { PlantCardData } from "@/components/ui/PlantCard";
import { getLocalized } from "@/lib/i18n/getLocalized";
import { formatHours } from "@/lib/hours";
import type { Locale } from "@/lib/i18n/config";

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const [dict, settings, categories, plants] = await Promise.all([
    getDictionary(locale),
    getSettings(),
    sanityFetch<string[]>(USED_CATEGORIES_QUERY, {}, ["plant"]),
    sanityFetch<PlantCardData[]>(FEATURED_PLANTS_QUERY, {}, ["plant"]),
  ]);

  const typedLocale = locale as Locale;
  const description = getLocalized(settings.description, typedLocale);
  const hours = formatHours(settings, typedLocale, dict.contact.openEveryDay);

  return (
    <>
      <HeroSection settings={settings} locale={typedLocale} dict={dict} />
      <FeaturedCategoriesSection categories={categories ?? []} locale={typedLocale} dict={dict} />
      <FeaturedPlantsSection plants={plants ?? []} locale={typedLocale} dict={dict} />

      {/* About teaser */}
      {description && (
        <section className="py-16 bg-background">
          <Reveal className="container mx-auto px-4 max-w-3xl text-center">
            <h2 className="font-display text-3xl md:text-4xl font-semibold tracking-tight text-foreground mb-4">
              {dict.home.aboutTeaser}
            </h2>
            <p className="text-muted leading-relaxed mb-6">{description}</p>
            <Link
              href={`/${locale}/about`}
              className="link-focus text-accent font-medium hover:text-accent-dark"
            >
              {dict.common.learnMore} →
            </Link>
          </Reveal>
        </section>
      )}

      {/* Visit teaser */}
      <section className="py-16 bg-accent text-white">
        <Reveal className="container mx-auto px-4 text-center">
          <h2 className="font-display text-3xl md:text-4xl font-semibold tracking-tight mb-3">
            {dict.home.visitTeaser}
          </h2>
          <p className="text-white/80 mb-6">{hours}</p>
          <Link
            href={`/${locale}/visit`}
            className="inline-flex items-center px-6 py-3 bg-white text-accent font-semibold rounded-lg transition-[transform,background-color] duration-200 hover:bg-white/90 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-accent"
          >
            {dict.contact.getDirections} →
          </Link>
        </Reveal>
      </section>
    </>
  );
}
