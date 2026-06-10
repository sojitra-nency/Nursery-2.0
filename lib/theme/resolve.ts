import { presetByKey, tokensToCssVars, THEME_TOKEN_KEYS, type TokenMap } from "./presets";
import type { ThemeSettings } from "@/lib/site";

/**
 * Resolves the admin-selected theme into a flat map of CSS custom properties
 * (`--color-*`) to inject as an inline `style` on `<html>`.
 *
 * - `preset === "custom"`: start from the default preset and overlay any provided
 *   custom hexes (partial-safe — empty fields keep the default value).
 * - any other preset key: use that preset's token map.
 * - `undefined` (Sanity unconfigured / FALLBACK): default preset, which equals the
 *   `@theme` defaults in globals.css, so the inline style is a harmless no-op.
 */
export function resolveThemeVars(theme?: ThemeSettings): Record<string, string> {
  if (theme?.preset === "custom") {
    const merged = { ...presetByKey(undefined).tokens } as TokenMap;
    for (const k of THEME_TOKEN_KEYS) {
      const value = theme[k];
      if (value) merged[k] = value;
    }
    return tokensToCssVars(merged);
  }
  return tokensToCssVars(presetByKey(theme?.preset).tokens);
}
