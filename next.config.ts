import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@aurora-studio/sdk", "@aurora-studio/starter-core"],
  eslint: { ignoreDuringBuilds: true },
  async redirects() {
    return [
      { source: "/recipes", destination: "/combos", permanent: true },
      { source: "/recipes/:slug*", destination: "/combos/:slug*", permanent: true },
      { source: "/for-you/recipes", destination: "/for-you/combos", permanent: true },
    ];
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.resolve = config.resolve ?? {};
      config.resolve.fallback = { ...config.resolve.fallback, fs: false, path: false };
    }
    return config;
  },
};

export default nextConfig;
