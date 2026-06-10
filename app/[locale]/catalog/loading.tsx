import { PlantGridSkeleton } from "@/components/ui/PlantCardSkeleton";

export default function CatalogLoading() {
  return (
    <div className="container mx-auto px-4 py-10">
      <div className="skeleton mb-8 h-9 w-48 rounded" />
      <div className="mb-6 flex flex-wrap gap-3">
        <div className="skeleton h-10 w-full max-w-sm rounded-lg" />
        <div className="skeleton h-10 w-32 rounded-lg" />
      </div>
      <PlantGridSkeleton count={8} />
    </div>
  );
}
