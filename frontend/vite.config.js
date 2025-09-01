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
      'chess-union.ru',
      'www.chess-union.ru',
      'localhost',
      '127.0.0.1'
    ],
    hmr: {
      clientPort: 5173
    }
  }
})