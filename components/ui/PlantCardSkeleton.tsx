import { Card } from "./Card";

/** Loading placeholder matching the PlantCard layout. */
export function PlantCardSkeleton() {
  return (
    <Card className="h-full flex flex-col">
      <div className="skeleton aspect-[4/3]" />
      <div className="p-3.5 flex flex-col gap-2 flex-1">
        <div className="skeleton h-4 w-3/4 rounded" />
        <div className="skeleton h-6 w-20 rounded-full" />
      </div>
    </Card>
  );
}

/** A grid of skeleton cards for catalog loading states. */
export function PlantGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <PlantCardSkeleton key={i} />
      ))}
    </div>
  );
}
