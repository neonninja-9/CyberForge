import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Raise the chunk size warning limit (lazy routes will split naturally)
    chunkSizeWarningLimit: 600,
    // Generate source maps for production error tracking
    sourcemap: true,
  },
  preview: {
    port: 4173,
  },
})
