/**
 * Klien API tipis untuk seluruh halaman.
 *
 * Lapisan transport-nya SUDAH ada di src/setupFetchAuth.js (menempelkan token,
 * batas waktu, FormData). Berkas ini TIDAK menggantikannya — ia melapisi hal
 * yang sebelumnya ditulis ulang di hampir setiap halaman:
 *
 *   const res = await fetch(url, { credentials: "include" });
 *   if (!res.ok) return;
 *   const json = await res.json();
 *   const list = Array.isArray(json.data) ? json.data : (Array.isArray(json) ? json : []);
 *
 * Tiga hal yang jadi berulang di ~90 pemanggil fetch dan kini diurus di sini:
 *   1. respons non-JSON (halaman error HTML dari proxy) tidak lagi meledak di
 *      res.json(), tapi jadi error yang bisa ditampilkan;
 *   2. pesan error dari backend diambil konsisten (message/error/errors);
 *   3. bentuk amplop respons dinormalkan lewat asArray()/asObject(), karena
 *      sebagian endpoint membalas {data: [...]}, sebagian langsung [...].
 */

export class ApiError extends Error {
  constructor(message, { status = 0, url = "", body = null, isNetworkError = false } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.url = url;
    this.body = body;
    this.isNetworkError = isNetworkError;
  }

  get isUnauthorized() {
    return this.status === 401;
  }

  get isForbidden() {
    return this.status === 403;
  }

  get isNotFound() {
    return this.status === 404;
  }

  /** 429 dari middleware rate limiter backend. */
  get isRateLimited() {
    return this.status === 429;
  }
}

// Pesan cadangan per status, dipakai kalau backend tidak mengirim pesan apa pun.
const FALLBACK_MESSAGE = {
  400: "Permintaan tidak valid.",
  401: "Sesi Anda sudah berakhir. Silakan masuk lagi.",
  403: "Anda tidak punya akses ke bagian ini.",
  404: "Data yang diminta tidak ditemukan.",
  409: "Data sudah ada atau sedang dipakai.",
  413: "Berkas terlalu besar.",
  429: "Terlalu banyak percobaan. Coba lagi sebentar lagi.",
  500: "Terjadi kesalahan di server.",
};

const messageFromBody = (body, status) => {
  if (body && typeof body === "object") {
    const candidate = body.message || body.error || body.errors;
    if (typeof candidate === "string" && candidate.trim()) return candidate;
  }
  if (typeof body === "string" && body.trim() && body.length < 300) return body;
  return FALLBACK_MESSAGE[status] || `Permintaan gagal (${status || "tanpa status"}).`;
};

const parseBody = async (response) => {
  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    try {
      return await response.json();
    } catch {
      return null;
    }
  }
  try {
    return await response.text();
  } catch {
    return null;
  }
};

const buildInit = ({ method, body, headers, signal, timeoutMs }) => {
  const init = { method, signal };

  // timeoutMs diteruskan ke interceptor di setupFetchAuth.js — fetch() asli
  // tidak mengenal opsi ini, dan interceptor membuangnya sebelum request jalan.
  if (typeof timeoutMs === "number") init.timeoutMs = timeoutMs;

  const mergedHeaders = { ...headers };
  let payload = body;

  if (body != null && !(body instanceof FormData)) {
    // FormData dibiarkan apa adanya: browser yang menentukan Content-Type
    // beserta boundary-nya.
    payload = typeof body === "string" ? body : JSON.stringify(body);
    if (!mergedHeaders["Content-Type"] && !mergedHeaders["content-type"]) {
      mergedHeaders["Content-Type"] = "application/json";
    }
  }

  if (payload != null) init.body = payload;
  if (Object.keys(mergedHeaders).length > 0) init.headers = mergedHeaders;

  return init;
};

