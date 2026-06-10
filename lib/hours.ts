import type { SiteSettings } from "./site";
import type { Locale } from "./i18n/config";
import { getLocalized } from "./i18n/getLocalized";

/** Convert a display time like "8:00 AM" → 24h "08:00" for structured data. */
export function to24h(time?: string): string {
  if (!time) return "";
  const m = time.trim().match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)?$/i);
  if (!m) return time;
  let h = parseInt(m[1], 10);
  const min = m[2] ?? "00";
  const ap = m[3]?.toLowerCase();
  if (ap === "pm" && h < 12) h += 12;
  if (ap === "am" && h === 12) h = 0;
  return `${String(h).padStart(2, "0")}:${min}`;
}

/**
 * Human-readable opening hours line. Prefers the optional `hoursNote` override,
 * otherwise builds "<prefix> · <openTime> – <closeTime>".
 */
export function formatHours(
  settings: SiteSettings,
  locale: Locale,
  openEveryDayLabel: string
): string {
  const note = getLocalized(settings.hoursNote, locale);
  if (note) return note;
  const open = settings.openTime || "8:00 AM";
  const close = settings.closeTime || "8:00 PM";
  const prefix = settings.openEveryday === false ? "" : `${openEveryDayLabel} · `;
  return `${prefix}${open} – ${close}`;
}
