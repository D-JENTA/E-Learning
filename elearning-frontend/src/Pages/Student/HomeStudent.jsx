import React, { useState, useRef, useId } from "react";
import MainLayoutStudent from "../../components/Student/MainLayout";
import Toast from "../../components/Toast";
import Clock from "../../components/Clock";
import { Skeleton } from "../../components/Skeleton";
import useApiResource from "../../hooks/useApiResource";
import useModalA11y from "../../hooks/useModalA11y";
import { apiGet, apiGetFirst, asArray, errorMessage } from "../../services/apiClient";
import { Link, useNavigate } from "react-router-dom";

const IconBook = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
  </svg>
);

const IconArrowRight = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
  </svg>
);

const IconClipboard = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
  </svg>
);

const IconClockSmall = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

// Status deadline untuk chip warna: terlewat (merah), mepet <=3 hari (kuning), lainnya netral.
const getDeadlineInfo = (value) => {
  if (!value) return null;
  const date = new Date(value);
  if (isNaN(date.getTime())) return null;
  const now = new Date();
  const diffDays = Math.ceil((date - now) / (1000 * 60 * 60 * 24));
  return {
    label: date.toLocaleDateString("id-ID", { day: "numeric", month: "short" }),
    passed: date < now,
    near: diffDays >= 0 && diffDays <= 3,
  };
};

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [openJoin, setOpenJoin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [alertInfo, setAlertInfo] = useState({ show: false, message: '', type: 'success' });

  // Sebelumnya seluruh pemuatan di bawah ini berakhir dengan `.catch(() => {})`:
  // kalau gagal, siswa melihat "0 Mata Pelajaran" dan "Belum ada tugas dari
  // guru" — dua hal yang tidak benar. Sekarang ada state memuat dan state
  // error yang bisa ditampilkan serta dicoba ulang.
  const { data: summary, isLoading: isLoadingSummary, error, reload } = useApiResource(async ({ signal }) => {
    const list = asArray(await apiGet('/api/students/me/classes', { signal }));

    // Tugas tiap mapel: backend punya beberapa variasi URL untuk data yang
    // sama, jadi kandidatnya dicoba berurutan (apiGetFirst) sampai ada yang
    // menjawab. Mapel yang gagal cukup dianggap tanpa tugas, tidak menjatuhkan
    // seluruh halaman.
    const mapelsWithId = list.filter((m) => m?.id_mapel);
    const perMapel = await Promise.all(
      mapelsWithId.map((m) =>
        apiGetFirst(
          [
            `/api/students/mapel/${m.id_mapel}/assignments`,
            `/api/me/mapel/${m.id_mapel}/assignmentsTeacher`,
            `/api/students/${m.id_mapel}/assignmentsTeacher`,
            `/api/teachers/mapel/${m.id_mapel}/assignments`,
          ],
          { signal, fallback: [] }
        ).then(asArray)
      )
    );

    // Tugas terbaru: gabungkan tugas semua mapel, urutkan terbaru, ambil 4.
    const recentTasks = mapelsWithId
      .flatMap((m, i) =>
        perMapel[i].map((t) => ({
          id: t.id ?? t.id_assignment,
          title: t.assignment_title ?? t.title ?? "Tugas",
          deadline: t.deadline ?? null,
          mapelName: m.mapel_name ?? "Mapel",
          className: m.class_name ?? null,
          teacherName: m.teacher_name ?? null,
          idMapel: m.id_mapel,
        }))
      )
      .sort((a, b) => (b.id ?? 0) - (a.id ?? 0))
      .slice(0, 4);

    return {
      mapelCount: list.length,
      className: list[0]?.class_name || null,
      recentTasks,
    };
  }, "student-dashboard-summary");

  // Aman sebelum data ada (null) maupun saat gagal.
  const mapelCount = summary?.mapelCount ?? 0;
  const className = summary?.className ?? null;
  const recentTasks = summary?.recentTasks ?? [];

  const handleJoinClass = async (code) => {
    if (!code.trim()) {
      setAlertInfo({ show: true, message: "Silakan masukkan kode kelas yang valid.", type: 'error' });
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch('/api/classes/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ code: code })
      });

      const result = await response.json();

      if (response.ok) {
        setOpenJoin(false);
        setAlertInfo({ show: true, message: "Berhasil bergabung ke kelas.", type: 'success' });
      } else {
        setAlertInfo({ show: true, message: result.message || "Gagal bergabung ke kelas.", type: 'error' });
      }
    } catch (error) {
      console.error("Join error:", error);
      setAlertInfo({ show: true, message: "Terjadi kesalahan pada server.", type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MainLayoutStudent>
      {alertInfo.show && (
        <Toast message={alertInfo.message} type={alertInfo.type} onClose={() => setAlertInfo({ ...alertInfo, show: false })} />
      )}
      <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 animate-fade-in-up">

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
              Dashboard Siswa
            </h1>
            <p className="text-slate-500 text-lg md:text-xl font-medium">
              Selamat datang kembali! Siap untuk belajar hari ini?
            </p>
          </div>
          <Clock />
        </div>

        {/* Ringkasan mapel */}
        <div className="relative overflow-hidden bg-brand text-white rounded-3xl shadow-sm p-8">
          {/* Semburat biru lembut di sudut kanan — sama seperti banner "Lihat
              Daftar Kelas" di dashboard guru, supaya navy-nya tidak terasa datar.
              Sengaja sangat pudar (20% + blur tebal), bukan bentuk yang tegas. */}
          <div className="absolute -right-10 -top-10 w-48 h-48 rounded-full bg-blue-400/20 blur-3xl"></div>

          <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              {isLoadingSummary ? (
                <Skeleton className="h-8 w-64 max-w-full bg-white/20" />
              ) : error ? (
                <div>
                  <p className="text-base md:text-lg font-semibold text-blue-100">
                    Data kelas belum bisa dimuat.
                  </p>
                  <button
                    type="button"
                    onClick={reload}
                    className="mt-2 text-xs font-bold uppercase tracking-wider text-white/80 hover:text-white underline underline-offset-2 transition-colors"
                  >
                    Coba lagi
                  </button>
                </div>
              ) : (
                /* Teks utama dibesarkan, teks "1 Mata Pelajaran" di bawahnya dihilangkan */
                <h2 className="text-1xl md:text-3xl font-extrabold tracking-tight">
                  {className || "Mata Pelajaran Yang Diikuti :"}
                </h2>
              )}
            </div>

            {/* Badge jumlah di ujung kanan tetap ada */}
            <div className="flex items-center gap-3 bg-white/10 rounded-2xl px-5 py-3 self-start sm:self-auto">
              {isLoadingSummary ? (
                <Skeleton className="h-9 w-10 bg-white/20" />
              ) : (
                // Saat gagal, angka 0 akan terbaca sebagai "tidak ikut mapel apa
                // pun" — jadi ditampilkan sebagai tanda hubung.
                <span className="text-3xl font-extrabold">{error ? "—" : mapelCount}</span>
              )}
              <span className="text-blue-100 text-xs font-semibold leading-tight">
                Mata<br />Pelajaran
              </span>
            </div>
          </div>
        </div>

        <Link
          to="/student/class"
          className="group relative block overflow-hidden rounded-3xl border border-blue-100 bg-gradient-to-br from-white to-blue-50/70 p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl"
        >
          {/* Resep yang sama dengan kartu statistik di dashboard guru dan admin:
              garis aksen tipis di atas, tint gradien pudar, semburat warna 6%
              di sudut yang menguat saat hover.

              Overlay lama (`absolute inset-0 -z-10`) dibuang: induknya bukan
              stacking context, jadi elemen ber-z-index negatif tergambar di
              BELAKANG latar putih kartu — efek hover biru itu selama ini tidak
              pernah terlihat. */}
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brand via-brand-light to-transparent opacity-80 transition-opacity duration-300 group-hover:opacity-100"></div>
          <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-brand blur-2xl opacity-[0.06] transition-opacity duration-500 group-hover:opacity-[0.12]"></div>

          <div className="relative flex justify-between items-start">
            <div>
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-4 group-hover:bg-brand group-hover:text-white transition-colors duration-300">
                <IconBook />
              </div>
              <h3 className="text-2xl font-bold text-slate-800 group-hover:text-brand transition-colors">
                Mata Pelajaran Saya
              </h3>
              <p className="text-slate-500 mt-2 font-medium leading-relaxed">
                Lihat materi, tugas, dan jadwal pelajaranmu.
              </p>
            </div>
            <div className="p-3 rounded-full bg-slate-50 text-slate-400 group-hover:bg-brand group-hover:text-white transition-all duration-300">
              <IconArrowRight />
            </div>
          </div>
        </Link>

        {/* Tugas terbaru dari guru — maksimal 4, lintas mapel */}
        <div className="relative overflow-hidden rounded-3xl border border-amber-100 bg-gradient-to-br from-white to-amber-50/50 p-6 md:p-8 shadow-sm">
          {/* Tugas = amber, senada dengan kartu "Total Tugas" di dashboard guru.
              Tint-nya sengaja paling pudar di halaman ini supaya chip tenggat
              (merah/kuning) di dalam tiap tugas tetap jadi penanda yang menonjol
              — kalau kartunya ikut menguning, sinyal "mepet" itu jadi kabur. */}
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-amber-500 via-amber-400 to-transparent opacity-80"></div>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600">
                <IconClipboard />
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-900">Tugas Terbaru</h3>
                <p className="text-xs text-slate-400 font-medium">4 tugas terakhir yang diberikan gurumu</p>
              </div>
            </div>
            <Link
              to="/student/class"
              className="text-xs font-bold text-slate-400 hover:text-brand uppercase tracking-wider transition-colors"
            >
              Lihat Semua →
            </Link>
          </div>

          {isLoadingSummary ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Skeleton className="h-24 rounded-2xl" />
              <Skeleton className="h-24 rounded-2xl" />
            </div>
          ) : error ? (
            // Sengaja tidak memakai empty state "Belum ada tugas dari guru":
            // itu akan jadi pernyataan yang salah saat request-nya gagal.
            <div className="py-8 text-center">
              <p className="text-sm text-slate-500 font-medium">
                Gagal memuat daftar tugas. {errorMessage(error)}
              </p>
              <button
                type="button"
                onClick={reload}
                className="mt-3 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-brand hover:bg-brand-dark transition-colors"
              >
                Coba lagi
              </button>
            </div>
          ) : recentTasks.length === 0 ? (
            <div className="py-10 text-center">
              <div className="mx-auto w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-300 mb-3">
                <IconClipboard />
              </div>
              <p className="text-sm text-slate-400 font-medium">
                Belum ada tugas dari guru. Nikmati waktumu! 
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {recentTasks.map((task) => {
                const deadline = getDeadlineInfo(task.deadline);
                return (
                  <button
                    key={`${task.idMapel}-${task.id ?? task.title}`}
                    onClick={() => navigate(`/student/task/${task.idMapel}`)}
                    className="group w-full text-left p-5 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-amber-200 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
                  >
                    <p className="text-sm font-bold text-slate-900 leading-snug line-clamp-2 group-hover:text-brand transition-colors">
                      {task.title}
                    </p>
                    <div className="mt-3 flex items-center justify-between gap-2">
                      <p className="text-xs text-slate-500 font-medium truncate">
                        {task.mapelName}{task.className ? ` • ${task.className}` : ""}
                      </p>
                      {deadline && (
                        <span
                          className={`shrink-0 inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-md border ${
                            deadline.passed
                              ? "text-rose-600 bg-rose-50 border-rose-200"
                              : deadline.near
                                ? "text-amber-600 bg-amber-50 border-amber-200"
                                : "text-slate-500 bg-slate-100 border-slate-200"
                          }`}
                        >
                          <IconClockSmall />
                          {deadline.passed ? `Lewat • ${deadline.label}` : deadline.label}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {openJoin && (
        <JoinClassModal
          onClose={() => setOpenJoin(false)}
          onJoin={handleJoinClass}
          isSubmitting={isLoading}
        />
      )}
    </MainLayoutStudent>
  );
}

function JoinClassModal({ onClose, onJoin, isSubmitting }) {
  const [code, setCode] = useState("");
  const codeInputRef = useRef(null);
  const titleId = useId();
  // Fokus awal ke kolom kode: modal ini memang ada untuk mengisinya.
  const containerRef = useModalA11y({ onClose, initialFocusRef: codeInputRef });

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300 animate-fade-in"
        onClick={handleBackdropClick}
      ></div>

      <div
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-md relative z-10 p-8 animate-scale-up focus:outline-none"
      >
        <h3 id={titleId} className="text-2xl font-extrabold text-slate-900 mb-2">Gabung Kelas</h3>
        <p className="text-slate-500 mb-8 text-sm">Masukkan kode kelas yang kamu miliki di sini.</p>

        <div className="space-y-6">
          <div>
            <label
              htmlFor={`${titleId}-code`}
              className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1"
            >
              Kode Kelas
            </label>
            <input
              id={`${titleId}-code`}
              ref={codeInputRef}
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="CONTOH: KLS-XYZ123"
              maxLength={20}
              disabled={isSubmitting}
              className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-2 border-slate-100 outline-none focus:border-brand focus:ring-4 focus:ring-brand/10 transition-all font-mono font-bold text-center text-lg tracking-widest placeholder:text-slate-400 disabled:bg-slate-100 disabled:opacity-60"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 py-3.5 rounded-2xl text-slate-600 font-bold hover:bg-slate-100 transition-colors disabled:opacity-50"
            >
              Batal
            </button>
            <button
              onClick={() => onJoin(code)}
              disabled={isSubmitting}
              className="flex-1 py-3.5 rounded-2xl bg-brand text-white font-bold hover:bg-brand-dark shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Memproses...
                </>
              ) : "Gabung Sekarang"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}