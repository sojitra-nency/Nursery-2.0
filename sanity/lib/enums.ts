export const AVAILABILITY = [
  { value: "in_stock", label: "In Stock", key: "inStock" },
  { value: "limited", label: "Limited", key: "limited" },
  { value: "out_of_stock", label: "Out of Stock", key: "outOfStock" },
  { value: "coming_soon", label: "Coming Soon", key: "comingSoon" },
] as const;

export const SUNLIGHT = [
  { value: "full_sun", label: "Full Sun" },
  { value: "partial_shade", label: "Partial Shade" },
  { value: "shade", label: "Shade" },
  { value: "bright_indirect", label: "Bright Indirect" },
] as const;

export const WATERING = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
] as const;

export const GROWTH_RATE = [
  { value: "slow", label: "Slow" },
  { value: "medium", label: "Medium" },
  { value: "fast", label: "Fast" },
] as const;
