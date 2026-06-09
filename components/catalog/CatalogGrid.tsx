import { PlantCard } from "@/components/ui/PlantCard";
import type { Locale } from "@/lib/i18n/config";
import type { SanityImageSource } from "@sanity/image-url";

interface Plant {
  name: { en?: string; hi?: string; gu?: string };
  slug: { current: string };
  images?: Array<{ asset: SanityImageSource }>;
  availability?: string;
  category?: { slug: { current: string } };
}

interface CatalogGridProps {
  plants: Plant[];
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
