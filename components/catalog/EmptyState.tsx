import { Button } from "@/components/ui/Button";
import type { Dictionary } from "@/lib/i18n/dictionaries";

interface EmptyStateProps {
  dict: Dictionary;
  onClear?: () => void;
}

export function EmptyState({ dict, onClear }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="text-6xl mb-4">🌱</div>
      <h3 className="text-xl font-semibold text-foreground mb-2">{dict.catalog.noResults}</h3>
      <p className="text-muted mb-6">{dict.catalog.noResultsHint}</p>
      {onClear && (
        <Button variant="secondary" onClick={onClear}>
          {dict.catalog.clearFilters}
        </Button>
      )}
    </div>
  );
}
