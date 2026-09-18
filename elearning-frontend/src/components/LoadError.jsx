import React from "react";

// Fallback saat halaman gagal memuat datanya — jaringan putus, server tidak
// merespons, atau request melewati batas waktu di setupFetchAuth.js. Tanpa ini
// halaman hanya berputar "Loading..." tanpa jalan keluar bagi pengguna.
export default function LoadError({
  message = "Gagal memuat data.",
  hint = "Periksa koneksi internet Anda, lalu coba lagi.",
  onRetry,
  isRetrying = false,
}) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center text-center py-16 px-6"
    >
      <div className="flex items-center justify-center w-14 h-14 rounded-full bg-red-50 border border-red-100 mb-4">
        <svg
          className="w-7 h-7 text-red-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
          />
        </svg>
      </div>

      <p className="text-gray-800 font-semibold">{message}</p>
      {hint && <p className="text-gray-600 text-sm mt-1 max-w-sm">{hint}</p>}

      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          disabled={isRetrying}
          className="mt-5 px-5 py-2.5 rounded-xl bg-[#0d264f] text-white font-semibold shadow-sm hover:bg-[#0d203f] disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.98] transition-all"
        >
          {isRetrying ? "Mencoba lagi..." : "Coba Lagi"}
        </button>
      )}
    </div>
  );
}
