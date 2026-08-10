/**
 * The `Dictionary` shape, derived from the English catalog.
 *
 * Lives in its own module (no `server-only`, type-only import of the JSON) so
 * client components can type a `dict` prop without pulling the server-only
 * loader — or any catalog bytes — into the browser bundle.
 *
 * English is the schema: every other catalog is validated against these keys by
 * `tests/messages.test.ts`, and `mergeDictionary` guarantees a value for each.
 */
import type enMessages from "@/messages/en.json";

export type Dictionary = typeof enMessages;
