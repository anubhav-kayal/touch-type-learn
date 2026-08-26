import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    "@keypath/typing-engine",
    "@keypath/curriculum",
    "@keypath/scoring",
    "@keypath/shared-types",
    "@keypath/ui",
  ],
};

export default nextConfig;
