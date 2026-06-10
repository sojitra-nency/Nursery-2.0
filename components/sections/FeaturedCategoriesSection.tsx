import Link from "next/link";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";

interface FeaturedCategoriesSectionProps {
  categories: string[];
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
        <div className="flex flex-wrap gap-3">
          {categories.map((cat) => (
            <Link
              key={cat}
              href={`/${locale}/catalog?category=${encodeURIComponent(cat)}`}
              className="px-4 py-2 rounded-full text-sm font-medium border border-border bg-surface text-foreground hover:border-accent hover:text-accent transition-colors"
            >
              {cat}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
