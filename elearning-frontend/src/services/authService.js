import api from '../axios';

/**
 * Helper function untuk menghapus token cookie via backend response
 * Backend harus respond dengan Set-Cookie header untuk menghapus cookie
 */
const clearTokenCookieViaAPI = async () => {
  try {
    // Gunakan fetch langsung (bukan axios) dengan credentials: 'include'
    // Ini memastikan cookies dikirim ke backend dan backend bisa respond dengan Set-Cookie
    const response = await fetch('http://localhost:5000/api/auth/logout', {
      method: 'DELETE',
      credentials: 'include', // ✅ PENTING: kirim cookies
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    // Backend akan respond dengan Set-Cookie header untuk clear token
    console.log('Token cookie clearance request sent to backend');
    return response;
  } catch (error) {
    console.error('Error clearing token cookie:', error);
    throw error;
  }
};

/**
 * Helper function untuk menghapus cookie secara manual di JavaScript
 * (Ini adalah fallback jika cookie bukan HttpOnly)
 */
const clearCookie = (name) => {
  const paths = ['/', '/admin', '/student', '/teacher'];
  const domains = ['localhost', '127.0.0.1', window.location.hostname];
  const dates = [new Date(0).toUTCString(), 'Thu, 01 Jan 1970 00:00:00 UTC'];

  // Hapus dengan semua kombinasi possible
  paths.forEach(path => {
    domains.forEach(domain => {
      dates.forEach(date => {
        document.cookie = `${name}=; expires=${date}; path=${path}; domain=${domain}; max-age=0`;
        document.cookie = `${name}=; expires=${date}; path=${path}; max-age=0`;
        document.cookie = `${name}=; expires=${date}; path=${path}; SameSite=Strict; max-age=0`;
        document.cookie = `${name}=; expires=${date}; path=${path}; SameSite=Lax; max-age=0`;
      });
    });
  });

  // Fallback terakhir
  document.cookie = `${name}=; max-age=-99999999`;
};

const authService = {
  /**
   * Logout user: INSTANT - clear local data immediately
   * Backend API call berjalan di background (fire and forget)
   * @returns {Promise<void>}
   */
  logout: async () => {
    // ✅ STEP 1: Clear localStorage dan sessionStorage IMMEDIATELY
    localStorage.clear();
    sessionStorage.clear();

    // ✅ STEP 2: Manual cookie clearing IMMEDIATELY
    const cookieNames = [
      'token', 
      'admin_token', 
      'user', 
      'authToken', 
      'refreshToken', 
      'user_token', 
      'access_token',
      'session',
      'sid'
    ];

    cookieNames.forEach(name => {
      clearCookie(name);
    });

    // ✅ STEP 3: Dispatch logout event IMMEDIATELY (App.jsx akan update state)
    window.dispatchEvent(new Event('user-logout'));

    // ✅ STEP 4: Backend API call (ASYNC - jangan await, biarkan jalan di background)
    try {
      // Gunakan fetch dengan timeout pendek
      const controller = new AbortController();
      setTimeout(() => controller.abort(), 3000); // 3 detik timeout

      fetch('http://localhost:5000/api/auth/logout', {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        signal: controller.signal
      })
        .then(response => {
          console.log('Backend logout successful');
          return response;
        })
        .catch(error => {
          console.log('Backend logout error (ignored):', error.message);
          // Ignore error - local cleanup sudah done
        });
    } catch (error) {
      console.log('Backend logout skipped:', error.message);
    }

    // INSTANT RETURN - tidak wait backend response!
    return Promise.resolve();
  },

  /**
   * Check apakah user sudah authenticated
   * @returns {boolean}
   */
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  /**
   * Get data user saat ini
   * @returns {Object|null}
   */
  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  /**
   * Get role user
   * @returns {string|null}
   */
  getUserRole: () => {
    const user = authService.getCurrentUser();
    return user?.role || localStorage.getItem('pending_role') || null;
  }
};

export default authService;
