import Link from "next/link";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { Chip } from "@/components/ui/Chip";
import { ArrowRightIcon } from "@/components/ui/icons";
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
    <section className="py-16 md:py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="flex items-baseline justify-between gap-4 mb-8">
          <SectionHeading title={dict.home.featuredCategories} className="mb-0" />
          <Link
            href={`/${locale}/catalog`}
            className="link-focus group inline-flex shrink-0 items-center gap-1 text-sm text-accent hover:text-accent-dark font-medium transition-colors"
          >
            {dict.common.viewAll}
            <ArrowRightIcon className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
          </Link>
        </div>
        <div className="flex flex-wrap gap-3">
          {categories.map((cat, i) => (
            <Reveal key={cat} index={i}>
              <Chip href={`/${locale}/catalog?category=${encodeURIComponent(cat)}`} size="md">
                {cat}
              </Chip>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
