import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      crypto: false,
    };
    // Fix ESM resolution for wagmi/viem
    config.resolve.extensionAlias = {
      ".js": [".ts", ".tsx", ".js", ".jsx"],
      ".mjs": [".mts", ".mjs"],
    };
    config.externals.push("pino-pretty", "encoding");
    return config;
  },
  turbopack: {},
  serverExternalPackages: [
    "@abstract-foundation/agw-react",
    "@abstract-foundation/agw-client",
  ],
};

export default nextConfig;
