// Global fetch interceptor: attach `Authorization: Bearer <token>` to API requests.
// Backend no longer reads the auth cookie, so every request must carry the token.
// Mirrors the axios request interceptor in ./axios.js, but for raw fetch() callers.

const API_ORIGIN = (() => {
  try {
    return new URL(import.meta.env.VITE_API_URL).origin;
  } catch {
    return null; // dev: requests are same-origin ('/api' via Vite proxy)
  }
})();

// Only attach the token to our own backend — never leak it to third-party hosts.
const isApiRequest = (url) => {
  try {
    const u = new URL(url, window.location.origin);
    if (u.origin === window.location.origin) return true; // relative or same-origin
    return API_ORIGIN != null && u.origin === API_ORIGIN; // prod API host
  } catch {
    return false;
  }
};

if (!window.fetch.__authWrapped) {
  const originalFetch = window.fetch.bind(window);

  const wrapped = (input, init = {}) => {
    const token = localStorage.getItem("token") || localStorage.getItem("admin_token");
    const url = typeof input === "string" ? input : input?.url;

    if (token && isApiRequest(url)) {
      const headers = new Headers(
        init.headers || (input instanceof Request ? input.headers : undefined)
      );
      // Respect a caller that already set its own Authorization header.
      if (!headers.has("Authorization")) headers.set("Authorization", `Bearer ${token}`);
      init = { ...init, headers };
    }

    return originalFetch(input, init);
  };

  wrapped.__authWrapped = true;
  window.fetch = wrapped;
}
