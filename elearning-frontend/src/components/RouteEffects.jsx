import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { titleForPath } from "../utils/routeTitles";

/**
 * Efek yang berlaku untuk semua route, dipasang sekali di App.jsx:
 *
 * 1. Judul tab mengikuti halaman (sebelumnya tetap "EduSpace Student" untuk
 *    semua role, dan hanya sidebar guru yang memperbaikinya).
 * 2. Scroll kembali ke atas setiap pindah halaman. Tanpa ini, membuka halaman
 *    baru dari daftar yang sudah di-scroll akan mendarat di tengah halaman.
 *
 * Sengaja `behavior: "auto"` (lompat langsung, bukan halus): pada perpindahan
 * halaman, animasi gulir justru terasa lambat dan membuat halaman baru
 * sempat terlihat di posisi yang salah.
 *
 * Dipisah dari halaman-halaman karena window.scrollTo yang ada di beberapa
 * halaman itu untuk urusan lain (ganti halaman pada paginasi), bukan ini.
 */
export default function RouteEffects() {
  const { pathname } = useLocation();

  useEffect(() => {
    document.title = titleForPath(pathname);
  }, [pathname]);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname]);

  return null;
}
