/**
 * Shared site-wide constants.
 *
 * These were previously duplicated across SEO helpers, route handlers and pages.
 * Prefer values from Sanity `siteSettings` where a `settings` object is in scope;
 * fall back to these when it isn't (build-time routes, unconfigured CMS).
 */

/** Canonical site origin, no trailing slash. */
export const SITE_DOMAIN =
  process.env.NEXT_PUBLIC_SITE_URL || "https://greenskilllandscape.pages.dev";

/** Brand name used as a fallback when settings.name is unavailable. */
export const NURSERY_NAME = "Greenskill Landscape";

/** Placeholder phone/WhatsApp number used only when settings omit one. */
export const DEFAULT_PHONE = "9876543210";