/**
 * Jalankan satu request dan kembalikan body yang sudah di-parse.
 * Melempar ApiError untuk semua kegagalan, jadi pemanggil cukup try/catch.
 *
 * @param {string} path mis. "/api/teachers/me/mapels"
 * @param {object} [options]
 * @param {string} [options.method]
 * @param {object|FormData|string} [options.body]
 * @param {object} [options.headers]
 * @param {AbortSignal} [options.signal]
 * @param {number} [options.timeoutMs] diteruskan ke setupFetchAuth.js
 */
export async function apiRequest(path, options = {}) {
  const { method = "GET" } = options;

  let response;
  try {
    response = await fetch(path, buildInit({ ...options, method }));
  } catch (error) {
    // AbortError dibiarkan naik apa adanya: itu bukan kegagalan, melainkan
    // komponen yang unmount / permintaan yang sengaja dibatalkan.
    if (error?.name === "AbortError") throw error;

    throw new ApiError(
      error?.name === "TimeoutError"
        ? error.message
        : "Tidak bisa menghubungi server. Periksa koneksi Anda.",
      { url: path, isNetworkError: true }
    );
  }

  const body = await parseBody(response);

  if (!response.ok) {
    throw new ApiError(messageFromBody(body, response.status), {
      status: response.status,
      url: path,
      body,
    });
  }

  return body;
}

export const apiGet = (path, options) => apiRequest(path, { ...options, method: "GET" });
export const apiPost = (path, body, options) => apiRequest(path, { ...options, method: "POST", body });
export const apiPut = (path, body, options) => apiRequest(path, { ...options, method: "PUT", body });
export const apiPatch = (path, body, options) => apiRequest(path, { ...options, method: "PATCH", body });
export const apiDelete = (path, options) => apiRequest(path, { ...options, method: "DELETE" });

/**
 * Coba beberapa kandidat endpoint berurutan dan pakai yang pertama berhasil.
 *
 * Pola ini sebelumnya disalin-tempel di beberapa halaman (lihat
 * fetchTasksForMapel di HomeStudent.jsx dan resolveAssignmentsEndpoint di
 * TaskStudent.jsx): backend punya beberapa variasi URL untuk data yang sama,
 * dan frontend mencobanya satu per satu sampai ada yang menjawab.
 *
 * Kegagalan HTTP dan respons non-JSON dilewati tanpa melempar, sehingga satu
 * kandidat yang salah tidak menjatuhkan seluruh proses. Pembatalan (AbortError)
 * tetap diteruskan ke atas. Kalau semua kandidat gagal, `fallback` dikembalikan.
 *
 * @returns {Promise<any>} body respons kandidat pertama yang berhasil
 */
export async function apiGetFirst(paths, { fallback = null, ...options } = {}) {
  for (const path of paths) {
    try {
      const body = await apiGet(path, options);
      // Respons non-JSON (mis. halaman HTML dari proxy/tunnel) dianggap
      // kandidat gagal, sama seperti perilaku lama yang memeriksa content-type.
      if (typeof body === "string") continue;
      return body;
    } catch (error) {
      if (error?.name === "AbortError") throw error;
      // lanjut ke kandidat berikutnya
    }
  }
  return fallback;
}


/**
 * Normalkan respons berbentuk daftar.
 * Menangani tiga bentuk yang muncul di backend: {data: [...]}, {...}, dan [...].
 */
export const asArray = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};

/**
 * Normalkan respons berbentuk objek tunggal.
 * Beberapa endpoint membungkus di {data: {...}}, sebagian tidak.
 */
export const asObject = (payload) => {
  if (!payload || typeof payload !== "object") return null;
  if (payload.data && typeof payload.data === "object" && !Array.isArray(payload.data)) {
    return payload.data;
  }
  return payload;
};

/**
 * Normalkan pesan error apa pun jadi teks siap tampil.
 * Dipakai agar setiap halaman tidak perlu menulis rantai `err?.message || ...`.
 */
export const errorMessage = (error, fallback = "Terjadi kesalahan. Coba lagi.") => {
  if (!error) return fallback;
  if (typeof error === "string") return error;
  if (error instanceof ApiError) return error.message || fallback;
  return error.message || fallback;
};

export default apiRequest;
