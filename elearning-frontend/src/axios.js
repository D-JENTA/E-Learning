import axios from 'axios';

/**
 * Helper function untuk menghapus semua cookies
 */
const clearAllCookies = () => {
  const cookieNames = ['token', 'admin_token', 'user', 'authToken', 'refreshToken', 'user_token', 'access_token'];
  
  cookieNames.forEach(name => {
    // Clear dengan berbagai path dan options
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; max-age=0`;
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/admin; max-age=0`;
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/student; max-age=0`;
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/teacher; max-age=0`;
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; domain=localhost; path=/; max-age=0`;
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax; max-age=0`;
    document.cookie = `${name}=; max-age=-1`;
  });
};

// Use the Vite dev proxy during development (so '/api' forwards to your Cloudflare tunnel).
// In production use the VITE_API_URL env var if provided.
const baseURL = import.meta.env.DEV
  ? '/api'
  : (import.meta.env.VITE_API_URL || 'http://localhost:5000');

const api = axios.create({
  baseURL,
  withCredentials: true,
  // Samakan dengan batas waktu di setupFetchAuth.js supaya request axios pun
  // tidak bisa menggantung selamanya.
  timeout: 15000,
});

// Add request interceptor to include token in headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Halaman yang boleh dibuka tanpa login. 401 di sini adalah kondisi wajar
// ("belum login"), bukan sesi yang habis — jadi tidak boleh memicu logout paksa.
const PUBLIC_PATHS = [
  "/",
  "/create",
  "/forgot",
  "/verify",
  "/reset-password",
  "/login",
  "/admin/login",
];

const isOnPublicPath = () =>
  typeof window !== "undefined" &&
  PUBLIC_PATHS.includes(window.location.pathname.toLowerCase());

// Add response interceptor to handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // 401 baru berarti "sesi habis" kalau sebelumnya memang ada token. Kalau
    // tidak ada token sama sekali, pengguna memang belum pernah login: tidak
    // ada yang perlu dibersihkan, dan redirect hanya akan membuang pesan error
    // yang sedang ditampilkan (mis. "email atau kata sandi salah").
    const hadToken = Boolean(
      localStorage.getItem("token") || localStorage.getItem("admin_token")
    );

    if (error.response?.status === 401 && hadToken && !isOnPublicPath()) {
      // ✅ Token expired atau invalid - clear semua storage dan cookies
      localStorage.clear();
      sessionStorage.clear();
      clearAllCookies();

      // Dispatch logout event
      window.dispatchEvent(new Event('user-logout'));

      // Redirect ke login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;