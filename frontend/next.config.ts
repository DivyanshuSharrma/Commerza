import type { NextConfig } from "next";

import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
  },
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
