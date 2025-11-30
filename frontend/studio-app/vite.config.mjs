import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from 'tailwindcss'
import autoprefixer from 'autoprefixer'

// ESM config (no require()). Inline PostCSS so Vite ignores any bad global configs.
export default defineConfig({
  plugins: [react()],
  css: {
    postcss: {
      plugins: [tailwindcss(), autoprefixer()]
    }
  },
  server: { port: 5173 },
  build: { outDir: 'dist', emptyOutDir: true }
})
