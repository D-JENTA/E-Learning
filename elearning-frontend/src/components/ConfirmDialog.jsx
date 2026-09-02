import React from "react";

// Modal konfirmasi pengganti window.confirm(). Menerima promise resolver
// supaya bisa dipakai di tengah alur async (mis. retry delete setelah 409).
// Warnanya mengikuti palet halaman lain: header navy dari #0d264f ke #1a3a75.
export default function ConfirmDialog({ message, onConfirm, onCancel, confirmText = "Ya, Lanjutkan", cancelText = "Batal", type = "danger" }) {
  const isDanger = type === "danger";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity" onClick={onCancel}></div>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm relative z-10 animate-fade-in-up overflow-hidden">
        <div className="p-6 text-white bg-gradient-to-r from-[#0d264f] to-[#1a3a75]">
          <h3 className="text-xl font-bold">{isDanger ? "Konfirmasi Hapus" : "Konfirmasi"}</h3>
          <p className="text-blue-200 text-sm mt-1">{isDanger ? "Tindakan ini tidak dapat dibatalkan." : "Mohon konfirmasi tindakan Anda."}</p>
        </div>
        <div className="p-6">
          <p className="text-gray-600 text-sm leading-relaxed">{message}</p>
        </div>
        <div className="p-6 pt-0 flex gap-3">
          <button onClick={onCancel} className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-semibold hover:bg-gray-50">
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            autoFocus
            className="flex-1 py-3 rounded-xl text-white font-bold shadow-lg bg-gradient-to-r from-[#0d264f] to-[#1a3a75] hover:shadow-lg hover:scale-[1.02] transition-all duration-300"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
