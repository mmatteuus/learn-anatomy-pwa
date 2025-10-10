import createNextPWA from "@ducanh2912/next-pwa";
import type { NextConfig } from "next";

const withPWA = createNextPWA({
  dest: "public",
  cacheStartUrl: true,
  cacheOnFrontEndNav: true,
  disable: process.env.NODE_ENV === "development",
  workboxOptions: {
    navigateFallback: "/offline",
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/[^/]+\.supabase\.co\/storage\/v1\/object/,
        handler: "CacheFirst",
        options: {
          cacheName: "supabase-storage",
          expiration: {
            maxEntries: 64,
            maxAgeSeconds: 60 * 60 * 24 * 7,
          },
          cacheableResponse: {
            statuses: [0, 200],
          },
        },
      },
      {
        urlPattern: /^https:\/\/[^/]+\.supabase\.co\/rest\/v1\//,
        handler: "NetworkFirst",
        options: {
          cacheName: "supabase-rest",
          networkTimeoutSeconds: 5,
          expiration: {
            maxEntries: 100,
            maxAgeSeconds: 60 * 60,
          },
          cacheableResponse: {
            statuses: [0, 200],
          },
        },
      },
      {
        urlPattern: /^https:\/\/fonts\.(gstatic|googleapis)\.com\/.*/,
        handler: "StaleWhileRevalidate",
        options: {
          cacheName: "google-fonts",
          expiration: {
            maxEntries: 20,
            maxAgeSeconds: 60 * 60 * 24 * 30,
          },
        },
      },
      {
        urlPattern: /^https?.*/,
        handler: "StaleWhileRevalidate",
        options: {
          cacheName: "http-calls",
          expiration: {
            maxEntries: 200,
            maxAgeSeconds: 60 * 60 * 24,
          },
        },
      },
    ],
  },
  fallbacks: {
    document: "/offline",
    image: "/offline.png",
  },
});

const nextConfig: NextConfig = withPWA({
  reactStrictMode: true,
  typedRoutes: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
});

export default nextConfig;
