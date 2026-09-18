import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default ({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const targetUrl = env.VITE_API_URL || 'http://192.168.69.214:5000';

  console.log('Vite proxy target loaded from .env:', targetUrl);

  return defineConfig({
    plugins: [react()],
    build: {
      // 'hidden' = file .map tetap dibuat, tapi file JS tidak lagi menunjuk ke
      // sana (tidak ada komentar sourceMappingURL di akhir file), jadi DevTools
      // tidak mengunduhnya otomatis dan source code tidak muncul di tab Sources.
      //
      // PENTING: ini bukan pengamanan. File .map masih ikut dihasilkan di
      // dist/assets/. Kalau seluruh folder dist di-upload, siapa pun yang tahu
      // nama file JS-nya — dan nama itu publik, tertulis di index.html — tetap
      // bisa mengunduh index-xxxx.js.map secara langsung. Kalau source code
      // memang tidak boleh publik, hapus *.map dari dist sebelum upload.
      sourcemap: 'hidden',
    },
    server: {
      host: true,
      allowedHosts: true, // Mengizinkan semua host eksternal (termasuk trycloudflare.com)
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