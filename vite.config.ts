// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',      // 또는 true
    port: 5173,
    strictPort: true,
    // 여기에 접속하려는 호스트를 추가하세요
    allowedHosts: ['local.kakao.test'],
    proxy: {
      '/vworld': { /* …기존 프록시 설정… */ }
    }
  },
});
