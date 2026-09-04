import React, { useState, useRef, useEffect } from "react";

// Varian gaya agar cocok dengan dua konteks di MapelAdmin:
// - "navy": header & modal Edit (rounded-xl, aksen #0d264f)
// - "sky" : modal Buat Mapel (rounded-2xl, bg slate, aksen sky-500)
const VARIANTS = {
  navy: {
    button:
      "rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-gray-700 shadow-sm hover:border-[#0d264f]/40 hover:bg-slate-50 focus:border-[#0d264f] focus:ring-2 focus:ring-[#0d264f]/20",
    placeholder: "text-gray-400",
    panel: "rounded-xl border border-gray-100",
    panelHeader: "bg-[#0d264f]/[0.04] border-b border-gray-200/80",
    optionActive: "bg-[#0d264f]/10 text-[#0d264f] font-semibold",
    optionIdle: "text-gray-700 hover:bg-gray-50",
    check: "text-[#0d264f]",
    search: "rounded-lg bg-white border border-gray-200 shadow-sm focus:border-[#0d264f] focus:ring-2 focus:ring-[#0d264f]/20",
  },
  sky: {
    button:
      "rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3.5 text-slate-800 font-medium shadow-sm hover:border-sky-300 hover:bg-white focus:bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20",
    placeholder: "text-slate-400",
    panel: "rounded-2xl border border-slate-100",
    panelHeader: "bg-sky-50/70 border-b border-sky-100",
    optionActive: "bg-sky-50 text-sky-700 font-semibold",
    optionIdle: "text-slate-700 hover:bg-slate-50",
    check: "text-sky-600",
    search: "rounded-lg bg-white border border-slate-200 shadow-sm focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20",
  },
};

