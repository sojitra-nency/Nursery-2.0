import type { Metadata } from "next";
import type { Locale } from "@/lib/i18n/config";
import { locales } from "@/lib/i18n/config";
import { SITE_DOMAIN as DOMAIN, NURSERY_NAME } from "@/lib/constants";

interface BuildMetadataOpts {
  title?: string;
  description?: string;
  imageUrl?: string;
  slug?: string;
  locale: Locale;
  /**
   * Bypass the layout's `%s | Brand` title template (e.g. the home page, whose
   * title is already the brand name). Defaults to false → template applies.
   */
  titleAbsolute?: boolean;
}

export function buildMetadata({
  title,
  description,
  imageUrl,
  slug = "",
  locale,
  titleAbsolute = false,
}: BuildMetadataOpts): Metadata {
  const pageTitle = title ?? NURSERY_NAME;
  const pageDescription =
    description ?? "Greenskill Landscape — quality plants for homes, gardens and offices.";
  const canonical = `${DOMAIN}/${locale}${slug ? `/${slug}` : ""}`;

  return {
    metadataBase: new URL(DOMAIN),
    title: titleAbsolute ? { absolute: pageTitle } : pageTitle,
    description: pageDescription,
    alternates: {
      canonical,
      languages: Object.fromEntries(
        locales.map((l) => [l, `${DOMAIN}/${l}${slug ? `/${slug}` : ""}`])
      ),
    },
    openGraph: {
      title: pageTitle,
      description: pageDescription,
      url: canonical,
      siteName: NURSERY_NAME,
      locale,
      type: "website",
      ...(imageUrl
        ? { images: [{ url: imageUrl, width: 1200, height: 630, alt: pageTitle }] }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description: pageDescription,
      ...(imageUrl ? { images: [imageUrl] } : {}),
    },
  };
}
