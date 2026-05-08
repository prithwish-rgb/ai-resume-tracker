import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  serverExternalPackages: ["pdf-parse", "mammoth"],
  eslint: { ignoreDuringBuilds: true },
  experimental: { optimizePackageImports: ["lucide-react", "framer-motion"] },
  compress: true,
  poweredByHeader: false,
  images: {
    formats: ["image/webp", "image/avif"],
    minimumCacheTTL: 60,
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
};
export default nextConfig;
