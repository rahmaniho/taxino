import path from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const root = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  root,
  plugins: [react()],
  resolve: { alias: { "@": path.resolve(root, "..", "src") } },
  build: {
    ssr: path.resolve(root, "render.tsx"),
    outDir: path.resolve(root, ".ssr"),
    emptyOutDir: true,
    minify: false,
    rollupOptions: { output: { entryFileNames: "render.mjs" } },
  },
});
