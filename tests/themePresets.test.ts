import { describe, it, expect } from "vitest";
import { THEME_PRESETS, presetByKey, tokensToCssVars, type TokenMap } from "@/lib/theme/presets";
import { resolveThemeVars } from "@/lib/theme/resolve";

// ── WCAG contrast helpers (no dependency) ───────────────────────────────────
function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  const full =
    h.length === 3
      ? h
          .split("")
          .map((c) => c + c)
          .join("")
      : h;
  const n = parseInt(full, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function relativeLuminance(hex: string): number {
  const srgb = hexToRgb(hex).map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * srgb[0] + 0.7152 * srgb[1] + 0.0722 * srgb[2];
}

function contrastRatio(a: string, b: string): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  const [hi, lo] = la > lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

const AA_NORMAL = 4.5;

function assertModeAA(t: TokenMap) {
  // Body / heading text on the two surfaces.
  expect(contrastRatio(t.foreground, t.background)).toBeGreaterThanOrEqual(AA_NORMAL);
  expect(contrastRatio(t.foreground, t.surface)).toBeGreaterThanOrEqual(AA_NORMAL);
  // Muted secondary text.
  expect(contrastRatio(t.muted, t.surface)).toBeGreaterThanOrEqual(AA_NORMAL);
  expect(contrastRatio(t.muted, t.background)).toBeGreaterThanOrEqual(AA_NORMAL);
  // Accent used as link / eyebrow text.
  expect(contrastRatio(t.accent, t.background)).toBeGreaterThanOrEqual(AA_NORMAL);
  expect(contrastRatio(t.accent, t.surface)).toBeGreaterThanOrEqual(AA_NORMAL);
  // Text placed ON accent buttons/bands (white in light, dark in dark).
  expect(contrastRatio(t.onAccent, t.accent)).toBeGreaterThanOrEqual(AA_NORMAL);
  expect(contrastRatio(t.onAccent, t.accentDark)).toBeGreaterThanOrEqual(AA_NORMAL);
}

describe("theme presets — WCAG AA contrast (light + dark)", () => {
  for (const preset of THEME_PRESETS) {
    describe(preset.label, () => {
      it("light mode clears AA", () => assertModeAA(preset.tokens.light));
      it("dark mode clears AA", () => assertModeAA(preset.tokens.dark));
    });
  }
});

describe("resolveThemeVars", () => {
  it("falls back to the default (forest) light map when theme is undefined", () => {
    expect(resolveThemeVars(undefined)).toEqual(
      tokensToCssVars(presetByKey("forest").tokens.light)
    );
  });

  it("resolves a named preset to its light token map", () => {
    expect(resolveThemeVars({ preset: "ocean" })).toEqual(
      tokensToCssVars(presetByKey("ocean").tokens.light)
    );
  });

  it("falls back to default for an unknown preset key", () => {
    expect(resolveThemeVars({ preset: "does-not-exist" })).toEqual(
      tokensToCssVars(presetByKey("forest").tokens.light)
    );
  });

  it("overlays custom hexes on the default light map, keeping defaults for empty fields", () => {
    const vars = resolveThemeVars({ preset: "custom", accent: "#123456" });
    expect(vars["--color-accent"]).toBe("#123456");
    expect(vars["--color-background"]).toBe(presetByKey("forest").tokens.light.background);
  });

  it("emits all eight color custom properties", () => {
    const vars = resolveThemeVars({ preset: "plum" });
    expect(Object.keys(vars).sort()).toEqual(
      [
        "--color-accent",
        "--color-accent-dark",
        "--color-background",
        "--color-border",
        "--color-foreground",
        "--color-muted",
        "--color-on-accent",
        "--color-surface",
      ].sort()
    );
  });
});
