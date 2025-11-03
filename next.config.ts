import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'designbundles.net',
        port: '',
        pathname: '/kidside-studio/**',
      },
    ],
  },
};

export default nextConfig;
