import type { Metadata } from "next";
import type { Locale } from "@/lib/i18n/config";
import { locales } from "@/lib/i18n/config";

const DOMAIN = process.env.NEXT_PUBLIC_SITE_URL || "https://greenskilllandscape.pages.dev";
const NURSERY_NAME = "Greenskill Landscape";

interface BuildMetadataOpts {
  title?: string;
  description?: string;
  imageUrl?: string;
  slug?: string;
  locale: Locale;
}

export function buildMetadata({
  title,
  description,
  imageUrl,
  slug = "",
  locale,
}: BuildMetadataOpts): Metadata {
  const pageTitle = title ?? NURSERY_NAME;
  const pageDescription =
    description ?? "Greenskill Landscape — quality plants for homes, gardens and offices.";
  const canonical = `${DOMAIN}/${locale}${slug ? `/${slug}` : ""}`;

  return {
    title: pageTitle,
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
