import path from "node:path";
import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
// @ts-expect-error — plain ESM helper, no types needed
import { consultApiPlugin } from "./server/vite-plugin.mjs";

const root = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react(), tailwindcss(), consultApiPlugin()],
  resolve: {
    alias: { "@": path.resolve(root, "src") },
  },
  build: {
    target: "es2020",
    cssCodeSplit: true,
    assetsInlineLimit: 2048,
    reportCompressedSize: false,
    rollupOptions: {
      input: {
        main: path.resolve(root, "index.html"),
        privacy: path.resolve(root, "privacy.html"),
        terms: path.resolve(root, "terms.html"),
      },
    },
  },
  // The preview proxy serves the app from a *.e2b.app host; Vite blocks unknown
  // hosts by default, so the sandbox preview (and localhost) are allowed here.
  server: { host: "0.0.0.0", port: 5173, allowedHosts: [".e2b.app", "localhost", "127.0.0.1"] },
  preview: { host: "0.0.0.0", port: 4173, allowedHosts: [".e2b.app", "localhost", "127.0.0.1"] },
});
