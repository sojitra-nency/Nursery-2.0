import "server-only";
import { defaultLocale, hasLocale, type Locale } from "./config";
import en from "@/messages/en.json";
import type { Dictionary } from "./dictionary-type";
import { mergeDictionary } from "./merge";

/**
 * Static loader map (not a template-literal `import()`), so the bundler can see
 * every catalog and split each into its own chunk — a page only ever loads the
 * catalog for its own locale.
 *
 * English is imported eagerly because it is the merge base for every locale.
 */
const loaders: Record<Exclude<Locale, "en">, () => Promise<{ default: unknown }>> = {
  hi: () => import("@/messages/hi.json"),
  bn: () => import("@/messages/bn.json"),
  mr: () => import("@/messages/mr.json"),
  te: () => import("@/messages/te.json"),
  ta: () => import("@/messages/ta.json"),
  gu: () => import("@/messages/gu.json"),
  ur: () => import("@/messages/ur.json"),
  kn: () => import("@/messages/kn.json"),
  or: () => import("@/messages/or.json"),
  ml: () => import("@/messages/ml.json"),
  pa: () => import("@/messages/pa.json"),
  as: () => import("@/messages/as.json"),
};

export type { Dictionary };
export { mergeDictionary };

/** Merged catalogs are immutable per locale — build each one once per worker. */
const cache = new Map<Locale, Dictionary>();

export async function getDictionary(locale: string): Promise<Dictionary> {
  const target: Locale = hasLocale(locale) ? locale : defaultLocale;
  if (target === defaultLocale) return en as Dictionary;

  const cached = cache.get(target);
  if (cached) return cached;

  let merged: Dictionary;
  try {
    const mod = await loaders[target as Exclude<Locale, "en">]();
    merged = mergeDictionary(en as Dictionary, mod.default);
  } catch {
    // A missing or malformed catalog must never take a page down.
    merged = en as Dictionary;
  }

  cache.set(target, merged);
  return merged;
}
