// vite.config.mjs
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { "@": resolve(__dirname, "src") } },
  server: {
    host: true,
    port: 5173,
    hmr: {
      protocol: "ws",
      host: "localhost", // make this explicit
      port: 5173,
    },
  },
});
