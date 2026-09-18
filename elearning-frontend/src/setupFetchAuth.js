// Global fetch interceptor: attach `Authorization: Bearer <token>` to API requests.
// Backend no longer reads the auth cookie, so every request must carry the token.
// Mirrors the axios request interceptor in ./axios.js, but for raw fetch() callers.
//
// Dipasang di sini juga: batas waktu untuk setiap request ke API kita sendiri.
// Tanpa batas waktu, satu request yang menggantung membuat halaman berputar
// "Loading..." selamanya tanpa jalan keluar. Karena ada ~95 pemanggil fetch()
// yang tersebar, pembatasan dilakukan sekali di lapisan ini supaya tidak perlu
// menyentuh satu per satu.

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

// Batas waktu default. Unggahan berkas diberi kelonggaran karena mengirim
// gambar/video jauh lebih lama daripada request JSON biasa.
const DEFAULT_TIMEOUT_MS = 15000;
const UPLOAD_TIMEOUT_MS = 60000;

const resolveTimeout = (init, explicit) => {
  if (typeof explicit === "number") return explicit;

  try {
    if (init.body instanceof FormData) return UPLOAD_TIMEOUT_MS;
  } catch {
    // FormData tidak tersedia di lingkungan ini — pakai default saja.
  }

  return DEFAULT_TIMEOUT_MS;
};

if (!window.fetch.__authWrapped) {
  const originalFetch = window.fetch.bind(window);

  const wrapped = (input, init = {}) => {
    const url = typeof input === "string" ? input : input?.url;

    // Request ke host pihak ketiga dibiarkan apa adanya: tanpa token,
    // tanpa batas waktu buatan kita.
    if (!isApiRequest(url)) return originalFetch(input, init);

    const token = localStorage.getItem("token") || localStorage.getItem("admin_token");
    let nextInit = init;

    if (token) {
      const headers = new Headers(
        init.headers || (input instanceof Request ? input.headers : undefined)
      );
      // Respect a caller that already set its own Authorization header.
      if (!headers.has("Authorization")) headers.set("Authorization", `Bearer ${token}`);
      nextInit = { ...init, headers };
    }

    // `timeoutMs` adalah opsi milik interceptor ini, bukan milik fetch() —
    // dibuang dari init supaya tidak ikut diteruskan ke browser.
    const { timeoutMs: explicitTimeout, signal: callerSignal, ...rest } = nextInit;
    const timeoutMs = resolveTimeout(nextInit, explicitTimeout);

    const controller = new AbortController();
    let didTimeout = false;

    const timer = setTimeout(() => {
      didTimeout = true;
      controller.abort();
    }, timeoutMs);

    // Hormati signal milik pemanggil: kalau ia membatalkan (mis. komponen
    // sudah unmount), request ikut batal — jangan saling menimpa.
    if (callerSignal) {
      if (callerSignal.aborted) {
        controller.abort();
      } else {
        callerSignal.addEventListener("abort", () => controller.abort(), { once: true });
      }
    }

    return originalFetch(input, { ...rest, signal: controller.signal })
      .catch((err) => {
        // Abort karena waktu habis dibedakan dari abort biasa, supaya UI bisa
        // menampilkan pesan "jaringan lambat" alih-alih diam saja.
        if (didTimeout) {
          const timeoutError = new Error(
            `Permintaan melebihi batas waktu ${Math.round(timeoutMs / 1000)} detik.`
          );
          timeoutError.name = "TimeoutError";
          throw timeoutError;
        }

        throw err;
      })
      .finally(() => clearTimeout(timer));
  };

  wrapped.__authWrapped = true;
  window.fetch = wrapped;
}
