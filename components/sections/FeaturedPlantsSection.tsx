import Link from "next/link";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { PlantCard, type PlantCardData } from "@/components/ui/PlantCard";
import { Reveal } from "@/components/ui/Reveal";
import { ArrowRightIcon } from "@/components/ui/icons";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";

interface FeaturedPlantsSectionProps {
  plants: PlantCardData[];
  locale: Locale;
  dict: Dictionary;
}

export function FeaturedPlantsSection({ plants, locale, dict }: FeaturedPlantsSectionProps) {
  if (!plants.length) return null;

  return (
    <section className="py-16 md:py-20 bg-surface">
      <div className="container mx-auto px-4">
        <div className="flex items-baseline justify-between gap-4 mb-8">
          <SectionHeading title={dict.home.featuredPlants} className="mb-0" />
          <Link
            href={`/${locale}/catalog`}
            className="link-focus group inline-flex shrink-0 items-center gap-1 text-sm text-accent hover:text-accent-dark font-medium transition-colors"
          >
            {dict.common.viewAll}
            <ArrowRightIcon className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {plants.map((plant, i) => (
            <Reveal key={plant.slug.current} index={i} className="h-full">
              <PlantCard plant={plant} locale={locale} dict={dict} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
