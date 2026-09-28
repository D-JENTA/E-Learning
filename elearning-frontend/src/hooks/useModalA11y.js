import { useEffect, useRef } from "react";

// Elemen yang bisa menerima fokus di dalam modal, dipakai untuk menjebak Tab.
const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled]):not([type='hidden'])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

/**
 * Perilaku standar sebuah modal. Sebelumnya tidak ada satu pun modal di
 * aplikasi ini yang punya role="dialog"/aria-modal, dan hanya sebagian yang
 * bisa ditutup dengan Escape.
 *
 * Yang diurus hook ini:
 *  - Escape menutup modal
 *  - Tab berputar di dalam modal (tidak bocor ke halaman di belakangnya)
 *  - fokus awal pindah ke dalam modal
 *  - fokus dikembalikan ke tombol pemicu saat modal ditutup
 *  - halaman di belakang tidak ikut ter-scroll
 *
 * Pemakaian:
 *   const containerRef = useModalA11y({ onClose, initialFocusRef: cancelRef });
 *   <div ref={containerRef} role="dialog" aria-modal="true" tabIndex={-1} ...>
 *
 * Catatan: kalau modal sudah punya listener Escape sendiri, hapus listener itu
 * supaya onClose tidak terpanggil dua kali.
 */
export default function useModalA11y({ onClose, initialFocusRef }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const previouslyFocused = document.activeElement;
    const previousOverflow = document.body.style.overflow;

    // Kunci scroll halaman di belakang modal.
    document.body.style.overflow = "hidden";

    const getFocusable = () =>
      Array.from(container.querySelectorAll(FOCUSABLE_SELECTOR)).filter(
        (el) => el.offsetWidth > 0 || el.offsetHeight > 0
      );

    // Fokus awal: elemen yang diminta pemanggil (biasanya tombol teraman),
    // kalau tidak ada pakai elemen fokusable pertama.
    const initialTarget = initialFocusRef?.current || getFocusable()[0] || container;
    initialTarget?.focus?.();

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        onClose?.();
        return;
      }

      if (event.key !== "Tab") return;

      const items = getFocusable();

      if (items.length === 0) {
        // Tidak ada yang bisa difokus: tahan fokus di wadah modal.
        event.preventDefault();
        container.focus();
        return;
      }

      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;
      const isInside = container.contains(active);

      if (event.shiftKey && (active === first || !isInside)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (active === last || !isInside)) {
        event.preventDefault();
        first.focus();
      }
    };

    // Fase capture supaya Escape tertangkap sebelum handler lain di halaman.
    document.addEventListener("keydown", handleKeyDown, true);

    return () => {
      document.removeEventListener("keydown", handleKeyDown, true);
      document.body.style.overflow = previousOverflow;
      // Kembalikan fokus ke elemen pemicu (mis. tombol Hapus) supaya pengguna
      // keyboard tidak terlempar ke awal dokumen.
      previouslyFocused?.focus?.();
    };
  }, [onClose, initialFocusRef]);

  return containerRef;
}
