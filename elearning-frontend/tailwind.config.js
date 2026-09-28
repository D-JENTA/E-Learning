/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Warna identitas EduSpace. Sebelumnya ditulis berulang sebagai
        // arbitrary value (bg-[#0d264f]) di puluhan berkas — dipindahkan ke
        // sini supaya mengubah tema cukup satu tempat, dan supaya varian
        // hover/gradien punya nama yang jelas.
        brand: {
          DEFAULT: "#0d264f", // navy utama: sidebar, tombol, teks judul
          light: "#1a3a75",   // ujung gradien / hover terang
          dark: "#0d203f",    // hover tombol
          darker: "#081a38",  // ujung gelap gradien
        },
      },
    },
  },
  plugins: [],
};
