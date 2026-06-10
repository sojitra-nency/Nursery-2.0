import { describe, it, expect } from "vitest";
import { THEME_PRESETS, presetByKey, tokensToCssVars } from "@/lib/theme/presets";
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
const WHITE = "#ffffff";

describe("theme presets — WCAG AA contrast", () => {
  for (const preset of THEME_PRESETS) {
    const t = preset.tokens;
    describe(preset.label, () => {
      it("foreground text on background ≥ 4.5:1", () => {
        expect(contrastRatio(t.foreground, t.background)).toBeGreaterThanOrEqual(AA_NORMAL);
      });
      it("foreground text on surface ≥ 4.5:1", () => {
        expect(contrastRatio(t.foreground, t.surface)).toBeGreaterThanOrEqual(AA_NORMAL);
      });
      it("muted text on surface ≥ 4.5:1", () => {
        expect(contrastRatio(t.muted, t.surface)).toBeGreaterThanOrEqual(AA_NORMAL);
      });
      it("muted text on background ≥ 4.5:1", () => {
        expect(contrastRatio(t.muted, t.background)).toBeGreaterThanOrEqual(AA_NORMAL);
      });
      it("white label on accent button ≥ 4.5:1", () => {
        expect(contrastRatio(WHITE, t.accent)).toBeGreaterThanOrEqual(AA_NORMAL);
      });
      it("white label on accent-dark (hover) ≥ 4.5:1", () => {
        expect(contrastRatio(WHITE, t.accentDark)).toBeGreaterThanOrEqual(AA_NORMAL);
      });
      it("accent as text on background ≥ 4.5:1", () => {
        expect(contrastRatio(t.accent, t.background)).toBeGreaterThanOrEqual(AA_NORMAL);
      });
    });
  }
});

describe("resolveThemeVars", () => {
  it("falls back to the default (forest) preset when theme is undefined", () => {
    expect(resolveThemeVars(undefined)).toEqual(tokensToCssVars(presetByKey("forest").tokens));
  });

  it("resolves a named preset to its token map", () => {
    expect(resolveThemeVars({ preset: "ocean" })).toEqual(
      tokensToCssVars(presetByKey("ocean").tokens)
    );
  });

  it("falls back to default for an unknown preset key", () => {
    expect(resolveThemeVars({ preset: "does-not-exist" })).toEqual(
      tokensToCssVars(presetByKey("forest").tokens)
    );
  });

  it("overlays custom hexes on the default map, keeping defaults for empty fields", () => {
    const vars = resolveThemeVars({ preset: "custom", accent: "#123456" });
    expect(vars["--color-accent"]).toBe("#123456");
    // Untouched tokens keep the default preset value.
    expect(vars["--color-background"]).toBe(presetByKey("forest").tokens.background);
  });

  it("emits all seven color custom properties", () => {
    const vars = resolveThemeVars({ preset: "plum" });
    expect(Object.keys(vars).sort()).toEqual(
      [
        "--color-accent",
        "--color-accent-dark",
        "--color-background",
        "--color-border",
        "--color-foreground",
        "--color-muted",
        "--color-surface",
      ].sort()
    );
  });
});
