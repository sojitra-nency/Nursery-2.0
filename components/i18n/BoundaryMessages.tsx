"use client";

import { createContext, useContext } from "react";
import en from "@/messages/en.json";

/**
 * Translations for the error and not-found boundaries.
 *
 * Those two are Client Components — React requires it for `error.tsx`, and
 * `not-found.tsx` receives no `params` — so neither can call the server-only
 * `getDictionary`. They previously each kept their own inline `Record<Locale, …>`
 * literal, a second translation store that had to be updated by hand and would have
 * needed 13 entries apiece.
 *
 * Instead the locale layout (a Server Component, which does have the dictionary)
 * pushes just these few strings through context. Boundaries render inside the
 * layout, so the values are present on first paint — no async load, no flash of
 * English on a 404.
 *
 * The English defaults are the safety net for the one case the provider can't
 * cover: a boundary somehow rendering outside it.
 */

export interface BoundaryMessages {
  title: string;
  body: string;
  retry: string;
  notFoundTitle: string;
  notFoundBody: string;
  backHome: string;
}

const FALLBACK: BoundaryMessages = en.errors;

const BoundaryMessagesContext = createContext<BoundaryMessages>(FALLBACK);

export function BoundaryMessagesProvider({
  messages,
  children,
}: {
  messages: BoundaryMessages;
  children: React.ReactNode;
}) {
  return (
    <BoundaryMessagesContext.Provider value={messages}>{children}</BoundaryMessagesContext.Provider>
  );
}

export function useBoundaryMessages(): BoundaryMessages {
  return useContext(BoundaryMessagesContext);
}
