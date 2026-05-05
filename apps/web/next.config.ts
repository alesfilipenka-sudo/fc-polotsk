import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // Temporary: skip TS check on build until React 19 + Sanity React 18
    // type collision is resolved (Phase 3 cleanup).
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
