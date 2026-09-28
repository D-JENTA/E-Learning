/**
 * Unduh data yang sudah ada di layar sebagai berkas CSV.
 *
 * Dipakai halaman guru untuk mengunduh rekap nilai (daftar tugas dan
 * pengumpulan siswa). Tidak ada permintaan tambahan ke server — datanya
 * memang sudah dimuat halaman, jadi guru bisa langsung mengarsipkannya
 * atau mengolahnya di Excel/Google Sheets.
 */

// BOM UTF-8, dibangun dari kode karakternya supaya berkas sumber ini tidak
// memuat karakter tak terlihat yang gampang rusak saat disunting.
const UTF8_BOM = String.fromCharCode(0xfeff);

// Tanda diakritik gabungan (combining marks). \p{M} dipilih ketimbang menulis
// rentang kode U+0300 sampai U+036F secara langsung: tulisannya ASCII, jadi
// tidak bisa teracak editor.
const DIACRITICS = /\p{M}/gu;

/**
 * Bungkus satu sel kalau isinya mengandung pemisah, tanda kutip, atau baris
 * baru. Tanda kutip ganda di dalam teks di-escape dengan menggandakannya
 * (aturan CSV standar).
 */
const escapeCell = (value, delimiter) => {
  if (value == null) return "";

  const text = String(value);
  const needsQuotes =
    text.includes(delimiter) || text.includes('"') || /[\r\n]/.test(text);

  return needsQuotes ? `"${text.replace(/"/g, '""')}"` : text;
};

/**
 * Susun teks CSV dari daftar objek.
 *
 * @param {Array<object>} rows data mentah
 * @param {Array<{key: string, label: string, format?: (row: object) => any}>} columns
 *   urutan dan judul kolom; `format` opsional untuk mengubah nilai sebelum ditulis
 * @param {object} [options]
 * @param {string} [options.delimiter] pemisah kolom, default ";"
 * @returns {string}
 */
export const toCsv = (rows, columns, { delimiter = ";" } = {}) => {
  const header = columns.map((col) => escapeCell(col.label, delimiter)).join(delimiter);

  const body = rows.map((row) =>
    columns
      .map((col) => {
        const raw = col.format ? col.format(row) : row[col.key];
        return escapeCell(raw, delimiter);
      })
      .join(delimiter)
  );

  return [header, ...body].join("\r\n");
};

/**
 * Unduh daftar objek sebagai berkas CSV.
 *
 * Dua hal yang sengaja diatur untuk pengguna Excel di Indonesia:
 *
 * 1. Pemisah ";" (bukan ","). Excel dengan locale Indonesia memakai titik koma,
 *    jadi berkas berpemisah koma akan terbaca sebagai satu kolom panjang.
 *    Google Sheets tetap mendeteksi ";" dengan benar.
 * 2. BOM UTF-8 di awal berkas. Tanpa itu, Excel membaca teks ber-aksen sebagai
 *    karakter kacau.
 *
 * @param {string} filename nama berkas, tanpa atau dengan .csv
 * @param {Array<object>} rows
 * @param {Array<object>} columns
 */
export const downloadCsv = (filename, rows, columns, options = {}) => {
  const csv = toCsv(rows, columns, options);
  const blob = new Blob([UTF8_BOM + csv], { type: "text/csv;charset=utf-8;" });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Lepaskan object URL setelah unduhan dimulai, supaya blob tidak
  // menggantung di memori selama halaman terbuka.
  setTimeout(() => URL.revokeObjectURL(url), 0);
};

/**
 * Ubah teks bebas jadi bagian nama berkas yang aman
 * (mis. "Kelas 9A / Matematika" -> "kelas-9a-matematika").
 */
export const slugifyFilename = (text, fallback = "rekap") => {
  const slug = String(text || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(DIACRITICS, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);

  return slug || fallback;
};

export default downloadCsv;
