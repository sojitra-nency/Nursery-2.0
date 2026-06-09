"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback } from "react";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { AVAILABILITY } from "@/sanity/lib/enums";

interface Category {
  title: { en?: string };
  slug: { current: string };
}

interface CatalogFiltersProps {
  categories: Category[];
  dict: Dictionary;
}

export function CatalogFilters({ categories, dict }: CatalogFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const q = searchParams.get("q") ?? "";
  const category = searchParams.get("category") ?? "";
  const availability = searchParams.get("availability") ?? "";
  const sort = searchParams.get("sort") ?? "";

  const update = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [router, pathname, searchParams]
  );

  const clearAll = () => {
    router.replace(pathname, { scroll: false });
  };

  const hasFilters = q || category || availability || sort;

  return (
    <div className="flex flex-col gap-3 mb-6">
      {/* Search */}
      <input
        type="search"
        value={q}
        onChange={(e) => update("q", e.target.value)}
        placeholder={dict.catalog.searchPlaceholder}
        className="w-full md:max-w-sm px-4 py-2 rounded-lg border border-border bg-surface text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent"
      />

      <div className="flex flex-wrap gap-2 items-center">
        {/* Category chips */}
        <button
          onClick={() => update("category", "")}
          className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
            !category
              ? "bg-accent text-white border-accent"
              : "bg-surface border-border text-muted hover:border-accent"
          }`}
        >
          {dict.catalog.allCategories}
        </button>
        {categories.map((cat) => (
          <button
            key={cat.slug.current}
            onClick={() => update("category", cat.slug.current)}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
              category === cat.slug.current
                ? "bg-accent text-white border-accent"
                : "bg-surface border-border text-muted hover:border-accent"
            }`}
          >
            {cat.title.en ?? cat.slug.current}
          </button>
        ))}

        {/* Availability chips */}
        {AVAILABILITY.map((a) => (
          <button
            key={a.value}
            onClick={() => update("availability", availability === a.value ? "" : a.value)}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
              availability === a.value
                ? "bg-accent text-white border-accent"
                : "bg-surface border-border text-muted hover:border-accent"
            }`}
          >
            {a.label}
          </button>
        ))}

        {/* Sort */}
        <select
          value={sort}
          onChange={(e) => update("sort", e.target.value)}
          className="px-3 py-1 rounded-lg border border-border bg-surface text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-accent ml-auto"
        >
          <option value="">{dict.catalog.sortBy}</option>
          <option value="name_asc">{dict.catalog.sortNameAsc}</option>
          <option value="name_desc">{dict.catalog.sortNameDesc}</option>
          <option value="newest">{dict.catalog.sortNewest}</option>
        </select>

        {/* Clear */}
        {hasFilters && (
          <button
            onClick={clearAll}
            className="px-3 py-1 rounded-full text-xs font-medium text-accent border border-accent hover:bg-accent/10 transition-colors"
          >
            {dict.catalog.clearFilters}
          </button>
        )}
      </div>
    </div>
  );
}
