import Link from "next/link";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { PlantCard } from "@/components/ui/PlantCard";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import type { SanityImageSource } from "@sanity/image-url";

interface Plant {
  name: { en?: string; hi?: string; gu?: string };
  slug: { current: string };
  images?: Array<{ asset: SanityImageSource }>;
  availability?: string;
  category?: { slug: { current: string } };
}

interface FeaturedPlantsSectionProps {
  plants: Plant[];
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
            className="text-sm text-accent hover:text-accent-dark font-medium"
          >
            {dict.common.viewAll} →
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {plants.map((plant) => (
            <PlantCard key={plant.slug.current} plant={plant} locale={locale} />
          ))}
        </div>
      </div>
    </section>
  );
}
