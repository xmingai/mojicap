import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Use default Vercel deployment (supports sitemap/robots generation)
  // For static export, uncomment: output: "export",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
