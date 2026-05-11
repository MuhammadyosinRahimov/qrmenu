import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "eats.yalla.tj" },
      { protocol: "https", hostname: "delivery.yalla.tj" },
      { protocol: "https", hostname: "eats-admin.yalla.tj" },
      { protocol: "https", hostname: "s3.twcstorage.ru" },
      { protocol: "http", hostname: "localhost", port: "5079" },
      { protocol: "http", hostname: "localhost", port: "3000" },
      { protocol: "http", hostname: "localhost", port: "3001" },
      { protocol: "http", hostname: "localhost", port: "3002" },
      { protocol: "http", hostname: "eats-backend", port: "5079" },
      { protocol: "https", hostname: "**" },
    ],
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 31536000, // 1 year — cache aggressively in production
  },
  async rewrites() {
    // Server-side proxy: prefer the internal docker hostname so the rewrite works
    // inside containers. Falls back to public URL for non-docker dev.
    const backend =
      process.env.INTERNAL_API_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      "http://localhost:5079";
    return [
      { source: "/api/:path*", destination: `${backend}/api/:path*` },
      { source: "/hubs/:path*", destination: `${backend}/hubs/:path*` },
    ];
  },
  async headers() {
    return [
      {
        source: "/_next/image(.*)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        source: "/_next/static/(.*)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        source: "/assets/(.*)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
    ];
  },
};

export default nextConfig;
