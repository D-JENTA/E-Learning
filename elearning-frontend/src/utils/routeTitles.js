/**
 * Peta judul tab per-route.
 *
 * Sebelumnya hanya SidebarTeacher yang mengubah document.title, sehingga tab
 * tetap tertulis "EduSpace Student" (lihat index.html) walau yang membuka
 * adalah guru atau admin. Peta ini dipakai sekali secara global oleh
 * RouteEffects, jadi semua role dapat judul yang benar.
 *
 * Pola memakai bentuk ":nama" untuk segmen dinamis, mis. "/student/task/:id".
 */

const ROUTES = [
  // Halaman publik
  ["/", "Belajar Jadi Lebih Rapi"],
  ["/create", "Daftar Akun"],
  ["/login", "Masuk"],
  ["/forgot", "Lupa Kata Sandi"],
  ["/verify", "Verifikasi OTP"],
  ["/reset-password", "Atur Ulang Kata Sandi"],

  // Siswa
  ["/student/home", "Dashboard Siswa"],
  ["/student/class", "Kelas Saya"],
  ["/student/task/:id_class", "Tugas"],
  ["/student/courses", "Mata Pelajaran"],
  ["/student/lesson", "Materi"],
  ["/student/materi", "Materi"],
  ["/student/plus-task", "Tugas Tambahan"],
  ["/student/calendar", "Kalender"],
  ["/student/settings", "Pengaturan"],
  ["/student/join-class", "Gabung Kelas"],
  ["/student/progress", "Progres Belajar"],

  // Guru
  ["/teacher/dashboard", "Dashboard Guru"],
  ["/teacher/classes", "Daftar Kelas"],
  ["/teacher/manage-class/:id", "Kelola Kelas"],
  ["/teacher/manage-students/:id_class", "Kelola Siswa"],
  ["/teacher/upload-lessons", "Unggah Materi"],
  ["/teacher/calendar", "Kalender"],
  ["/teacher/settings", "Pengaturan"],
  ["/teacher/upload-task/:id_class", "Unggah Tugas"],
  ["/teacher/assignments/:id", "Daftar Tugas"],
  ["/teacher/submissions/:id/:id_assignment", "Pengumpulan Tugas"],
  ["/teacher/grade/:id_submission", "Penilaian"],

  // Admin
  ["/admin/super-dashboard", "Admin Console"],
  ["/admin/students", "Data Siswa"],
  ["/admin/teachers", "Data Guru"],
  ["/admin/classes", "Data Kelas"],
  ["/admin/create-mapel", "Buat Mata Pelajaran"],
  ["/admin/mapels", "Mata Pelajaran"],
  ["/admin/calendar", "Kalender"],
  ["/admin/settings", "Pengaturan"],
  ["/admin/super-control", "Kelola Pengguna"],
  ["/admin/admin-classes/:id_user", "Kelas Siswa"],
  ["/admin/admin-classes/:id_user/:id_class/tasks", "Tugas Siswa"],
];

const DEFAULT_TITLE = "EduSpace";

// Pola diubah jadi regex sekali saja, bukan tiap kali route berubah.
// "/student/task/:id_class" -> /^\/student\/task\/[^/]+\/?$/
const MATCHERS = ROUTES.map(([pattern, title]) => {
  const source = pattern
    .split("/")
    .map((segment) => (segment.startsWith(":") ? "[^/]+" : segment.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")))
    .join("/");

  return { regex: new RegExp(`^${source}/?$`), title };
});

/**
 * Judul tab untuk sebuah pathname.
 * @param {string} pathname
 * @returns {string}
 */
export const titleForPath = (pathname) => {
  const path = (pathname || "/").toLowerCase();
  const match = MATCHERS.find(({ regex }) => regex.test(path));
  return match ? `${DEFAULT_TITLE} | ${match.title}` : DEFAULT_TITLE;
};

export default titleForPath;
