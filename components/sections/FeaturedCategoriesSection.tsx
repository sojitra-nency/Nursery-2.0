import Link from "next/link";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { CategoryCard } from "@/components/ui/CategoryCard";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import type { SanityImageSource } from "@sanity/image-url";

interface Category {
  title: { en?: string; hi?: string; gu?: string };
  slug: { current: string };
  heroImage?: { asset: SanityImageSource };
}

interface FeaturedCategoriesSectionProps {
  categories: Category[];
  locale: Locale;
  dict: Dictionary;
}

export function FeaturedCategoriesSection({
  categories,
  locale,
  dict,
}: FeaturedCategoriesSectionProps) {
  if (!categories.length) return null;

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <SectionHeading title={dict.home.featuredCategories} />
          <Link
            href={`/${locale}/catalog`}
            className="text-sm text-accent hover:text-accent-dark font-medium"
          >
            {dict.common.viewAll} →
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <CategoryCard key={cat.slug.current} category={cat} locale={locale} />
          ))}
        </div>
      </div>
    </section>
  );
}
