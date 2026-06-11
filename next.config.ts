import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Next's image optimizer is disabled on purpose: on the Cloudflare/OpenNext
    // deployment there's no Node image pipeline, so we let the Sanity CDN handle
    // resizing (URLs are built with explicit width/height in sanity/lib/image).
    unoptimized: true,
    remotePatterns: [{ protocol: "https", hostname: "cdn.sanity.io" }],
  },
  async redirects() {
    return [{ source: "/", destination: "/en", permanent: false }];
  },
};

export default nextConfig;
