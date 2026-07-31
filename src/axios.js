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

// Add response interceptor to handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
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