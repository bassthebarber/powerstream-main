import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/',                 // subdomain serves at /
  build: { outDir: 'dist', emptyOutDir: true }
})

// IMPORTANT: base must be /studio/ so assets/links work behind that prefix
export default defineConfig({
  plugins: [react()],

  // this is the key bit so the build knows it’s mounted at /studio
  base: '/studio/',

  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },

  // dev server (optional)
  server: {
    host: true, // allow LAN
    port: 5173,
  },

  // build output (Nginx expects /dist which we copy to /build)
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: false,
  },
})
