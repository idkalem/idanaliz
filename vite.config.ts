import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: './',
  plugins: [react()],
  server: { port: 5183, strictPort: true },
  // Kökteki Netlik.html derleme çıktısıdır; bağımlılık taraması yalnızca asıl giriş dosyasına bakar.
  optimizeDeps: { entries: ['index.html'] },
});
