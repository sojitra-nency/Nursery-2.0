import { unstable_noStore as noStore } from "next/cache";
import { client } from "./client";
import { isSanityConfigured } from "../env";

export async function sanityFetch<T>(
  query: string,
  params: Record<string, unknown> = {},
  tags: string[] = []
): Promise<T | null> {
  if (!isSanityConfigured) return null;

  if (process.env.NODE_ENV !== "production") {
    noStore();
    return client.fetch<T>(query, params, { cache: "no-store" });
  }

  return client.fetch<T>(query, params, { next: { tags } });
}
