import React, { useState, useRef, useEffect } from "react";

// Varian gaya agar cocok dengan dua konteks di MapelAdmin:
// - "navy": header & modal Edit (rounded-xl, aksen #0d264f)
// - "sky" : modal Buat Mapel (rounded-2xl, bg slate, aksen sky-500)
const VARIANTS = {
  navy: {
    button:
      "rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-gray-700 shadow-sm focus:border-[#0d264f] focus:ring-2 focus:ring-[#0d264f]/20",
    placeholder: "text-gray-400",
    panel: "rounded-xl border border-gray-100",
    optionActive: "bg-[#0d264f]/10 text-[#0d264f] font-semibold",
    optionIdle: "text-gray-700 hover:bg-gray-50",
    check: "text-[#0d264f]",
  },
  sky: {
    button:
      "rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3.5 text-slate-800 font-medium shadow-sm focus:bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20",
    placeholder: "text-slate-400",
    panel: "rounded-2xl border border-slate-100",
    optionActive: "bg-sky-50 text-sky-700 font-semibold",
    optionIdle: "text-slate-700 hover:bg-slate-50",
    check: "text-sky-600",
  },
};

/**
 * Dropdown single-select kustom (pengganti <select> native).
 *
 * @param {string|number} value      Nilai terpilih saat ini
 * @param {(value: string) => void} onChange  Dipanggil dengan value opsi (bukan event)
 * @param {{ value: string|number, label: string }[]} options
 * @param {string}  placeholder      Teks saat belum ada pilihan
 * @param {boolean} disabled
 * @param {"navy"|"sky"} variant
 * @param {string}  className        Kelas tambahan untuk wrapper (mis. lebar)
 * @param {boolean} clearable        Tampilkan tombol × untuk mengosongkan pilihan (memanggil onChange(""))
 */
export default function CustomSelect({
  value,
  onChange,
  options = [],
  placeholder = "Pilih...",
  disabled = false,
  variant = "navy",
  className = "",
  clearable = false,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);
  const styles = VARIANTS[variant] ?? VARIANTS.navy;

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (event) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const selected = options.find((opt) => String(opt.value) === String(value));

  const handleSelect = (optValue) => {
    onChange(optValue);
    setIsOpen(false);
  };

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-full flex items-center justify-between gap-2 text-left transition appearance-none focus:outline-none disabled:cursor-not-allowed disabled:opacity-60 ${styles.button}`}
      >
        <span
          className={`min-w-0 flex-1 truncate ${selected ? "" : styles.placeholder}`}
        >
          {selected ? selected.label : placeholder}
        </span>
        {clearable && selected && (
          <svg
            width="18"
            height="18"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            role="button"
            aria-label="Kosongkan pilihan"
            onClick={(e) => {
              e.stopPropagation();
              onChange("");
              setIsOpen(false);
            }}
            className="flex-shrink-0 rounded-full p-0.5 text-gray-400 hover:bg-gray-200/70 hover:text-gray-600 transition-colors"
          >
            <path
              d="M6 6L14 14M14 6L6 14"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
        <svg
          width="18"
          height="18"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`flex-shrink-0 transition-transform duration-200 ${styles.placeholder} ${
            isOpen ? "rotate-180" : ""
          }`}
        >
          <path
            d="M6 8L10 12L14 8"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {isOpen && !disabled && (
        <div
          className={`absolute left-0 right-0 z-40 mt-2 max-h-60 overflow-y-auto bg-white p-1.5 shadow-xl thin-scrollbar ${styles.panel}`}
        >
          {options.length === 0 ? (
            <div className="px-3 py-2 text-sm text-gray-400">Tidak ada pilihan</div>
          ) : (
            options.map((opt) => {
              const isActive = String(opt.value) === String(value);
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleSelect(opt.value)}
                  className={`w-full flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                    isActive ? styles.optionActive : styles.optionIdle
                  }`}
                >
                  <span className="min-w-0 flex-1 truncate">{opt.label}</span>
                  {isActive && (
                    <svg
                      className={`h-4 w-4 flex-shrink-0 ${styles.check}`}
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.7 5.3a1 1 0 010 1.4l-7.5 7.5a1 1 0 01-1.4 0L3.3 9.7a1 1 0 011.4-1.4l3.3 3.3 6.8-6.8a1 1 0 011.4 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
