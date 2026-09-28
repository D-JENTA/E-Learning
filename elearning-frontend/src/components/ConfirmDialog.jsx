import React, { useId, useRef } from "react";
import useModalA11y from "../hooks/useModalA11y";

// Modal konfirmasi pengganti window.confirm(). Menerima promise resolver
// supaya bisa dipakai di tengah alur async (mis. retry delete setelah 409).
// Warnanya mengikuti palet halaman lain: header navy dari brand ke brand-light.
export default function ConfirmDialog({ message, onConfirm, onCancel, confirmText = "Ya, Lanjutkan", cancelText = "Batal", type = "danger" }) {
  const isDanger = type === "danger";

  // Fokus awal: untuk konfirmasi berbahaya ke "Batal" (menekan Enter karena
  // refleks tidak boleh langsung menghapus), untuk konfirmasi biasa ke tombol
  // lanjut seperti perilaku autoFocus sebelumnya.
  const cancelRef = useRef(null);
  const confirmRef = useRef(null);
  const containerRef = useModalA11y({
    onClose: onCancel,
    initialFocusRef: isDanger ? cancelRef : confirmRef,
  });
  const titleId = useId();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        aria-hidden="true"
        onClick={onCancel}
      ></div>
      <div
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm relative z-10 animate-fade-in-up overflow-hidden outline-none"
      >
        <div className="p-6 text-white bg-gradient-to-r from-brand to-brand-light">
          <h3 id={titleId} className="text-xl font-bold">{isDanger ? "Konfirmasi Hapus" : "Konfirmasi"}</h3>
          <p className="text-blue-200 text-sm mt-1">{isDanger ? "Tindakan ini tidak dapat dibatalkan." : "Mohon konfirmasi tindakan Anda."}</p>
        </div>
        <div className="p-6">
          <p className="text-gray-600 text-sm leading-relaxed">{message}</p>
        </div>
        <div className="p-6 pt-0 flex gap-3">
          <button
            ref={cancelRef}
            onClick={onCancel}
            className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-semibold hover:bg-gray-50"
          >
            {cancelText}
          </button>
          <button
            ref={confirmRef}
            onClick={onConfirm}
            className="flex-1 py-3 rounded-xl text-white font-bold shadow-lg bg-gradient-to-r from-brand to-brand-light hover:shadow-lg hover:scale-[1.02] transition-all duration-300"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
