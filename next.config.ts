import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Next's image optimizer is disabled on purpose: on the Cloudflare/OpenNext
    // deployment there's no Node image pipeline, so we let the Sanity CDN handle
    // resizing (URLs are built with explicit width/height in sanity/lib/image).
    unoptimized: true,
    remotePatterns: [{ protocol: "https", hostname: "cdn.sanity.io" }],
  },
  // `/` is no longer a redirect to `/en`: it now serves the language chooser
  // (app/(entry)/page.tsx). Returning visitors are sent to their saved locale by a
  // blocking script in that route's layout — client-side because OpenNext on
  // Cloudflare can't run Next 16's Node-only proxy, and because a crawler (which
  // carries no stored preference) should see the real hub page instead.
};

export default nextConfig;
