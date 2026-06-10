import Link from "next/link";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { PlantCard, type PlantCardData } from "@/components/ui/PlantCard";
import { Reveal } from "@/components/ui/Reveal";
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
    <section className="py-16 bg-surface">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <SectionHeading title={dict.home.featuredPlants} />
          <Link
            href={`/${locale}/catalog`}
            className="link-focus text-sm text-accent hover:text-accent-dark font-medium"
          >
            {dict.common.viewAll} →
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {plants.map((plant, i) => (
            <Reveal key={plant.slug.current} index={i}>
              <PlantCard plant={plant} locale={locale} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
