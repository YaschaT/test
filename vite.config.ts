import 'dotenv/config'
import path from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: true,
    allowedHosts: ['.loca.lt'],
    proxy: {
      '/api': {
        target: `http://localhost:${process.env.SERVER_PORT || 5174}`,
        changeOrigin: true,
      },
    },
  },
})
