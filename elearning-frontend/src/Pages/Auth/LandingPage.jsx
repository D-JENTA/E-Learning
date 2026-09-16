import React from "react";
import { Link } from "react-router-dom";
import EduSpace from "../../assets/EduSpace.png";

const Ikon = ({ d, className = "h-6 w-6" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d={d} />
  </svg>
);

const pergiKe = (id) => (e) => {
  e.preventDefault();
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
};

const fitur = [
  {
    judul: "Kelas & Mata Pelajaran",
    desc: "Siswa bergabung ke kelas cukup dengan kode undangan, lalu mengakses semua mata pelajaran dalam satu tempat yang rapi.",
    icon: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10",
  },
  {
    judul: "Tugas & Pengumpulan",
    desc: "Guru membagikan tugas per mata pelajaran, siswa mengumpulkan jawaban langsung dari aplikasi, dan hasilnya terkumpul otomatis.",
    icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
  },
  {
    judul: "Penilaian Guru",
    desc: "Guru menilai setiap pengumpulan tugas dengan skor yang jelas, lengkap dengan rekap nilai total setiap siswa.",
    icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
  },
  {
    judul: "Materi Pembelajaran",
    desc: "Guru mengunggah materi pelajaran agar siswa dapat belajar dan mengulang kapan saja, di mana saja.",
    icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.247m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.247",
  },
  {
    judul: "Kalender & Jadwal",
    desc: "Jadwal pelajaran tersusun rapi dalam kalender, dan dapat dicetak menjadi PDF untuk ditempel di kelas.",
    icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
  },
];

const peran = [
  {
    judul: "Siswa",
    desc: "Gabung kelas, kerjakan dan kumpulkan tugas, pelajari materi, dan pantau nilai — semuanya dalam satu aplikasi.",
    warna: "from-sky-500 to-blue-600",
    cahaya: "bg-sky-50 text-sky-600",
    icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
    daftar: ["Gabung kelas", "Kumpulkan tugas langsung", "Akses materi kapan saja", "Lihat nilai tugas"],
  },
  {
    judul: "Guru",
    desc: "Kelola kelas dan siswa, unggah materi serta tugas, lalu nilai pengumpulan siswa dengan mudah dan terstruktur.",
    warna: "from-indigo-500 to-violet-600",
    cahaya: "bg-indigo-50 text-indigo-600",
    icon: "M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z",
    daftar: ["Kelola kelas & siswa", "Unggah materi & tugas", "Nilai pengumpulan siswa", "Rekap nilai total"],
  },
  {
    judul: "Admin",
    desc: "Awasi seluruh sekolah: kelola siswa, guru, kelas, dan mata pelajaran, serta pantau semuanya dari satu dasbor.",
    warna: "from-emerald-500 to-teal-600",
    cahaya: "bg-emerald-50 text-emerald-600",
    icon: "M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z",
    daftar: ["Kelola pengguna & peran", "Atur kelas & mata pelajaran", "Cetak jadwal PDF", "Dasbor admin"],
  },
];

const langkah = [
  {
    nomor: "01",
    judul: "Buat Akun",
    desc: "Daftar dengan email, lalu verifikasi kode OTP yang dikirim ke kotak masukmu. Aman dan hanya butuh sebentar.",
  },
  {
    nomor: "02",
    judul: "Masuk ke Kelas",
    desc: "Masukkan kode kelas dari gurumu, dan semua mata pelajaran beserta tugasnya langsung tersedia untukmu.",
  },
  {
    nomor: "03",
    judul: "Belajar & Kerjakan",
    desc: "Pelajari materi, kerjakan tugas, kumpulkan jawaban, dan lihat nilainya — semuanya tercatat rapi.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col overflow-x-hidden">
      {/* ===== Bilah Navigasi ===== */}
      <nav className="bg-white/80 backdrop-blur-md fixed w-full z-50 border-b border-slate-200/70 shadow-sm">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 h-20 flex items-center justify-between">
          <a href="#beranda" onClick={pergiKe("beranda")} className="flex items-center gap-2">
            <img src={EduSpace} alt="Logo EduSpace" className="h-10 w-auto object-contain" />
            <span className="text-2xl font-bold text-[#0d264f] tracking-tight">
              Edu<span className="text-blue-600">Space</span>
            </span>
          </a>

          <div className="hidden md:flex items-center gap-8 font-medium text-slate-600">
            <a href="#peran" onClick={pergiKe("peran")} className="hover:text-[#0d264f] transition-colors">Untuk Siapa</a>
            <a href="#fitur" onClick={pergiKe("fitur")} className="hover:text-[#0d264f] transition-colors">Fitur</a>
            <a href="#langkah" onClick={pergiKe("langkah")} className="hover:text-[#0d264f] transition-colors">Cara Mulai</a>
            <a href="#kontak" onClick={pergiKe("kontak")} className="hover:text-[#0d264f] transition-colors">Kontak</a>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              to="/login"
              className="px-4 py-2.5 sm:px-5 rounded-xl border border-[#0d264f] text-[#0d264f] font-semibold hover:bg-[#0d264f] hover:text-white transition-all duration-300 text-sm sm:text-base"
            >
              Masuk
            </Link>
          </div>
        </div>
      </nav>

      {/* ===== Bagian Utama ===== */}
      <header id="beranda" className="relative pt-36 pb-24 lg:pt-44 lg:pb-32 overflow-hidden">
        {/* Hiasan latar */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-b from-[#e0f2fe] via-white to-slate-50" />
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-200/40 rounded-full blur-3xl" />
          <div className="absolute top-40 -left-24 w-80 h-80 bg-indigo-200/40 rounded-full blur-3xl" />
          <div className="absolute inset-0 opacity-[0.04]" style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, #0d264f 1px, transparent 0)",
            backgroundSize: "28px 28px",
          }} />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-[#0d264f] tracking-tight mb-6 leading-tight">
            Belajar Jadi Lebih Rapi,
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">
              Tugas Tak Ada yang Terlewat.
            </span>
          </h1>

          <p className="text-lg md:text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            EduSpace menghubungkan siswa, guru, dan admin sekolah dalam satu tempat —
            dari pembagian materi dan tugas, pengumpulan jawaban, sampai penilaian dan jadwal pelajaran.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/create"
              className="w-full sm:w-auto px-8 py-4 rounded-xl text-lg font-bold text-white bg-gradient-to-r from-[#0d264f] to-[#1a3a75] hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 shadow-xl"
            >
              Mulai Belajar Sekarang
            </Link>
            <a
              href="#fitur"
              onClick={pergiKe("fitur")}
              className="w-full sm:w-auto px-8 py-4 rounded-xl text-lg font-semibold text-[#0d264f] bg-white border border-slate-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300"
            >
              Lihat Fiturnya
            </a>
          </div>

          {/* Kartu pratinjau */}
          <div className="mt-16 max-w-4xl mx-auto">
            <div className="relative bg-white rounded-2xl border border-slate-200 shadow-2xl shadow-blue-900/10 p-6 sm:p-8 text-left">
              <div className="flex items-center gap-2 mb-6">
                <span className="w-3 h-3 rounded-full bg-red-400" />
                <span className="w-3 h-3 rounded-full bg-yellow-400" />
                <span className="w-3 h-3 rounded-full bg-green-400" />
                <span className="ml-3 text-xs text-slate-400 font-medium">eduspace — mata pelajaran</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-xl bg-blue-50 border border-blue-100 p-4">
                  <p className="text-xs font-semibold text-blue-600 mb-1 uppercase tracking-wide">Matematika</p>
                  <p className="text-sm text-slate-600">Tugas 3 dikumpulkan besok pukul 23.59</p>
                </div>
                <div className="rounded-xl bg-indigo-50 border border-indigo-100 p-4">
                  <p className="text-xs font-semibold text-indigo-600 mb-1 uppercase tracking-wide">B. Indonesia</p>
                  <p className="text-sm text-slate-600">Materi baru: Teks Eksplanasi</p>
                </div>
                <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-4">
                  <p className="text-xs font-semibold text-emerald-600 mb-1 uppercase tracking-wide">Nilai Baru</p>
                  <p className="text-sm text-slate-600">Tugas 2 sudah dinilai — 90</p>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-3 rounded-xl bg-slate-50 border border-slate-100 p-4">
                <div className="w-9 h-9 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
                  <Ikon d="M5 13l4 4L19 7" className="h-5 w-5" />
                </div>
                <p className="text-sm text-slate-600">
                  <span className="font-semibold text-slate-800">Rina</span> mengumpulkan tugas Aljabar — barusan
                </p>
                <span className="ml-auto text-xs text-slate-400 hidden sm:block">notifikasi langsung</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ===== Untuk Siapa ===== */}
      <section id="peran" className="py-20 lg:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-sm font-bold tracking-widest text-blue-600 uppercase mb-3">Untuk Siapa</p>
            <h2 className="text-3xl md:text-4xl font-bold text-[#0d264f] mb-4">
              Satu Aplikasi, Tiga Peran Penting
            </h2>
            <p className="text-slate-500 max-w-xl mx-auto text-lg">
              Setiap orang punya ruangnya sendiri, dengan fitur yang memang dirancang untuk perannya.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {peran.map((p) => (
              <div
                key={p.judul}
                className="group relative rounded-2xl border border-slate-200 bg-slate-50/50 p-8 hover:border-transparent hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 overflow-hidden"
              >
                <div className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${p.warna}`} />

                <div className={`w-14 h-14 rounded-2xl ${p.cahaya} flex items-center justify-center mb-6`}>
                  <Ikon d={p.icon} className="h-7 w-7" />
                </div>

                <h3 className="text-2xl font-bold text-[#0d264f] mb-3">{p.judul}</h3>
                <p className="text-slate-600 mb-6 leading-relaxed">{p.desc}</p>

                <ul className="space-y-3">
                  {p.daftar.map((item) => (
                    <li key={item} className="flex items-start gap-3 text-sm text-slate-600">
                      <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                        <Ikon d="M5 13l4 4L19 7" className="h-3.5 w-3.5" />
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Fitur ===== */}
      <section id="fitur" className="py-20 lg:py-28 bg-slate-50 relative overflow-hidden">
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-blue-100/60 rounded-full blur-3xl -z-0" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-sm font-bold tracking-widest text-blue-600 uppercase mb-3">Fitur Unggulan</p>
            <h2 className="text-3xl md:text-4xl font-bold text-[#0d264f] mb-4">
              Semua Kebutuhan Belajar Mengajar
            </h2>
            <p className="text-slate-500 max-w-xl mx-auto text-lg">
              Dari kode kelas sampai rekap nilai — semuanya sudah beres di satu aplikasi.
            </p>
          </div>

          {/* flex-wrap + justify-center: baris terakhir (2 kartu) tetap di tengah, tidak menyisakan lubang */}
          <div className="flex flex-wrap justify-center gap-8">
            {fitur.map((f) => (
              <div
                key={f.judul}
                className="w-full md:w-[calc(50%_-_1.25rem)] lg:w-[calc(33.333%_-_1.5rem)] p-8 rounded-2xl bg-white border border-slate-100 hover:border-blue-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl flex items-center justify-center mb-6 shadow-sm text-[#0d264f]">
                  <Ikon d={f.icon} className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-[#0d264f] mb-3">{f.judul}</h3>
                <p className="text-slate-600 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Cara Mulai ===== */}
      <section id="langkah" className="py-20 lg:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-sm font-bold tracking-widest text-blue-600 uppercase mb-3">Cara Mulai</p>
            <h2 className="text-3xl md:text-4xl font-bold text-[#0d264f] mb-4">
              Tiga Langkah, Langsung Jalan
            </h2>
            <p className="text-slate-500 max-w-xl mx-auto text-lg">
              Tidak perlu pelatihan khusus — siswa baru pun bisa langsung memakainya.
            </p>
          </div>

          <div className="relative grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Garis penghubung */}
            <div className="hidden lg:block absolute top-10 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-blue-200 via-indigo-200 to-emerald-200" />

            {langkah.map((l) => (
              <div key={l.nomor} className="relative text-center">
                <div className="relative z-10 w-20 h-20 mx-auto mb-6 rounded-full bg-white border-2 border-blue-100 shadow-lg flex items-center justify-center">
                  <span className="text-2xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">
                    {l.nomor}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-[#0d264f] mb-3">{l.judul}</h3>
                <p className="text-slate-600 leading-relaxed max-w-xs mx-auto">{l.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Ajakan Penutup ===== */}
      <section className="py-20 bg-gradient-to-r from-[#0d264f] to-[#1a3a75] relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)",
          backgroundSize: "24px 24px",
        }} />
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-5 leading-tight">
            Siap Bikin Kelasmu Lebih Tertata?
          </h2>
          <p className="text-blue-100 text-lg mb-10 leading-relaxed">
            Bergabung bersama siswa, guru, dan admin yang sudah membuat proses belajar mengajar
            jadi lebih terstruktur dan menyenangkan.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/create"
              className="w-full sm:w-auto px-8 py-4 rounded-xl text-lg font-bold text-[#0d264f] bg-white hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 shadow-lg"
            >
              Daftar Sekarang
            </Link>
          </div>
        </div>
      </section>

      {/* ===== Bagian Kontak ===== */}
      <footer id="kontak" className="bg-white border-t border-slate-200 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-sm">
            <div className="col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <img src={EduSpace} alt="Logo EduSpace" className="w-9 h-9 object-contain" />
                <span className="text-xl font-bold text-[#0d264f]">
                  Edu<span className="text-blue-600">Space</span>
                </span>
              </div>
              <p className="text-slate-500 leading-relaxed">
                Platform pembelajaran dalam satu tempat untuk sekolah yang lebih produktif —
                dari materi, tugas, penilaian, sampai jadwal.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-[#0d264f] mb-4">Jelajahi</h4>
              <ul className="space-y-2.5 text-slate-500">
                <li><a href="#fitur" onClick={pergiKe("fitur")} className="hover:text-[#0d264f] transition-colors">Fitur</a></li>
                <li><a href="#peran" onClick={pergiKe("peran")} className="hover:text-[#0d264f] transition-colors">Untuk Siapa</a></li>
                <li><a href="#langkah" onClick={pergiKe("langkah")} className="hover:text-[#0d264f] transition-colors">Cara Mulai</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-[#0d264f] mb-4">Hubungi Kami</h4>
              <p className="text-slate-500 mb-2 break-words">support@eduspace.com</p>
              <p className="text-slate-500">Butuh bantuan? Tim kami siap membantu.</p>
            </div>
          </div>

          <div className="border-t border-slate-200 mt-12 pt-8 text-center">
            <p className="text-slate-400 text-sm">
              &copy; 2026 EduSpace. Seluruh hak cipta dilindungi.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
