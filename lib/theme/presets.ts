/**
 * Single source of truth for color themes.
 *
 * IMPORTANT: this module is imported by BOTH the frontend (layout injection) and the
 * Sanity schema (Studio bundle). Keep it free of server-only imports (no `next/*`,
 * no `sanity/lib/*`, no `fetch`) so it can run in either environment.
 *
 * Each preset defines the FULL token map so surface/border/muted are tuned to the
 * accent's hue. `background` stays light in every preset (light mode only for now)
 * but is part of the map so a dark variant can flip it later without rework.
 */

export const THEME_TOKEN_KEYS = [
  "background",
  "foreground",
  "surface",
  "border",
  "muted",
  "accent",
  "accentDark",
] as const;

export type ThemeTokenKey = (typeof THEME_TOKEN_KEYS)[number];
export type TokenMap = Record<ThemeTokenKey, string>;

export interface ThemePreset {
  /** Stable id stored in Sanity, e.g. "forest". */
  key: string;
  /** Human label shown in Studio, e.g. "Forest Green". */
  label: string;
  /** A single representative hex (the accent) for swatch hints. */
  swatch: string;
  tokens: TokenMap;
}

export const THEME_PRESETS: ThemePreset[] = [
  {
    key: "forest",
    label: "Forest Green",
    swatch: "#2f7d32",
    tokens: {
      background: "#ffffff",
      foreground: "#14271a",
      surface: "#f6faf6",
      border: "#e3ebe3",
      muted: "#5b6b5e",
      accent: "#2f7d32",
      accentDark: "#1f5d23",
    },
  },
  {
    key: "terracotta",
    label: "Terracotta Earth",
    swatch: "#b4501e",
    tokens: {
      background: "#fffaf6",
      foreground: "#2a1a12",
      surface: "#fbf1ea",
      border: "#ecdacd",
      muted: "#7a5648",
      accent: "#b4501e",
      accentDark: "#8f3c14",
    },
  },
  {
    key: "ocean",
    label: "Ocean Teal",
    swatch: "#0f7c84",
    tokens: {
      background: "#ffffff",
      foreground: "#0f2a2e",
      surface: "#eef7f7",
      border: "#d6e8e8",
      muted: "#3f6166",
      accent: "#0f7c84",
      accentDark: "#0a5d63",
    },
  },
  {
    key: "plum",
    label: "Royal Plum",
    swatch: "#7c3a8d",
    tokens: {
      background: "#fffafd",
      foreground: "#26152a",
      surface: "#f9f0f8",
      border: "#ecd9ea",
      muted: "#6b4d70",
      accent: "#7c3a8d",
      accentDark: "#5e2a6c",
    },
  },
  {
    key: "sand",
    label: "Warm Sand",
    swatch: "#92651b",
    tokens: {
      background: "#fffdf7",
      foreground: "#2a2418",
      surface: "#f8f1e3",
      border: "#eaddc4",
      muted: "#6f6047",
      accent: "#92651b",
      accentDark: "#6f4d12",
    },
  },
  {
    key: "botanical",
    label: "Deep Botanical",
    swatch: "#1f6e4d",
    tokens: {
      background: "#ffffff",
      foreground: "#11231c",
      surface: "#eef5f0",
      border: "#d8e7df",
      muted: "#4a6358",
      accent: "#1f6e4d",
      accentDark: "#155538",
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
};

/** Turns a token map into an inline-style object of CSS custom properties. */
export function tokensToCssVars(tokens: TokenMap): Record<string, string> {
  return Object.fromEntries(THEME_TOKEN_KEYS.map((k) => [CSS_VAR[k], tokens[k]]));
}
