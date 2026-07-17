import type { Metadata } from "next";
import Link from "next/link";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getSettings } from "@/lib/site";
import { sanityFetch } from "@/sanity/lib/fetch";
import { USED_CATEGORIES_QUERY, FEATURED_PLANTS_QUERY } from "@/sanity/lib/queries";
import { HeroSection } from "@/components/sections/HeroSection";
import { FeaturedCategoriesSection } from "@/components/sections/FeaturedCategoriesSection";
import { FeaturedPlantsSection } from "@/components/sections/FeaturedPlantsSection";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ArrowRightIcon, ClockIcon, MapPinIcon } from "@/components/ui/icons";
import { LeafSprig } from "@/components/ui/botanicals";
import type { PlantCardData } from "@/components/ui/PlantCard";
import { getLocalized } from "@/lib/i18n/getLocalized";
import { formatHours } from "@/lib/hours";
import { hasLocale, type Locale } from "@/lib/i18n/config";
import { buildMetadata } from "@/lib/seo/metadata";
import { NURSERY_NAME } from "@/lib/constants";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(locale)) return {};
  const dict = await getDictionary(locale);
  return buildMetadata({
    title: NURSERY_NAME,
    titleAbsolute: true,
    description: dict.seo.defaultDescription,
    locale,
  });
}

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
        <section className="py-16 md:py-24 bg-background">
          <Reveal className="container mx-auto px-4 max-w-3xl text-center">
            <SectionHeading
              eyebrow={dict.home.aboutEyebrow}
              title={dict.home.aboutTeaser}
              center
              className="mb-4"
            />
            <p className="text-muted text-lg leading-relaxed text-balance mb-6">{description}</p>
            <Link
              href={`/${locale}/about`}
              className="link-focus group inline-flex items-center gap-1 text-accent font-medium hover:text-accent-dark transition-colors"
            >
              {dict.common.learnMore}
              <ArrowRightIcon className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
            </Link>
          </Reveal>
        </section>
      )}

      {/* Visit teaser — botanical CTA band */}
      <section className="pb-16 md:pb-24 bg-background">
        <div className="container mx-auto px-4">
          <Reveal className="relative overflow-hidden rounded-3xl bg-accent px-6 py-14 md:py-20 text-center text-on-accent shadow-lift">
            <div aria-hidden="true" className="pointer-events-none absolute inset-0">
              <div className="absolute inset-0 bg-gradient-to-br from-on-accent/10 via-transparent to-accent-dark/50" />
              <div className="absolute -left-12 -bottom-16 rotate-[24deg]">
                <LeafSprig className="h-64 w-auto text-on-accent/15 md:h-80" />
              </div>
              <div className="absolute -right-12 -top-16 rotate-[204deg]">
                <LeafSprig className="h-64 w-auto text-on-accent/15 md:h-80" />
              </div>
            </div>
            <div className="relative">
              <h2 className="font-display text-3xl md:text-5xl font-semibold tracking-tight text-balance mb-4">
                {dict.home.visitTeaser}
              </h2>
              <p className="mb-8 inline-flex items-center gap-2 rounded-full bg-on-accent/10 px-4 py-1.5 text-sm text-on-accent/90">
                <ClockIcon className="h-4 w-4" />
                {hours}
              </p>
              <div className="flex justify-center">
                <Link
                  href={`/${locale}/visit`}
                  className="group inline-flex items-center gap-2 px-7 py-3 bg-on-accent text-accent font-semibold rounded-full shadow-soft transition-[transform,background-color,box-shadow] duration-200 hover:bg-on-accent/90 hover:shadow-lift active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-on-accent focus-visible:ring-offset-2 focus-visible:ring-offset-accent"
                >
                  <MapPinIcon className="h-4 w-4" />
                  {dict.contact.getDirections}
                  <ArrowRightIcon className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
