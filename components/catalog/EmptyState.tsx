import { Button } from "@/components/ui/Button";
import { LeafIcon } from "@/components/ui/icons";
import type { Dictionary } from "@/lib/i18n/dictionary-type";

interface EmptyStateProps {
  dict: Dictionary;
  /** Link target that resets all filters (server contexts). */
  clearHref?: string;
  /** Click handler that resets all filters (client contexts). */
  onClear?: () => void;
}

export function EmptyState({ dict, clearHref, onClear }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div
        aria-hidden="true"
        className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-accent/10"
      >
        <LeafIcon className="h-9 w-9 text-accent" />
      </div>
      <h3 className="text-xl font-semibold text-foreground mb-2">{dict.catalog.noResults}</h3>
      <p className="text-muted mb-6 max-w-sm">{dict.catalog.noResultsHint}</p>
      {clearHref ? (
        <Button variant="secondary" href={clearHref}>
          {dict.catalog.clearFilters}
        </Button>
      ) : onClear ? (
        <Button variant="secondary" onClick={onClear}>
          {dict.catalog.clearFilters}
        </Button>
      ) : null}
    </div>
  );
}
