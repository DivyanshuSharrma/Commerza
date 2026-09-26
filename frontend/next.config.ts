import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/storage/:path*",
        destination: "http://localhost:3000/api/storage/:path*",
      },
    ];
  },
};

export default nextConfig;
