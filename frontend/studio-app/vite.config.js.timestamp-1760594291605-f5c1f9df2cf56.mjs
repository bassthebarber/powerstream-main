var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});

// vite.config.js
import { defineConfig } from "file:///C:/Users/bassb/OneDrive/Documents/PowerStreamMain/frontend/studio-app/node_modules/vite/dist/node/index.js";
import react from "@vitejs/plugin-react";
var vite_config_default = defineConfig({
  plugins: [react()],
  css: {
    postcss: {
      plugins: [
        __require("file:///C:/Users/bassb/OneDrive/Documents/PowerStreamMain/frontend/studio-app/node_modules/tailwindcss/lib/index.js")(),
        __require("file:///C:/Users/bassb/OneDrive/Documents/PowerStreamMain/frontend/studio-app/node_modules/autoprefixer/lib/autoprefixer.js")()
      ]
    }
  },
  server: {
    port: 5173
  },
  build: {
    outDir: "dist"
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxiYXNzYlxcXFxPbmVEcml2ZVxcXFxEb2N1bWVudHNcXFxcUG93ZXJTdHJlYW1NYWluXFxcXGZyb250ZW5kXFxcXHN0dWRpby1hcHBcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXGJhc3NiXFxcXE9uZURyaXZlXFxcXERvY3VtZW50c1xcXFxQb3dlclN0cmVhbU1haW5cXFxcZnJvbnRlbmRcXFxcc3R1ZGlvLWFwcFxcXFx2aXRlLmNvbmZpZy5qc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovVXNlcnMvYmFzc2IvT25lRHJpdmUvRG9jdW1lbnRzL1Bvd2VyU3RyZWFtTWFpbi9mcm9udGVuZC9zdHVkaW8tYXBwL3ZpdGUuY29uZmlnLmpzXCI7XHVGRUZGaW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSdcbmltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdCdcblxuLy8gaW5saW5lIFBvc3RDU1Mgc28gVml0ZSBkb2Vzbid0IHNlYXJjaCB0aGUgZmlsZXN5c3RlbSBmb3IgY29uZmlnc1xuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcbiAgcGx1Z2luczogW3JlYWN0KCldLFxuICBjc3M6IHtcbiAgICBwb3N0Y3NzOiB7XG4gICAgICBwbHVnaW5zOiBbXG4gICAgICAgIHJlcXVpcmUoJ3RhaWx3aW5kY3NzJykoKSxcbiAgICAgICAgcmVxdWlyZSgnYXV0b3ByZWZpeGVyJykoKSxcbiAgICAgIF1cbiAgICB9XG4gIH0sXG4gIHNlcnZlcjoge1xuICAgIHBvcnQ6IDUxNzNcbiAgfSxcbiAgYnVpbGQ6IHtcbiAgICBvdXREaXI6ICdkaXN0J1xuICB9XG59KVxyXG4iXSwKICAibWFwcGluZ3MiOiAiOzs7Ozs7OztBQUFrWixTQUFTLG9CQUFvQjtBQUMvYSxPQUFPLFdBQVc7QUFHbEIsSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDMUIsU0FBUyxDQUFDLE1BQU0sQ0FBQztBQUFBLEVBQ2pCLEtBQUs7QUFBQSxJQUNILFNBQVM7QUFBQSxNQUNQLFNBQVM7QUFBQSxRQUNQLFVBQVEscUhBQWEsRUFBRTtBQUFBLFFBQ3ZCLFVBQVEsNkhBQWMsRUFBRTtBQUFBLE1BQzFCO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFBQSxFQUNBLFFBQVE7QUFBQSxJQUNOLE1BQU07QUFBQSxFQUNSO0FBQUEsRUFDQSxPQUFPO0FBQUEsSUFDTCxRQUFRO0FBQUEsRUFDVjtBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
