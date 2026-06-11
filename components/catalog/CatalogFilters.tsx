"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Chip } from "@/components/ui/Chip";
import type { Dictionary } from "@/lib/i18n/dictionaries";

interface CatalogFiltersProps {
  categories: string[];
  dict: Dictionary;
}

export function CatalogFilters({ categories, dict }: CatalogFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const q = searchParams.get("q") ?? "";
  const category = searchParams.get("category") ?? "";
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

  // Debounce the search term so we don't fire a navigation + refetch per keystroke.
  const [term, setTerm] = useState(q);

  // Keep the local input in sync when `q` changes externally (e.g. Clear).
  // Adjust state during render — the idiom already used in VarietyShowcase —
  // rather than an effect, which the lint config disallows for prop→state sync.
  const [prevQ, setPrevQ] = useState(q);
  if (prevQ !== q) {
    setPrevQ(q);
    setTerm(q);
  }

  useEffect(() => {
    if (term === q) return;
    const id = setTimeout(() => update("q", term), 300);
    return () => clearTimeout(id);
  }, [term, q, update]);

  const clearAll = () => {
    router.replace(pathname, { scroll: false });
  };

  const hasFilters = q || category || sort;

  return (
    <div className="flex flex-col gap-3 mb-6">
      {/* Search */}
      <label htmlFor="catalog-search" className="sr-only">
        {dict.catalog.searchPlaceholder}
      </label>
      <input
        id="catalog-search"
        type="search"
        value={term}
        onChange={(e) => setTerm(e.target.value)}
        placeholder={dict.catalog.searchPlaceholder}
        aria-label={dict.catalog.searchPlaceholder}
        className="w-full md:max-w-sm px-4 py-2 rounded-lg border border-border bg-surface text-sm text-foreground placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      />

      <div className="flex flex-wrap gap-2 items-center">
        {/* Category chips */}
        <Chip active={!category} onClick={() => update("category", "")}>
          {dict.catalog.allCategories}
        </Chip>
        {categories.map((cat) => (
          <Chip key={cat} active={category === cat} onClick={() => update("category", cat)}>
            {cat}
          </Chip>
        ))}

        {/* Sort */}
        <label htmlFor="catalog-sort" className="sr-only">
          {dict.catalog.sortBy}
        </label>
        <select
          id="catalog-sort"
          value={sort}
          onChange={(e) => update("sort", e.target.value)}
          aria-label={dict.catalog.sortBy}
          className="px-3 py-1 rounded-lg border border-border bg-surface text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ml-auto"
        >
          <option value="">{dict.catalog.sortBy}</option>
          <option value="name_asc">{dict.catalog.sortNameAsc}</option>
          <option value="name_desc">{dict.catalog.sortNameDesc}</option>
          <option value="newest">{dict.catalog.sortNewest}</option>
        </select>

        {/* Clear */}
        {hasFilters && (
          <button
            type="button"
            onClick={clearAll}
            className="px-3 py-1 rounded-full text-xs font-medium text-accent border border-accent hover:bg-accent/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            {dict.catalog.clearFilters}
          </button>
        )}
      </div>
    </div>
  );
}
