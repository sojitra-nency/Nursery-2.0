import { PlantGridSkeleton } from "@/components/ui/PlantCardSkeleton";

export default function CatalogLoading() {
  return (
    <div className="container mx-auto px-4 py-10">
      <div className="mb-8 space-y-3">
        <div className="skeleton h-9 w-48 rounded" />
        <div className="skeleton h-4 w-32 rounded" />
      </div>
      <div className="mb-6 flex flex-col gap-3">
        <div className="skeleton h-10 w-full max-w-sm rounded-full" />
        <div className="flex flex-wrap gap-2">
          <div className="skeleton h-8 w-28 rounded-full" />
          <div className="skeleton h-8 w-24 rounded-full" />
          <div className="skeleton h-8 w-32 rounded-full" />
        </div>
      </div>
      <PlantGridSkeleton count={8} />
    </div>
  );
}
