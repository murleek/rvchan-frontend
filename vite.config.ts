import { type UserConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

import { VitePWA } from "vite-plugin-pwa";
import svgr from "vite-plugin-svgr";

import path from "path";
import { execSync } from "child_process";
import app from "./package.json";

let version: string;

try {
  version = execSync("git rev-parse --short HEAD 2>/dev/null")
    .toString()
    .trim();
} catch {
  version = app.version || "unknown";
}

// https://vite.dev/config/
export default {
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: [
        "favicon.ico",
        "logo.svg",
        "icons/*.png",
        "maskable-icons/*.png",
        "splash/*.png",
      ],
      manifest: {
        name: "rvchan",
        short_name: "rvchan",
        description: "rvchan social media platform",
        start_url: "/",
        display: "standalone",
        display_override: ["window-controls-overlay"],
        orientation: "any",
        lang: "en",
        scope: "/",
        id: "/",
        theme_color: "#000000",
        background_color: "#000000",
        categories: ["social", "communication"],
        prefer_related_applications: false,
        icons: [
          {
            src: "/icons/icon-48x48.png",
            sizes: "48x48",
            type: "image/png",
          },
          {
            src: "/icons/icon-72x72.png",
            sizes: "72x72",
            type: "image/png",
          },
          {
            src: "/icons/icon-96x96.png",
            sizes: "96x96",
            type: "image/png",
          },
          {
            src: "/icons/icon-120x120.png",
            sizes: "120x120",
            type: "image/png",
          },
          {
            src: "/icons/icon-144x144.png",
            sizes: "144x144",
            type: "image/png",
          },
          {
            src: "/icons/icon-152x152.png",
            sizes: "152x152",
            type: "image/png",
          },
          {
            src: "/icons/icon-192x192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/icons/icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/maskable-icons/maskable_icon_x48.png",
            sizes: "48x48",
            type: "image/png",
            purpose: "maskable",
          },
          {
            src: "/maskable-icons/maskable_icon_x72.png",
            sizes: "72x72",
            type: "image/png",
            purpose: "maskable",
          },
          {
            src: "/maskable-icons/maskable_icon_x96.png",
            sizes: "96x96",
            type: "image/png",
            purpose: "maskable",
          },
          {
            src: "/maskable-icons/maskable_icon_x128.png",
            sizes: "128x128",
            type: "image/png",
            purpose: "maskable",
          },
          {
            src: "/maskable-icons/maskable_icon_x192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "maskable",
          },
          {
            src: "/maskable-icons/maskable_icon_x384.png",
            sizes: "384x384",
            type: "image/png",
            purpose: "maskable",
          },
          {
            src: "/maskable-icons/maskable_icon_x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
          {
            src: "/maskable-icons/maskable_icon.png",
            sizes: "1024x1024",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/rsms\.me\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "inter-font",
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365,
              },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts-css",
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365,
              },
            },
          },
        ],
      },
      devOptions: {
        enabled: true,
        type: "module",
      },
    }),
    svgr(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  define: {
    __VERSION__: JSON.stringify(version),
  },
  build: {
    sourcemap: true,
  },
  server: {
    host: "0.0.0.0",
    allowedHosts: [".local"],
  },
} satisfies UserConfig;
