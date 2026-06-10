import Link from "next/link";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
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
            className="link-focus text-sm text-accent hover:text-accent-dark font-medium"
          >
            {dict.common.viewAll} →
          </Link>
        </div>
        <div className="flex flex-wrap gap-3">
          {categories.map((cat, i) => (
            <Reveal key={cat} index={i}>
              <Link
                href={`/${locale}/catalog?category=${encodeURIComponent(cat)}`}
                className="inline-block px-4 py-2 rounded-full text-sm font-medium border border-border bg-surface text-foreground transition-colors hover:border-accent hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                {cat}
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
