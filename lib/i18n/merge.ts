function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

/**
 * Overlay a partial translation onto the English base.
 *
 * Every key in the result is guaranteed present, so a missing translation renders
 * readable English rather than `undefined` or an empty element that collapses the
 * layout. Blank/whitespace values count as missing — an empty string in a catalog
 * is a gap, never an intentional override.
 *
 * Lives outside `dictionaries.ts` because that module is `server-only` and this is
 * a pure function with no server dependency — keeping it here lets it be unit
 * tested directly.
 */
export function mergeDictionary<T>(base: T, overlay: unknown): T {
  if (!isPlainObject(base) || !isPlainObject(overlay)) return base;

  const out: Record<string, unknown> = { ...base };
  for (const [key, baseValue] of Object.entries(base)) {
    const overlayValue = overlay[key];
    if (isPlainObject(baseValue)) {
      out[key] = mergeDictionary(baseValue, overlayValue);
    } else if (typeof overlayValue === "string" && overlayValue.trim() !== "") {
      out[key] = overlayValue;
    }
  }
  return out as T;
}
