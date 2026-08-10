import Link from "next/link";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { ArrowRightIcon, LeafIcon } from "@/components/ui/icons";
import type { Locale } from "@/lib/i18n/config";
import { localizeCategory } from "@/lib/i18n/categories";
import type { Dictionary } from "@/lib/i18n/dictionary-type";

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
    <section className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-x-4 gap-y-2 md:mb-10">
          <SectionHeading
            eyebrow={dict.home.categoriesEyebrow}
            title={dict.home.featuredCategories}
            className="mb-0 min-w-0"
          />
          <Link
            href={`/${locale}/catalog`}
            className="link-focus group ms-auto inline-flex shrink-0 items-center gap-1 pb-1 text-sm font-medium text-accent transition-colors hover:text-accent-dark"
          >
            {dict.common.viewAll}
            <ArrowRightIcon className="rtl-flip h-4 w-4 transition-transform duration-200 ltr:group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5" />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {categories.map((cat, i) => (
            <Reveal key={cat} index={i} className="h-full">
              <Link
                href={`/${locale}/catalog?category=${encodeURIComponent(cat)}`}
                className="link-focus group flex h-full items-center gap-3 rounded-2xl border border-border bg-surface p-4 transition-[border-color,background-color,transform,box-shadow] duration-300 ease-soft hover:-translate-y-0.5 hover:border-accent/40 hover:bg-accent/5 hover:shadow-soft"
              >
                <span
                  aria-hidden="true"
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent transition-colors duration-300 group-hover:bg-accent group-hover:text-on-accent"
                >
                  <LeafIcon className="h-5 w-5" />
                </span>
                <span className="min-w-0 flex-1 text-sm leading-snug font-medium text-foreground">
                  {localizeCategory(cat, dict)}
                </span>
                <ArrowRightIcon
                  aria-hidden="true"
                  className="rtl-flip h-4 w-4 shrink-0 text-accent opacity-0 transition-all duration-300 ltr:-translate-x-1 ltr:group-hover:translate-x-0 rtl:translate-x-1 rtl:group-hover:translate-x-0 group-hover:opacity-100"
                />
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
