import React from "react";

// Modal konfirmasi hapus generik untuk semua role (admin/guru/siswa):
// akun, kelas, mapel, tugas, pengumpulan, dll. Tombol hapus di halaman
// tidak lagi menghapus langsung — request baru dikirim setelah pengguna
// menekan tombol konfirmasi di modal ini.
const ConfirmDeleteModal = ({ title, message, confirmText = "Ya, Hapus", onConfirm, onClose, isDeleting }) => {
  if (!message) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">
        <div className="px-6 pt-6 pb-5 flex items-start gap-4">
          <div className="shrink-0 flex items-center justify-center w-12 h-12 rounded-xl bg-red-50 border border-red-100">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            </svg>
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-extrabold text-slate-800">{title}</h2>
            <p className="text-sm text-slate-500 mt-1 leading-relaxed">{message}</p>
          </div>
        </div>

        <div className="flex justify-end gap-3 px-6 pb-6 pt-1">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-5 py-3 rounded-xl font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Batal
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-5 py-3 rounded-xl bg-red-600 text-white font-semibold shadow-sm hover:bg-red-700 disabled:opacity-70 disabled:cursor-not-allowed active:scale-[0.98] transition-all"
          >
            {isDeleting ? "Menghapus..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeleteModal;
