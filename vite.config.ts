import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    tsconfigPaths: true,
  },
  server: {
    port: 3000,
    host: true,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules/recharts")) {
            return "charts";
          }
          if (
            id.includes("node_modules/@radix-ui") ||
            id.includes("node_modules/lucide-react")
          ) {
            return "ui";
          }
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
});
