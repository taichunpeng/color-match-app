import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,   // 监听所有网络接口，手机可访问
    port: 5173,
  },
})
