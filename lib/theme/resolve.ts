import { presetByKey, tokensToCssVars, THEME_TOKEN_KEYS, type TokenMap } from "./presets";
import type { ThemeSettings } from "@/lib/site";

/**
 * Resolves the light + dark TokenMaps for the active theme.
 *
 * - named preset: that preset's light/dark maps.
 * - `custom`: light = the default preset overlaid with any provided custom hexes
 *   (partial-safe). Custom defines light overrides only; its dark mode falls back to
 *   the default preset's dark map (documented limitation — pick a preset for bespoke dark).
 */
function resolveTokenMaps(theme?: ThemeSettings): { light: TokenMap; dark: TokenMap } {
  if (theme?.preset === "custom") {
    const base = presetByKey(undefined);
    const light = { ...base.tokens.light } as TokenMap;
    for (const k of THEME_TOKEN_KEYS) {
      const value = theme[k];
      if (value) light[k] = value;
    }
    return { light, dark: base.tokens.dark };
  }
  return presetByKey(theme?.preset).tokens;
}

/**
 * Light-mode CSS variables for the active theme. Kept as a building block and for
 * tests; the layout uses buildThemeCss() for the full light+dark stylesheet.
 */
export function resolveThemeVars(theme?: ThemeSettings): Record<string, string> {
  return tokensToCssVars(resolveTokenMaps(theme).light);
}

/**
 * Builds the `<style>` body injected in `<head>`: a light rule on `:root`, a dark
 * rule scoped to `[data-mode="dark"]`, and a `prefers-color-scheme` fallback for the
 * no-JS auto case. The blocking head script (auto mode) or a server-rendered
 * `data-mode` (forced modes) selects which rule applies — flash-free.
 */
export function buildThemeCss(theme?: ThemeSettings): string {
  const { light, dark } = resolveTokenMaps(theme);
  const decl = (map: Record<string, string>) =>
    Object.entries(map)
      .map(([k, v]) => `${k}:${v}`)
      .join(";");
  const lightDecl = decl(tokensToCssVars(light));
  const darkDecl = decl(tokensToCssVars(dark));
  return [
    `:root{${lightDecl};color-scheme:light}`,
    `:root[data-mode="dark"]{${darkDecl};color-scheme:dark}`,
    `@media(prefers-color-scheme:dark){:root:not([data-mode]){${darkDecl};color-scheme:dark}}`,
  ].join("");
}
