import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,  // Разрешает доступ с любых IP
    port: 5173,
    strictPort: true,
    hmr: {
      clientPort: 5173  // Важно для Docker
    }
  }
})
