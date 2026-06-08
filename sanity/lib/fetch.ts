import { client } from "./client";
import { isSanityConfigured } from "../env";

export async function sanityFetch<T>(
  query: string,
  params: Record<string, unknown> = {},
  tags: string[] = []
): Promise<T | null> {
  if (!isSanityConfigured) return null;

  return client.fetch<T>(query, params, {
    next: { tags },
  });
}
