import { defineConfig } from 'vite';

// base: './' makes every asset path relative, so the built app works no matter
// what subpath it's served from — including Home Assistant's /local/<dir>/ under
// /config/www/. Do not change to an absolute base unless you serve from web root.
export default defineConfig({
  base: './',
  build: {
    target: 'es2022',
    // three.js + STLLoader are modest; no manual chunking needed.
    chunkSizeWarningLimit: 1500,
  },
  // The wasm files in public/ are copied verbatim; Vite never processes them.
  assetsInclude: ['**/*.scad'],
});
