import React, { useId, useRef } from "react";
import useModalA11y from "../hooks/useModalA11y";

// Modal konfirmasi hapus generik untuk semua role (admin/guru/siswa):
// akun, kelas, mapel, tugas, pengumpulan, dll. Tombol hapus di halaman
// tidak lagi menghapus langsung — request baru dikirim setelah pengguna
// menekan tombol konfirmasi di modal ini.
//
// Dipisah dua lapis: lapisan luar hanya memutuskan modal tampil atau tidak,
// lapisan dalam baru memasang hook-nya. Kalau hook dipasang di lapisan yang
// sama, modal yang mula-mula tersembunyi (message kosong) lalu ditampilkan
// tidak akan mendapat listener Escape dan fokus awal, karena efeknya sudah
// terlanjur jalan saat wadahnya belum ada di DOM.
const ConfirmDeleteModal = ({ message, ...props }) => {
  if (!message) return null;
  return <ConfirmDeleteDialog message={message} {...props} />;
};

const ConfirmDeleteDialog = ({ title, message, confirmText = "Ya, Hapus", onConfirm, onClose, isDeleting }) => {
  // Fokus awal diarahkan ke "Batal", bukan ke tombol hapus — menekan Enter
  // karena refleks tidak boleh langsung menghapus data.
  const cancelRef = useRef(null);
  const containerRef = useModalA11y({ onClose, initialFocusRef: cancelRef });
  const titleId = useId();

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm">
      {/* Klik di luar panel = batal. Tidak berlaku saat proses hapus berjalan. */}
      <div
        className="absolute inset-0"
        aria-hidden="true"
        onClick={() => !isDeleting && onClose?.()}
      ></div>

      <div
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden outline-none"
      >
        <div className="px-6 pt-6 pb-5 flex items-start gap-4">
          <div className="shrink-0 flex items-center justify-center w-12 h-12 rounded-xl bg-red-50 border border-red-100">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            </svg>
          </div>
          <div className="flex-1">
            <h2 id={titleId} className="text-xl font-extrabold text-slate-800">{title}</h2>
            <p className="text-sm text-slate-500 mt-1 leading-relaxed">{message}</p>
          </div>
        </div>

        <div className="flex justify-end gap-3 px-6 pb-6 pt-1">
          <button
            ref={cancelRef}
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
