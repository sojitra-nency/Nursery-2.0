import type { MetadataRoute } from "next";

const DOMAIN = process.env.NEXT_PUBLIC_SITE_URL || "https://greenskilllandscape.pages.dev";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${DOMAIN}/sitemap.xml`,
  };
}
