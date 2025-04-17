import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      // Proxy para las imágenes - envía solicitudes de /uploads a tu servidor backend
      '/uploads': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
    fs: {
      // Permitir acceso a archivos fuera del directorio raíz
      allow: ['..']
    }
  },
  resolve: {
    alias: {
      events: 'events',
    },
  },
  optimizeDeps: {
    include: ['events'],
  },
})