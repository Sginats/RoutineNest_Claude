import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
});

const nextConfig: NextConfig = {
  /* Static export for Capacitor native shells */
  output: "export",
  /* Allow Turbopack dev alongside webpack-based PWA build */
  turbopack: {},
};

export default withPWA(nextConfig);
