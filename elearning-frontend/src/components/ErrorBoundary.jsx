import React from "react";

/**
 * Batas error per-route.
 *
 * Tanpa ini, satu error saat render (mis. data dari API bentuknya tidak
 * seperti yang diharapkan) membuat React melepas seluruh pohon komponen —
 * hasilnya layar putih untuk SEMUA halaman, padahal yang rusak cuma satu.
 *
 * Boundary ini dipasang di App.jsx mengelilingi <Routes>, dan di-reset lewat
 * `resetKey` (pathname). Jadi begitu pengguna pindah halaman, batas ini
 * otomatis bersih dan halaman tujuan bisa render normal — tidak perlu reload.
 */
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, errorInfo) {
    // Simpan di console supaya tetap bisa ditelusuri saat development,
    // meski UI-nya sudah diganti fallback.
    console.error("ErrorBoundary menangkap error render:", error, errorInfo);
  }

  componentDidUpdate(prevProps) {
    // Pindah route = kesempatan baru. Tanpa ini, fallback akan menempel terus
    // sampai pengguna me-reload halaman secara manual.
    if (this.state.error && prevProps.resetKey !== this.props.resetKey) {
      this.setState({ error: null });
    }
  }

  handleRetry = () => {
    this.setState({ error: null });
  };

  render() {
    const { error } = this.state;

    if (!error) return this.props.children;

    const { fallbackPath = "/", fallbackLabel = "Kembali ke Dashboard" } = this.props;

    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 p-6">
        <div className="w-full max-w-lg bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="flex items-start gap-4 p-6">
            <div className="shrink-0 flex items-center justify-center w-12 h-12 rounded-xl bg-amber-50 border border-amber-100">
              <svg
                className="w-6 h-6 text-amber-600"
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

            <div className="flex-1">
              <h1 className="text-xl font-extrabold text-slate-800">
                Halaman ini gagal ditampilkan
              </h1>
              <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                Terjadi kesalahan saat memuat halaman ini. Halaman lain masih
                bisa dipakai — silakan coba lagi atau kembali ke dashboard.
              </p>
            </div>
          </div>

          {/* Detail teknis hanya saat development; pengguna umum tidak perlu
              melihat stack trace. */}
          {import.meta.env.DEV && (
            <details className="mx-6 mb-2 rounded-xl bg-slate-50 border border-slate-200 px-4 py-3">
              <summary className="text-xs font-bold text-slate-500 uppercase tracking-wider cursor-pointer">
                Detail teknis
              </summary>
              <pre className="mt-2 text-xs text-rose-600 whitespace-pre-wrap break-words max-h-48 overflow-auto">
                {String(error?.stack || error?.message || error)}
              </pre>
            </details>
          )}

          <div className="flex flex-col sm:flex-row gap-3 p-6 pt-4">
            <button
              type="button"
              onClick={this.handleRetry}
              className="flex-1 px-5 py-3 rounded-xl border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 active:scale-[0.98] transition-all"
            >
              Coba Lagi
            </button>
            <a
              href={fallbackPath}
              className="flex-1 px-5 py-3 rounded-xl bg-brand text-white font-semibold text-center shadow-sm hover:bg-brand-dark active:scale-[0.98] transition-all"
            >
              {fallbackLabel}
            </a>
          </div>
        </div>
      </div>
    );
  }
}
