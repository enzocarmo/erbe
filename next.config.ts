import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/flex/:path*',
        destination: 'http://172.16.200.56:9000/:path*',
      },
    ];
  },
};

export default nextConfig;