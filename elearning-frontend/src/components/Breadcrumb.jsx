import React from "react";
import { Link } from "react-router-dom";

/**
 * Jejak navigasi untuk halaman-halaman dalam (kelola kelas, kelola siswa,
 * daftar tugas, pengumpulan, penilaian).
 *
 * Sebelumnya hanya ManageClass.jsx yang punya, dan itu ditulis tangan di
 * dalam halamannya. Komponen ini menyamakan tampilannya di halaman lain
 * sekaligus menambahkan penanda aksesibilitas yang tidak ada di versi
 * tulisan tangan (nav/ol + aria-current).
 *
 * Pemakaian:
 *   <Breadcrumb
 *     className="mb-8"
 *     items={[
 *       { label: "Daftar Kelas", to: "/teacher/classes" },
 *       { label: "Kelas Aktif" },
 *     ]}
 *   />
 *
 * Item terakhir otomatis dianggap halaman aktif (tidak bisa diklik).
 */
export default function Breadcrumb({ items = [], className = "" }) {
  if (items.length === 0) return null;

  return (
    <nav
      aria-label="Breadcrumb"
      className={`flex items-center text-sm text-slate-500 ${className}`}
    >
      <ol className="flex flex-wrap items-center gap-2">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-2">
              {index > 0 && (
                <span aria-hidden="true" className="text-slate-300">
                  /
                </span>
              )}

              {isLast || !item.to ? (
                <span
                  aria-current={isLast ? "page" : undefined}
                  className="font-medium text-slate-800"
                >
                  {item.label}
                </span>
              ) : (
                <Link
                  to={item.to}
                  className="font-medium transition-colors hover:text-brand"
                >
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
