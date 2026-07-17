import { PlantCard, type PlantCardData } from "@/components/ui/PlantCard";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/config";

interface CatalogGridProps {
  plants: PlantCardData[];
  locale: Locale;
  dict: Dictionary;
}

export function CatalogGrid({ plants, locale, dict }: CatalogGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {plants.map((plant) => (
        <PlantCard key={plant.slug.current} plant={plant} locale={locale} dict={dict} />
      ))}
    </div>
  );
}
