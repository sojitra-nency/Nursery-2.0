import { defaultLocale, type Locale } from "./config";
import type { BoundaryMessages } from "@/components/i18n/BoundaryMessages";
import en from "@/messages/en.json";

/**
 * Client-side catalog loading, for the single case that can't be served from the
 * server dictionary: `app/global-error.tsx`, which replaces the whole document and
 * therefore sits above every layout and every context provider.
 *
 * An explicit loader map (rather than a template-literal `import()`) keeps each
 * catalog in its own lazily-fetched chunk, so none of the twelve non-English files
 * lands in the main client bundle.
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

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim() !== "";
}

/** Error-boundary strings for a locale, falling back to English key by key. */
export async function loadBoundaryMessages(locale: Locale): Promise<BoundaryMessages> {
  if (locale === defaultLocale) return en.errors;

  try {
    const mod = await loaders[locale as Exclude<Locale, "en">]();
    const errors = (mod.default as { errors?: Record<string, unknown> }).errors ?? {};
    const merged = { ...en.errors };
    for (const key of Object.keys(en.errors) as (keyof BoundaryMessages)[]) {
      if (isNonEmptyString(errors[key])) merged[key] = errors[key];
    }
    return merged;
  } catch {
    return en.errors;
  }
}

/**
 * A `useSyncExternalStore` source over the lazily-loaded catalog.
 *
 * The load is asynchronous, so it can't be a plain snapshot read — but it also
 * isn't React state to be set from an effect. Modelling it as an external store
 * (load once, notify subscribers) is both the accurate description and what keeps
 * the render loop out of it: English paints immediately, the translated strings
 * arrive a tick later.
 */
let cached: BoundaryMessages | null = null;
let loading = false;
const listeners = new Set<() => void>();

function ensureLoaded(locale: Locale) {
  if (cached || loading) return;
  loading = true;
  loadBoundaryMessages(locale).then((messages) => {
    cached = messages;
    loading = false;
    for (const listener of listeners) listener();
  });
}

export function subscribeBoundaryMessages(locale: Locale) {
  return (onChange: () => void) => {
    listeners.add(onChange);
    ensureLoaded(locale);
    return () => {
      listeners.delete(onChange);
    };
  };
}

export const getBoundaryMessagesSnapshot = (): BoundaryMessages => cached ?? en.errors;
export const getBoundaryMessagesServerSnapshot = (): BoundaryMessages => en.errors;
