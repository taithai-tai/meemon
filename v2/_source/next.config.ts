import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  assetPrefix: "/v2",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
