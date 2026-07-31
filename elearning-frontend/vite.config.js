import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default ({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const targetUrl = env.VITE_API_URL || 'http://192.168.69.214:5000';

  console.log('Vite proxy target loaded from .env:', targetUrl);

  return defineConfig({
    plugins: [react()],
    server: {
      proxy: {
        '/api': {
          target: targetUrl,
          changeOrigin: true,
          secure: false,
          logLevel: 'debug',
          // Jika backend tidak menggunakan prefix /api, aktifkan baris rewrite berikut:
          // rewrite: (path) => path.replace(/^\/api/, ''),
        }
      }
    }
  });
};