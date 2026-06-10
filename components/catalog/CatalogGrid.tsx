import { PlantCard, type PlantCardData } from "@/components/ui/PlantCard";
import type { Locale } from "@/lib/i18n/config";

interface CatalogGridProps {
  plants: PlantCardData[];
  locale: Locale;
}

export function CatalogGrid({ plants, locale }: CatalogGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {plants.map((plant) => (
        <PlantCard key={plant.slug.current} plant={plant} locale={locale} />
      ))}
    </div>
  );
}
