import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',  // Слушаем все интерфейсы
    port: 5173,
    strictPort: true,
    allowedHosts: [
      'wq1a.ru',
      'www.wq1a.ru',
      'localhost',
      '127.0.0.1'
    ],
    hmr: {
      clientPort: 5173
    }
  }
})