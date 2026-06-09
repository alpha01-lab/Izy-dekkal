import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { hostname: "ui-avatars.com" },
    ],
  },
};

export default nextConfig;
