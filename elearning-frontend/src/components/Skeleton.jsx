import React from "react";

/**
 * Placeholder saat data sedang dimuat.
 *
 * Sebelumnya halaman menampilkan spinner di tengah layar, jadi bentuk halaman
 * "melompat" saat data tiba. Skeleton memakai kerangka yang menyerupai isi
 * akhirnya sehingga perpindahannya terasa tenang.
 *
 * `animate-pulse` otomatis dimatikan saat pengguna mengaktifkan
 * "kurangi gerakan" (lihat input.css) — bloknya tetap terbaca, hanya diam.
 */

// Blok dasar. Ukuran diatur lewat className pemanggil.
export const Skeleton = ({ className = "" }) => (
  <div
    className={`animate-pulse rounded-lg bg-slate-200/80 ${className}`}
    aria-hidden="true"
  />
);

// Kartu statistik: label kecil, angka besar, kotak ikon di kanan.
export const StatCardSkeleton = () => (
  <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
    <div className="flex items-start justify-between">
      <div className="space-y-3">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-9 w-16" />
      </div>
      <Skeleton className="h-12 w-12 rounded-xl" />
    </div>
    <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
      <Skeleton className="h-3 w-20" />
      <Skeleton className="h-2 w-2 rounded-full" />
    </div>
  </div>
);

// Satu baris daftar: ikon kotak, dua baris teks, dan nilai di kanan.
export const ListRowSkeleton = () => (
  <div className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
    <Skeleton className="h-12 w-12 shrink-0 rounded-xl" />
    <div className="flex-1 space-y-2.5">
      <Skeleton className="h-4 w-2/5" />
      <Skeleton className="h-3 w-1/4" />
    </div>
    <Skeleton className="h-8 w-20 rounded-xl" />
  </div>
);

// Beberapa baris daftar sekaligus.
export const ListSkeleton = ({ rows = 5 }) => (
  <div className="space-y-3">
    {Array.from({ length: rows }, (_, i) => (
      <ListRowSkeleton key={i} />
    ))}
  </div>
);

// Grid kartu statistik (dashboard).
export const StatGridSkeleton = ({ cards = 3, columns = "sm:grid-cols-3" }) => (
  <div className={`grid grid-cols-1 ${columns} gap-6`}>
    {Array.from({ length: cards }, (_, i) => (
      <StatCardSkeleton key={i} />
    ))}
  </div>
);

export default Skeleton;
