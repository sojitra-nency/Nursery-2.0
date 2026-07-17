import type { Page } from "@playwright/test";

/** Computed `--color-accent` on <html>. */
export const accentVar = (page: Page) =>
  page.evaluate(() =>
    getComputedStyle(document.documentElement).getPropertyValue("--color-accent").trim()
  );

/** Effective mode stamped on <html> (null when unset). */
export const dataMode = (page: Page) =>
  page.evaluate(() => document.documentElement.dataset.mode ?? null);

/**
 * The accent hex the server injected into <head> for each mode.
 *
 * Assertions compare computed styles against these instead of pinning preset
 * hexes, so the suite verifies the injection/mode-swap mechanics regardless of
 * which theme preset is currently selected in the CMS.
 */
export const injectedAccents = (page: Page) =>
  page.evaluate(() => {
    const css = Array.from(document.querySelectorAll("style"))
      .map((s) => s.textContent ?? "")
      .join("");
    const light = css.match(/:root\{[^}]*?--color-accent:([^;}]+)/)?.[1].trim() ?? null;
    const dark =
      css.match(/:root\[data-mode="dark"\]\{[^}]*?--color-accent:([^;}]+)/)?.[1].trim() ?? null;
    return { light, dark };
  });

/**
 * True when the site runs in `darkMode: "auto"`. In forced modes the layout
 * omits the blocking auto-mode script (and the toggle), so auto/toggle specs
 * should skip rather than fail against that CMS configuration.
 */
export const isAutoMode = (page: Page) =>
  page.evaluate(() =>
    Array.from(document.scripts).some((s) => s.textContent?.includes("nursery-theme"))
  );

/** "#rrggbb" → "rgb(r, g, b)" for comparing against computed backgroundColor. */
export function hexToRgbString(hex: string): string {
  const n = parseInt(hex.replace("#", ""), 16);
  return `rgb(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255})`;
}
