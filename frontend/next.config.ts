import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  bundler: "webpack",
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      crypto: false,
    };
    config.externals.push("pino-pretty", "encoding");
    return config;
  },
  serverExternalPackages: [
    "@abstract-foundation/agw-react",
    "@abstract-foundation/agw-client",
  ],
};

export default nextConfig;
