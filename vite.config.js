// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    proxy: {
      // 경로가 /api로 시작하는 요청을 대상으로 설정
      '/api': {
        // 실제 백엔드 서버 주소 (포트 번호를 확인하세요!)
        target: 'http://localhost:8080', 
        changeOrigin: true,
      }
    }
  }
})