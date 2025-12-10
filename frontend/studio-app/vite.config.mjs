import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from 'tailwindcss'
import autoprefixer from 'autoprefixer'

// ESM config (no require()). Inline PostCSS so Vite ignores any bad global configs.
// NOTE: studio-app runs on port 5174 to avoid conflict with main frontend (5173)
export default defineConfig({
  plugins: [react()],
  css: {
    postcss: {
      plugins: [tailwindcss(), autoprefixer()]
    }
  },
  server: { port: 5174 },  // Separate port from main frontend
  build: { outDir: 'dist', emptyOutDir: true }
})
