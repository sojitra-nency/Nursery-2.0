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

  // Tag-based purge (via the Sanity webhook) is the primary mechanism; the
  // time-based revalidate is a safety net so content can't cache indefinitely
  // if the webhook is ever missing or misconfigured.
  return client.fetch<T>(query, params, { next: { tags, revalidate: 3600 } });
}
