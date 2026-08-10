import { Button } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ArrowRightIcon } from "@/components/ui/icons";
import { PlantCard, type PlantCardData } from "@/components/ui/PlantCard";
import type { Dictionary } from "@/lib/i18n/dictionary-type";
import type { Locale } from "@/lib/i18n/config";

interface ExplorePlantsSectionProps {
  plants: PlantCardData[];
  locale: Locale;
  dict: Dictionary;
}

/**
 * "Explore other plants" — the widest step of the discovery ladder, shown at the foot
 * of both the plant and variety pages.
 *
 * Sits last on purpose: a visitor who has scrolled past the variety they came for is
 * browsing, not deciding, so widening the net here costs nothing. The "browse all"
 * button follows the grid rather than sitting beside the heading, which keeps it in
 * thumb reach at the end of the scroll on a phone.
 */
export function ExplorePlantsSection({ plants, locale, dict }: ExplorePlantsSectionProps) {
  if (plants.length === 0) return null;

  // `SectionHeading` renders the h2 but exposes no id, so name the region directly.
  return (
    <section className="mt-16" aria-label={dict.plant.exploreOtherPlants}>
      <SectionHeading title={dict.plant.exploreOtherPlants} />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
        {plants.map((plant) => (
          <PlantCard key={plant.slug.current} plant={plant} locale={locale} dict={dict} />
        ))}
      </div>
      <div className="mt-6 flex justify-center">
        <Button href={`/${locale}/catalog`} variant="outline">
          {dict.plant.browseAllPlants}
          <ArrowRightIcon className="rtl-flip h-4 w-4" />
        </Button>
      </div>
    </section>
  );
}
