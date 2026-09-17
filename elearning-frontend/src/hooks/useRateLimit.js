import { useCallback, useEffect, useState } from 'react';

const DEFAULT_RATE_LIMIT_SECONDS = 60;

/**
 * Format sisa detik jadi "mm:ss" untuk ditampilkan di tombol.
 * @param {number} seconds
 * @returns {string}
 */
export const formatCooldown = (seconds) => {
  const safeSeconds = Math.max(0, seconds);
  const minutes = Math.floor(safeSeconds / 60);
  const remainingSeconds = safeSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
};

/**
 * Pesan seragam untuk kondisi kena limit.
 * @param {number} seconds
 * @returns {string}
 */
export const rateLimitMessage = (seconds) =>
  `Terlalu banyak percobaan. Coba lagi dalam ${formatCooldown(seconds)}.`;

/**
 * Ambil sisa waktu tunggu (detik) dari respons 429.
 *
 * `express-rate-limit` (lihat elearning-backend/middleware/rateLimiter.js, `standardHeaders: true`)
 * mengirim header `RateLimit-Reset` berisi DETIK SISA, bukan epoch — cabang
 * `resetNumber > nowSeconds` di bawah yang membedakan keduanya. `Retry-After`, bila ada,
 * juga berisi detik sisa.
 *
 * @param {Response} response
 * @param {object|null} result body JSON respons, kalau ada
 * @returns {number}
 */
export const getRetryAfterSeconds = (response, result) => {
  const retryAfterHeader = response.headers.get('Retry-After');
  const rateLimitResetHeader = response.headers.get('RateLimit-Reset');

  if (retryAfterHeader) {
    const retryAfterNumber = Number(retryAfterHeader);
    if (!Number.isNaN(retryAfterNumber) && retryAfterNumber > 0) {
      return Math.ceil(retryAfterNumber);
    }
    const retryAfterDate = Date.parse(retryAfterHeader);
    if (!Number.isNaN(retryAfterDate)) {
      return Math.max(1, Math.ceil((retryAfterDate - Date.now()) / 1000));
    }
  }

  if (rateLimitResetHeader) {
    const resetNumber = Number(rateLimitResetHeader);
    if (!Number.isNaN(resetNumber) && resetNumber > 0) {
      const nowSeconds = Math.floor(Date.now() / 1000);
      return resetNumber > nowSeconds ? resetNumber - nowSeconds : resetNumber;
    }
  }

  return Number(result?.retryAfter) || DEFAULT_RATE_LIMIT_SECONDS;
};

/**
 * Hitung mundur batas percobaan, disimpan di localStorage supaya tetap jalan
 * setelah reload.
 *
 * Kunci penyimpanan sengaja dipisah per halaman. Backend memakai SATU instance
 * `loginLimiter` untuk `/auth/login`, `/auth/verifyOtp`, dan `/auth/resend-otp`,
 * jadi jatahnya sebenarnya dibagi bersama per IP — tapi tiap halaman cukup
 * menghitung mundur dari 429 yang ia terima sendiri, dan header `RateLimit-Reset`
 * dari backend tetap jadi sumber kebenaran sisa waktunya.
 *
 * @param {string} storageKey kunci localStorage, mis. 'login_rate_limit_until'
 */
export const useRateLimit = (storageKey) => {
  const [rateLimitSeconds, setRateLimitSeconds] = useState(0);

  useEffect(() => {
    const updateCooldown = () => {
      const storedUntil = Number(localStorage.getItem(storageKey) || 0);
      const remaining = Math.ceil((storedUntil - Date.now()) / 1000);
      if (remaining > 0) {
        setRateLimitSeconds(remaining);
      } else {
        setRateLimitSeconds(0);
        localStorage.removeItem(storageKey);
      }
    };

    updateCooldown();
    const interval = setInterval(updateCooldown, 1000);
    return () => clearInterval(interval);
  }, [storageKey]);

  /** Mulai hitung mundur. Mengembalikan jumlah detik yang dipakai. */
  const startCooldown = useCallback(
    (seconds = DEFAULT_RATE_LIMIT_SECONDS) => {
      const cooldownSeconds =
        Number(seconds) > 0 ? Number(seconds) : DEFAULT_RATE_LIMIT_SECONDS;
      localStorage.setItem(storageKey, String(Date.now() + cooldownSeconds * 1000));
      setRateLimitSeconds(cooldownSeconds);
      return cooldownSeconds;
    },
    [storageKey]
  );

  /** Hentikan hitung mundur (dipakai setelah login berhasil). */
  const clearCooldown = useCallback(() => {
    localStorage.removeItem(storageKey);
    setRateLimitSeconds(0);
  }, [storageKey]);

  return {
    rateLimitSeconds,
    isRateLimited: rateLimitSeconds > 0,
    startCooldown,
    clearCooldown,
  };
};

export default useRateLimit;