/**
 * Dropdown single-select kustom (pengganti <select> native).
 *
 * @param {string|number} value      Nilai terpilih saat ini
 * @param {(value: string) => void} onChange  Dipanggil dengan value opsi (bukan event)
 * @param {{ value: string|number, label: string, description?: string, disabled?: boolean }[]} options
 * @param {string}  placeholder      Teks saat belum ada pilihan
 * @param {boolean} disabled
 * @param {"navy"|"sky"} variant
 * @param {string}  className        Kelas tambahan untuk wrapper (mis. lebar)
 * @param {boolean} clearable        Tampilkan tombol × untuk mengosongkan pilihan (memanggil onChange(""))
 * @param {boolean} searchable       Tampilkan kotak pencarian di panel (filter label & description)
 * @param {string}  searchPlaceholder  Placeholder kotak pencarian
 * @param {boolean} loading          Tampilkan baris "Memuat..." sebagai pengganti daftar opsi
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
  searchable = false,
  searchPlaceholder = "Ketik untuk mencari...",
  loading = false,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const ref = useRef(null);
  const searchInputRef = useRef(null);
  const panelRef = useRef(null);
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

  // Reset pencarian + fokuskan input cari setiap kali panel dibuka,
  // supaya user bisa langsung mengetik tanpa klik lagi.
  useEffect(() => {
    if (!isOpen) return;
    setQuery("");
    setActiveIndex(0);
    if (searchable) {
      requestAnimationFrame(() => searchInputRef.current?.focus());
    }
  }, [isOpen, searchable]);

  const normalizedQuery = query.trim().toLowerCase();
  const filteredOptions =
    normalizedQuery && !loading
      ? options.filter(
          (opt) =>
            String(opt.label ?? "").toLowerCase().includes(normalizedQuery) ||
            String(opt.description ?? "").toLowerCase().includes(normalizedQuery)
        )
      : options;

  // Indeks aktif bisa "nyasar" kalau daftar hasil filter mengecil — kembalikan ke rentang valid.
  useEffect(() => {
    setActiveIndex((i) => Math.min(i, Math.max(filteredOptions.length - 1, 0)));
  }, [filteredOptions.length]);

  const selected = options.find((opt) => String(opt.value) === String(value));

  const handleSelect = (optValue) => {
    onChange(optValue);
    setIsOpen(false);
  };

  const scrollToOption = (index) => {
    const el = panelRef.current?.querySelector(`[data-option-index="${index}"]`);
    el?.scrollIntoView({ block: "nearest" });
  };

  // Navigasi keyboard: panah bawah/atas untuk gerak, Enter untuk pilih.
  // Dipasang di wrapper supaya tetap jalan saat fokus ada di input pencarian;
  // Enter di-prevent supaya tidak ikut submit form modal induk.
  const handleKeyDown = (event) => {
    if (!isOpen || disabled) return;
    switch (event.key) {
      case "ArrowDown": {
        event.preventDefault();
        const next = Math.min(activeIndex + 1, filteredOptions.length - 1);
        setActiveIndex(next);
        scrollToOption(next);
        break;
      }
      case "ArrowUp": {
        event.preventDefault();
        const prev = Math.max(activeIndex - 1, 0);
        setActiveIndex(prev);
        scrollToOption(prev);
        break;
      }
      case "Enter": {
        const opt = filteredOptions[activeIndex];
        if (opt && !opt.disabled) {
          event.preventDefault();
          handleSelect(opt.value);
        }
        break;
      }
      default:
        break;
    }
  };

  const renderOptionBody = (opt) => (
    <span className="min-w-0 flex-1">
      <span className="block truncate">{opt.label}</span>
      {opt.description && (
        <span className="block truncate text-xs font-normal text-gray-400">
          {opt.description}
        </span>
      )}
    </span>
  );

  return (
    <div ref={ref} className={`relative ${className}`} onKeyDown={handleKeyDown}>
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
          ref={panelRef}
          role="listbox"
          className={`absolute left-0 right-0 z-40 mt-2 max-h-60 overflow-y-auto bg-white p-1.5 shadow-xl thin-scrollbar ${styles.panel}`}
        >
          {searchable && (
            <div
              className={`sticky top-0 z-10 px-1.5 pt-1.5 pb-2.5 -mx-1.5 -mt-1.5 mb-1 border-b ${styles.panelHeader}`}
            >
              <div className="relative">
                <svg
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  viewBox="0 0 24 24"
                >
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  ref={searchInputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={searchPlaceholder}
                  className={`w-full pl-9 ${query ? "pr-8" : "pr-3"} py-2 text-sm text-gray-700 bg-white outline-none transition ${styles.search}`}
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => {
                      setQuery("");
                      searchInputRef.current?.focus();
                    }}
                    aria-label="Hapus pencarian"
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-gray-400 hover:bg-gray-200/70 hover:text-gray-600 transition-colors"
                  >
                    <svg
                      className="h-3 w-3"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      viewBox="0 0 24 24"
                    >
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                )}
              </div>
              {!loading && normalizedQuery && options.length > 0 && (
                <p className="mt-1.5 px-1 text-[11px] font-medium text-gray-400">
                  {filteredOptions.length} dari {options.length} opsi
                </p>
              )}
            </div>
          )}

          {loading ? (
            <div className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-gray-400">
              <svg
                className="h-4 w-4 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                />
              </svg>
              Memuat...
            </div>
          ) : options.length === 0 ? (
            <div className="px-3 py-2 text-sm text-gray-400">Tidak ada pilihan</div>
          ) : filteredOptions.length === 0 ? (
            <div className="px-3 py-2 text-sm text-gray-400">
              Tidak ada hasil untuk &ldquo;{query.trim()}&rdquo;
            </div>
          ) : (
            filteredOptions.map((opt, index) => {
              const isActive = String(opt.value) === String(value);
              const isFocused = index === activeIndex;
              return (
                <button
                  key={opt.value}
                  type="button"
                  data-option-index={index}
                  role="option"
                  aria-selected={isActive}
                  aria-disabled={opt.disabled}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => {
                    if (opt.disabled) return;
                    handleSelect(opt.value);
                  }}
                  className={`w-full flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                    isActive ? styles.optionActive : styles.optionIdle
                  } ${
                    opt.disabled
                      ? "opacity-50 cursor-not-allowed"
                      : "cursor-pointer"
                  } ${isFocused && !isActive ? "bg-gray-100" : ""}`}
                >
                  {renderOptionBody(opt)}
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
