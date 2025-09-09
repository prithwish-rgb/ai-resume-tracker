import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["pdf-parse"], // ✅ top-level, not under experimental
  
  // Fix workspace root warning
  turbopack: {
    root: __dirname,
  },
  outputFileTracingRoot: __dirname,
  
  // Optimize for better performance
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  
  // Fix OneDrive permission issues
  experimental: {
    instrumentationHook: false,
  },
  
  // Production optimizations
  compress: true,
  poweredByHeader: false,
  
  // Image optimization
  images: {
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
  },
};

export default nextConfig;
