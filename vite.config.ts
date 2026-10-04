import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    open: false,
    // Backend PHP. Jalankan: php -S 127.0.0.1:5199 -t api
    // Bila server PHP tidak aktif, frontend otomatis memakai localStorage.
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5199',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})