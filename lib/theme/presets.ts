/**
 * Single source of truth for color themes.
 *
 * IMPORTANT: this module is imported by BOTH the frontend (layout injection) and the
 * Sanity schema (Studio bundle). Keep it free of server-only imports (no `next/*`,
 * no `sanity/lib/*`, no `fetch`) so it can run in either environment.
 *
 * Each preset defines a full token map for BOTH light and dark modes. In LIGHT mode
 * surface/border/muted are tuned to the accent's hue; in DARK mode every preset shares
 * one neutral graphite base and only the accent carries the brand color (cleaner, avoids
 * muddy tinted-black). `onAccent` is the text color placed on accent surfaces — white in
 * light; in dark the accent is bright, so it's the dark background color for contrast.
 */

export const THEME_TOKEN_KEYS = [
  "background",
  "foreground",
  "surface",
  "border",
  "muted",
  "accent",
  "accentDark",
  "onAccent",
] as const;

export type ThemeTokenKey = (typeof THEME_TOKEN_KEYS)[number];
export type TokenMap = Record<ThemeTokenKey, string>;

export interface ThemePreset {
  /** Stable id stored in Sanity, e.g. "forest". */
  key: string;
  /** Human label shown in Studio, e.g. "Forest Green". */
  label: string;
  /** A single representative hex (the light accent) for swatch hints. */
  swatch: string;
  /** Full token maps for each mode. */
  tokens: { light: TokenMap; dark: TokenMap };
}

export const THEME_PRESETS: ThemePreset[] = [
  {
    key: "forest",
    label: "Forest Green",
    swatch: "#2f7d32",
    tokens: {
      light: {
        background: "#ffffff",
        foreground: "#14271a",
        surface: "#f6faf6",
        border: "#e3ebe3",
        muted: "#5b6b5e",
        accent: "#2f7d32",
        accentDark: "#1f5d23",
        onAccent: "#ffffff",
      },
      dark: {
        background: "#16181d",
        foreground: "#e6e8ee",
        surface: "#20232b",
        border: "#2f333d",
        muted: "#a3a8b4",
        accent: "#5fd267",
        accentDark: "#49bd54",
        onAccent: "#16181d",
      },
    },
  },
  {
    key: "terracotta",
    label: "Terracotta Earth",
    swatch: "#b4501e",
    tokens: {
      light: {
        background: "#fffaf6",
        foreground: "#2a1a12",
        surface: "#fbf1ea",
        border: "#ecdacd",
        muted: "#7a5648",
        accent: "#b4501e",
        accentDark: "#8f3c14",
        onAccent: "#ffffff",
      },
      dark: {
        background: "#16181d",
        foreground: "#e6e8ee",
        surface: "#20232b",
        border: "#2f333d",
        muted: "#a3a8b4",
        accent: "#f3935a",
        accentDark: "#de7b3f",
        onAccent: "#16181d",
      },
    },
  },
  {
    key: "ocean",
    label: "Ocean Teal",
    swatch: "#0f7c84",
    tokens: {
      light: {
        background: "#ffffff",
        foreground: "#0f2a2e",
        surface: "#eef7f7",
        border: "#d6e8e8",
        muted: "#3f6166",
        accent: "#0f7c84",
        accentDark: "#0a5d63",
        onAccent: "#ffffff",
      },
      dark: {
        background: "#16181d",
        foreground: "#e6e8ee",
        surface: "#20232b",
        border: "#2f333d",
        muted: "#a3a8b4",
        accent: "#43cfd6",
        accentDark: "#2bb8bf",
        onAccent: "#16181d",
      },
    },
  },
  {
    key: "plum",
    label: "Royal Plum",
    swatch: "#7c3a8d",
    tokens: {
      light: {
        background: "#fffafd",
        foreground: "#26152a",
        surface: "#f9f0f8",
        border: "#ecd9ea",
        muted: "#6b4d70",
        accent: "#7c3a8d",
        accentDark: "#5e2a6c",
        onAccent: "#ffffff",
      },
      dark: {
        background: "#16181d",
        foreground: "#e6e8ee",
        surface: "#20232b",
        border: "#2f333d",
        muted: "#a3a8b4",
        accent: "#cd8ede",
        accentDark: "#b574c8",
        onAccent: "#16181d",
      },
    },
  },
  {
    key: "sand",
    label: "Warm Sand",
    swatch: "#92651b",
    tokens: {
      light: {
        background: "#fffdf7",
        foreground: "#2a2418",
        surface: "#f8f1e3",
        border: "#eaddc4",
        muted: "#6f6047",
        accent: "#92651b",
        accentDark: "#6f4d12",
        onAccent: "#ffffff",
      },
      dark: {
        background: "#16181d",
        foreground: "#e6e8ee",
        surface: "#20232b",
        border: "#2f333d",
        muted: "#a3a8b4",
        accent: "#dcb04a",
        accentDark: "#c79a30",
        onAccent: "#16181d",
      },
    },
  },
  {
    key: "botanical",
    label: "Deep Botanical",
    swatch: "#1f6e4d",
    tokens: {
      light: {
        background: "#ffffff",
        foreground: "#11231c",
        surface: "#eef5f0",
        border: "#d8e7df",
        muted: "#4a6358",
        accent: "#1f6e4d",
        accentDark: "#155538",
        onAccent: "#ffffff",
      },
      dark: {
        background: "#16181d",
        foreground: "#e6e8ee",
        surface: "#20232b",
        border: "#2f333d",
        muted: "#a3a8b4",
        accent: "#46cb8c",
        accentDark: "#33b478",
        onAccent: "#16181d",
      },
    },
  },
];

export const DEFAULT_PRESET_KEY = "forest";

export function presetByKey(key?: string): ThemePreset {
  return (
    THEME_PRESETS.find((p) => p.key === key) ??
    THEME_PRESETS.find((p) => p.key === DEFAULT_PRESET_KEY)!
  );
}

/** Maps a camelCase token key to its CSS custom-property name. */
const CSS_VAR: Record<ThemeTokenKey, string> = {
  background: "--color-background",
  foreground: "--color-foreground",
  surface: "--color-surface",
  border: "--color-border",
  muted: "--color-muted",
  accent: "--color-accent",
  accentDark: "--color-accent-dark",
  onAccent: "--color-on-accent",
};

/** Turns a single-mode token map into a map of CSS custom properties. */
export function tokensToCssVars(tokens: TokenMap): Record<string, string> {
  return Object.fromEntries(THEME_TOKEN_KEYS.map((k) => [CSS_VAR[k], tokens[k]]));
}
