import { type UserConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
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
  plugins: [react(), tailwindcss()],
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
