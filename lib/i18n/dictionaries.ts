import "server-only";
import type { Locale } from "./config";

const dictionaries = {
  en: () => import("@/messages/en.json").then((m) => m.default),
  hi: () => import("@/messages/hi.json").then((m) => m.default),
  gu: () => import("@/messages/gu.json").then((m) => m.default),
};

export type Dictionary = Awaited<ReturnType<typeof dictionaries.en>>;

export async function getDictionary(locale: string): Promise<Dictionary> {
  const load = dictionaries[locale as Locale] ?? dictionaries.en;
  return load();
}
