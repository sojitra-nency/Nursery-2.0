import Link from "next/link";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { PlantCard, type PlantCardData } from "@/components/ui/PlantCard";
import { Reveal } from "@/components/ui/Reveal";
import { ArrowRightIcon } from "@/components/ui/icons";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionary-type";

interface FeaturedPlantsSectionProps {
  plants: PlantCardData[];
  locale: Locale;
  dict: Dictionary;
}

export function FeaturedPlantsSection({ plants, locale, dict }: FeaturedPlantsSectionProps) {
  if (!plants.length) return null;

  return (
    <section className="py-16 md:py-24 bg-surface">
      <div className="container mx-auto px-4">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-x-4 gap-y-2 md:mb-10">
          <SectionHeading
            eyebrow={dict.home.plantsEyebrow}
            title={dict.home.featuredPlants}
            className="mb-0 min-w-0"
          />
          <Link
            href={`/${locale}/catalog`}
            className="link-focus group ms-auto inline-flex shrink-0 items-center gap-1 pb-1 text-sm font-medium text-accent transition-colors hover:text-accent-dark"
          >
            {dict.common.viewAll}
            <ArrowRightIcon className="rtl-flip h-4 w-4 transition-transform duration-200 ltr:group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5" />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
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
