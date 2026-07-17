"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Chip } from "@/components/ui/Chip";
import { ChevronDownIcon, SearchIcon, XIcon } from "@/components/ui/icons";
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
      <div className="relative w-full md:max-w-sm">
        <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <input
          id="catalog-search"
          type="search"
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          placeholder={dict.catalog.searchPlaceholder}
          aria-label={dict.catalog.searchPlaceholder}
          className="h-10 w-full rounded-full border border-border bg-surface pl-10 pr-4 text-sm text-foreground placeholder:text-muted transition-colors hover:border-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        />
      </div>

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
        <div className="relative ml-auto">
          <select
            id="catalog-sort"
            value={sort}
            onChange={(e) => update("sort", e.target.value)}
            aria-label={dict.catalog.sortBy}
            className="h-8 cursor-pointer appearance-none rounded-full border border-border bg-surface pl-3 pr-8 text-xs font-medium text-foreground transition-colors hover:border-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <option value="">{dict.catalog.sortBy}</option>
            <option value="name_asc">{dict.catalog.sortNameAsc}</option>
            <option value="name_desc">{dict.catalog.sortNameDesc}</option>
            <option value="newest">{dict.catalog.sortNewest}</option>
          </select>
          <ChevronDownIcon className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        </div>

        {/* Clear */}
        {hasFilters && (
          <button
            type="button"
            onClick={clearAll}
            className="inline-flex h-8 cursor-pointer items-center gap-1 rounded-full border border-accent px-3 text-xs font-medium text-accent transition-colors hover:bg-accent/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <XIcon className="h-3.5 w-3.5" />
            {dict.catalog.clearFilters}
          </button>
        )}
      </div>
    </div>
  );
}
