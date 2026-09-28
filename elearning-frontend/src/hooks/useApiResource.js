import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Muat satu sumber data ke halaman: status memuat, error, dan cara mengulang.
 *
 * Pola yang digantikan (ditulis ulang di hampir semua halaman):
 *
 *   const [data, setData] = useState(null);
 *   const [isLoading, setIsLoading] = useState(true);
 *   useEffect(() => { fetch(...).then(...).then(setData).finally(() => setIsLoading(false)); }, []);
 *
 * Yang didapat tambahan: pembatalan request saat komponen unmount (lewat
 * AbortSignal, dihormati setupFetchAuth.js), state error yang bisa ditampilkan
 * beserta tombol coba lagi, dan tidak ada lagi state ter-update setelah unmount.
 *
 * @param {(ctx: {signal: AbortSignal}) => Promise<any>} fetcher
 * @param {string} key berubah => muat ulang. Isi dengan nilai yang menentukan
 *   request, mis. `mapel-${id}`. JANGAN kirim array dependency.
 *
 * Catatan: `fetcher` tidak perlu dibungkus useCallback — hook ini selalu
 * memanggil versi terbarunya, jadi tidak ada masalah closure basi.
 */
export default function useApiResource(fetcher, key = "") {
  // `isLoading` sengaja TIDAK disimpan sebagai state. Kalau disimpan, setiap
  // kali mulai memuat efeknya harus memanggil setState lebih dulu — setState
  // sinkron di dalam efek memicu render berantai dan ditolak oleh aturan
  // react-hooks/set-state-in-effect.
  //
  // Gantinya: simpan kunci request yang menghasilkan state ini, lalu turunkan
  // "sedang memuat" dari perbandingan — state yang ada bukan milik request
  // yang sedang berjalan berarti masih memuat.
  const [state, setState] = useState({ key: null, data: null, error: null });
  const [reloadToken, setReloadToken] = useState(0);

  const requestKey = `${key}::${reloadToken}`;

  const fetcherRef = useRef(fetcher);
  useEffect(() => {
    fetcherRef.current = fetcher;
  });

  useEffect(() => {
    let isActive = true;
    const controller = new AbortController();

    // Dibungkus Promise.resolve() supaya fetcher yang melempar error secara
    // sinkron pun tetap tertangkap di .catch, bukan meledak di dalam efek.
    Promise.resolve()
      .then(() => fetcherRef.current({ signal: controller.signal }))
      .then((data) => {
        if (isActive) setState({ key: requestKey, data, error: null });
      })
      .catch((error) => {
        // AbortError = request dibatalkan karena unmount / key berubah.
        // Bukan kegagalan, jadi jangan ditampilkan sebagai error.
        if (!isActive || error?.name === "AbortError") return;
        setState({ key: requestKey, data: null, error });
      });

    return () => {
      isActive = false;
      controller.abort();
    };
  }, [requestKey]);

  const reload = useCallback(() => setReloadToken((n) => n + 1), []);

  // Data dan error dari kunci lama sengaja tidak diteruskan. Kalau diteruskan,
  // saat pindah mapel halaman sempat menampilkan isi mapel sebelumnya sambil
  // memuat yang baru — angka yang salah, walau cuma sekilas.
  const isCurrent = state.key === requestKey;

  return {
    data: isCurrent ? state.data : null,
    error: isCurrent ? state.error : null,
    isLoading: !isCurrent,
    reload,
  };
}
