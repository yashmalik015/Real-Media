import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: false,
    middlewareMode: false,
    fs: {
      strict: false,
    },
  },
  preview: {
    host: '0.0.0.0',
    port: 4173,
    strictPort: false,
  },
  base: process.env.VITE_BASE_URL || '/',
  appType: 'spa',
})
