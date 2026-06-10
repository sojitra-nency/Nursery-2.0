import type { SiteSettings } from "@/lib/site";
import type { Locale } from "@/lib/i18n/config";
import { to24h } from "@/lib/hours";

const DOMAIN = process.env.NEXT_PUBLIC_SITE_URL || "https://greenskilllandscape.pages.dev";

const ALL_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export function localBusinessJsonLd(settings: SiteSettings) {
  const name = settings.name?.en ?? "Greenskill Landscape";
  const phone = settings.phone ? `+91${settings.phone}` : undefined;
  const address = settings.address?.en;
  const city = settings.city?.en ?? "";
  const opens = to24h(settings.openTime) || "08:00";
  const closes = to24h(settings.closeTime) || "20:00";

  return {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "GardenStore"],
    name,
    url: DOMAIN,
    ...(phone ? { telephone: phone } : {}),
    ...(address || city
      ? {
          address: {
            "@type": "PostalAddress",
            streetAddress: address,
            addressLocality: city,
            addressCountry: "IN",
          },
        }
      : {}),
    currenciesAccepted: "INR",
    paymentAccepted: "Cash, UPI",
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ALL_DAYS,
        opens,
        closes,
      },
    ],
  };
}

interface ProductJsonLdOpts {
  name: string;
  description?: string;
  imageUrl?: string;
  slug: string;
  availability?: string;
  locale: Locale;
}

const SCHEMA_AVAILABILITY: Record<string, string> = {
  in_stock: "https://schema.org/InStock",
  limited: "https://schema.org/LimitedAvailability",
  out_of_stock: "https://schema.org/OutOfStock",
  coming_soon: "https://schema.org/PreOrder",
};

export function productJsonLd({
  name,
  description,
  imageUrl,
  slug,
  availability,
  locale,
}: ProductJsonLdOpts) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    ...(description ? { description } : {}),
    ...(imageUrl ? { image: imageUrl } : {}),
    url: `${DOMAIN}/${locale}/plants/${slug}`,
    brand: { "@type": "Brand", name: "Greenskill Landscape" },
    offers: {
      "@type": "Offer",
      priceCurrency: "INR",
      availability: SCHEMA_AVAILABILITY[availability ?? "in_stock"] ?? "https://schema.org/InStock",
      seller: { "@type": "Organization", name: "Greenskill Landscape" },
    },
  };
}

export function breadcrumbJsonLd(crumbs: Array<{ name: string; url: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: c.url,
    })),
  };
}
