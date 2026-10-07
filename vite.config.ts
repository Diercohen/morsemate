import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  // Relative URLs so the build works from any sub-path (e.g. GitHub Pages).
  base: './',
  plugins: [react()],
  build: {
    rolldownOptions: {
      // Stable names: public/sw.js precaches these exact files.
      output: {
        entryFileNames: 'build/[name].js',
        chunkFileNames: 'build/[name].js',
        assetFileNames: 'build/[name][extname]',
      },
    },
  },
})
