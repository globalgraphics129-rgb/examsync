import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // Proxy /api/* to local dev server during development
    // On Vercel (production), /api/* routes are handled by serverless functions
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
        configure: (proxy) => {
          proxy.on('error', () => {
            // Silently ignore if local server isn't running
          });
        },
      },
    },
  },
  build: {
    // Increase chunk size limit to avoid warnings
    chunkSizeWarningLimit: 1000,
  },
})
