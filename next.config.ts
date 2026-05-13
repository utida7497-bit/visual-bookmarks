import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "**",
      },
    ],
  },
  // Turbopack設定（Next.js 16デフォルト）
  turbopack: {},
  // 開発モードの左下「N」バッジを非表示
  devIndicators: false,
};

export default nextConfig;
