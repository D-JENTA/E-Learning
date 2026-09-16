import React, { useState, useEffect, useMemo } from "react";
import MainLayoutStudent from "../../components/Student/MainLayout";
import Toast from "../../components/Toast";
import { Link, useNavigate } from "react-router-dom";
import { useAuthUser } from "../../context/AuthContext";

// Kontrak API (BE):
// GET /api/students/progress/:id_student  (verifyToken + isStudent)
// -> { student, summary: { total, sudah, belum, persentase }, mapels: [{ id_mapel, mapel_name, summary, assignments }] }
// Error: 404 siswa tidak ditemukan, 400 belum terdaftar di kelas.

const IconCheck = () => (
  <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
);

const IconClock = () => (
  <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
);

const IconAward = () => (
  <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>
);

const IconChevronDown = ({ isOpen }) => (
  <svg
    className={`w-4 h-4 flex-shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
    viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
  >
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);

const IconPaperclip = () => (
  <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
);

const IconSearch = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
);

const IconX = () => (
  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
);

const formatDateTime = (value) => {
  if (!value) return null;
  const date = new Date(value);
  if (isNaN(date.getTime())) return null;
  return date.toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};

// Warna progress bar per mapel (dirotasi biar tidak monoton)
const MAPEL_COLORS = [
  { bar: "bg-[#0d264f]", soft: "bg-blue-100 text-blue-700" },
  { bar: "bg-emerald-500", soft: "bg-emerald-100 text-emerald-700" },
  { bar: "bg-amber-500", soft: "bg-amber-100 text-amber-700" },
  { bar: "bg-violet-500", soft: "bg-violet-100 text-violet-700" },
  { bar: "bg-rose-500", soft: "bg-rose-100 text-rose-700" },
  { bar: "bg-cyan-500", soft: "bg-cyan-100 text-cyan-700" },
];

// Status mapel untuk filter cepat di daftar
const isMapelSelesai = (m) => (m.summary?.persentase ?? 0) >= 100;

const FILTERS = [
  { key: "semua", label: "Semua" },
  { key: "belum", label: "Belum Selesai" },
  { key: "selesai", label: "Selesai" },
];

// Deadline sudah lewat? Dipakai untuk membedakan tugas yang benar-benar
// belum dikerjakan dengan tugas yang sudah kelewat tenggat.
const isDeadlinePassed = (deadline) => {
  if (!deadline) return false;
  const d = new Date(deadline);
  if (isNaN(d.getTime())) return false;
  return Date.now() > d.getTime();
};

const StatusBadge = ({ status, deadlinePassed = false }) => {
  if (status === "sudah") {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[11px] sm:text-xs font-bold border border-emerald-200 whitespace-nowrap">
        <IconCheck /> Selesai
      </span>
    );
  }
  if (status === "terlambat") {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-50 text-red-600 text-[11px] sm:text-xs font-bold border border-red-200 whitespace-nowrap">
        <IconClock /> Terlambat
      </span>
    );
  }
  // Belum dikumpulkan tapi tenggatnya sudah lewat
  if (deadlinePassed) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-50 text-red-600 text-[11px] sm:text-xs font-bold border border-red-200 whitespace-nowrap">
        <IconClock /> Lewat Deadline
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-[11px] sm:text-xs font-bold border border-slate-200 whitespace-nowrap">
      Belum Selesai
    </span>
  );
};

const ProgressBar = ({ persentase, barClass = "bg-[#0d264f]" }) => (
  <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
    <div
      className={`h-full rounded-full transition-all duration-700 ${barClass}`}
      style={{ width: `${Math.min(100, Math.max(0, persentase || 0))}%` }}
    />
  </div>
);

const MapelCard = ({ mapel, colorIndex }) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const color = MAPEL_COLORS[colorIndex % MAPEL_COLORS.length];
  const { summary, assignments } = mapel;

  // Batasi tugas yang tampil sekaligus, supaya kartu tidak memanjang jauh
  // ke bawah waktu mapelnya punya banyak tugas.
  const PREVIEW_COUNT = 5;
  const [showAll, setShowAll] = useState(false);
  const allAssignments = assignments ?? [];
  const visibleAssignments = showAll ? allAssignments : allAssignments.slice(0, PREVIEW_COUNT);
  const hasMoreAssignments = allAssignments.length > PREVIEW_COUNT;

  // Bawa siswa ke halaman tugas mapel ini, langsung ke tugas yang diklik.
  // Route /student/task/:id_class sebenarnya memakai id_mapel.
  const openTask = (idAssignment) =>
    navigate(`/student/task/${mapel.id_mapel}`, {
      state: { openAssignmentId: idAssignment },
    });

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-left p-4 sm:p-5 flex items-center gap-4 hover:bg-slate-50 transition-colors"
        aria-expanded={isOpen}
      >
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-extrabold text-sm flex-shrink-0 ${color.soft}`}>
          {Math.round(summary?.persentase || 0)}%
        </div>

        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-center justify-between gap-2 min-w-0">
            <h3 className="font-extrabold text-slate-900 text-sm sm:text-base truncate">
              {mapel.mapel_name}
            </h3>
            <span className="text-[11px] sm:text-xs font-bold text-slate-400 whitespace-nowrap flex-shrink-0">
              {summary?.selesai ?? summary?.sudah ?? 0}/{summary?.total ?? 0} tugas
            </span>
          </div>
          <ProgressBar persentase={summary?.persentase} barClass={color.bar} />
        </div>

        <div className="text-slate-400 flex-shrink-0">
          <IconChevronDown isOpen={isOpen} />
        </div>
      </button>

      {isOpen && (
        <div className="border-t border-slate-100 bg-slate-50/50">
          {allAssignments.length === 0 ? (
            <p className="px-5 py-6 text-center text-slate-400 text-xs sm:text-sm font-medium">
              Belum ada tugas di mapel ini.
            </p>
          ) : (
            <ul
              className={`divide-y divide-slate-100 ${
                showAll && hasMoreAssignments ? "max-h-96 overflow-y-auto" : ""
              }`}
            >
              {visibleAssignments.map((a) => {
                const deadline = formatDateTime(a.deadline);
                const submittedAt = formatDateTime(a.submitted_at);
                const hasScore = a.score !== null && a.score !== undefined && a.score !== "";

                return (
                  <li
                    key={a.id_assignment}
                    role="button"
                    tabIndex={0}
                    title="Buka tugas ini"
                    onClick={() => openTask(a.id_assignment)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        openTask(a.id_assignment);
                      }
                    }}
                    className="px-4 sm:px-5 py-3.5 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 cursor-pointer hover:bg-slate-50 focus:outline-none focus-visible:bg-slate-50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-bold text-slate-800 leading-snug break-words line-clamp-2">
                        {a.assignment_title || "Tugas tanpa judul"}
                      </p>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-[11px] text-slate-400 font-medium">
                        {deadline && <span>Deadline: {deadline}</span>}
                        {submittedAt && <span>Dikumpulkan: {submittedAt}</span>}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                      {hasScore && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 text-[11px] sm:text-xs font-extrabold border border-indigo-100 whitespace-nowrap">
                          <IconAward /> {a.score}
                        </span>
                      )}
                      <StatusBadge status={a.status} deadlinePassed={isDeadlinePassed(a.deadline)} />
                      {a.file_url && (
                        <a
                          href={a.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Buka file jawaban yang dikumpulkan"
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center justify-center p-1.5 rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-[#0d264f] hover:border-[#0d264f] transition-colors"
                        >
                          <IconPaperclip />
                        </a>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          {hasMoreAssignments && (
            <button
              type="button"
              onClick={() => setShowAll((v) => !v)}
              className="w-full py-3 text-xs font-bold text-[#0d264f] hover:bg-slate-100 border-t border-slate-100 transition-colors"
            >
              {showAll
                ? "Tampilkan lebih sedikit"
                : `Tampilkan semua ${allAssignments.length} tugas`}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default function ProgressStudent() {
  const user = useAuthUser();
  // Konvensi aplikasi ini: id_student === id user yang login
  // (dipakai juga di halaman admin: id_student dicocokkan dengan id_user).
  const idStudent = user?.id ?? user?.id_user ?? null;

  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null); // pesan error dari backend
  const [notEnrolled, setNotEnrolled] = useState(false);
  const [alertInfo, setAlertInfo] = useState({ show: false, message: '', type: 'success' });
  // Pencarian & filter dipakai supaya daftar mapel yang panjang tidak perlu di-scroll jauh
  const [searchTerm, setSearchTerm] = useState("");
  const [filterMode, setFilterMode] = useState("semua");

  useEffect(() => {
    if (!idStudent) {
      setError("Data siswa tidak ditemukan. Coba muat ulang halaman.");
      setIsLoading(false);
      return;
    }

    const fetchProgress = async () => {
      try {
        setIsLoading(true);
        setError(null);
        setNotEnrolled(false);

        const token = localStorage.getItem("token");
        const res = await fetch(`/api/students/progress/${idStudent}`, {
          method: "GET",
          headers: {
            "ngrok-skip-browser-warning": "69420",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          credentials: "include",
        });

        const json = await res.json().catch(() => ({}));

        if (res.ok) {
          setData(json);
        } else if (res.status === 400) {
          // "Siswa belum terdaftar di kelas manapun" -> bukan error, tampilkan empty state
          setNotEnrolled(true);
        } else {
          setError(json.message || "Gagal memuat progres tugas.");
        }
      } catch {
        setError("Kesalahan koneksi ke server.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProgress();
  }, [idStudent]);

  const summary = data?.summary;
  const mapels = useMemo(() => data?.mapels ?? [], [data]);

  const mapelCounts = useMemo(
    () => ({
      semua: mapels.length,
      belum: mapels.filter((m) => !isMapelSelesai(m)).length,
      selesai: mapels.filter(isMapelSelesai).length,
    }),
    [mapels]
  );

  // index asli tetap dibawa supaya warna kartu tidak berubah saat difilter
  const filteredMapels = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();

    return mapels
      .map((mapel, index) => ({ mapel, index }))
      .filter(({ mapel }) => {
        if (filterMode === "belum" && isMapelSelesai(mapel)) return false;
        if (filterMode === "selesai" && !isMapelSelesai(mapel)) return false;
        if (q && !(mapel.mapel_name || "").toLowerCase().includes(q)) return false;
        return true;
      });
  }, [mapels, searchTerm, filterMode]);

  const isFiltering = searchTerm.trim() !== "" || filterMode !== "semua";

  const resetFilters = () => {
    setSearchTerm("");
    setFilterMode("semua");
  };

  return (
    <MainLayoutStudent>
      {alertInfo.show && (
        <Toast
          message={alertInfo.message}
          type={alertInfo.type}
          onClose={() => setAlertInfo({ ...alertInfo, show: false })}
        />
      )}

      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-fade-in-up">

        {/* Header */}
        <div className="min-w-0">
          {/* Tanpa `truncate`: overflow-hiddennya memotong ekor huruf g/y
              karena line-height text-3xl lebih pendek dari ruang baris font. */}
          <h1 className="text-lg sm:text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">
            Progres Tugas Saya
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Pantau tugas yang sudah dan belum kamu kerjakan di setiap mata pelajaran.
          </p>
        </div>

        {isLoading ? (
          <div className="py-24 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-4 border-slate-200 border-t-[#0d264f] rounded-full animate-spin"></div>
              <span className="text-xs font-semibold">Memuat progres tugas...</span>
            </div>
          </div>
        ) : notEnrolled ? (
          <div className="py-16 text-center bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-300">
              <IconClock />
            </div>
            <div className="space-y-1">
              <p className="text-slate-600 text-sm font-bold">Kamu belum terdaftar di kelas manapun.</p>
              <p className="text-slate-400 text-xs font-medium">Gabung kelas dulu untuk mulai mengerjakan tugas.</p>
            </div>
            <Link
              to="/student/join-class"
              className="inline-block px-6 py-2.5 bg-[#0d264f] hover:bg-blue-900 text-white font-bold text-xs rounded-xl transition-all shadow-sm"
            >
              Gabung Kelas
            </Link>
          </div>
        ) : error ? (
          <div className="py-16 text-center bg-white rounded-2xl border border-slate-200 p-6 space-y-3">
            <p className="text-slate-600 text-sm font-bold">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors"
            >
              Coba Lagi
            </button>
          </div>
        ) : (
          <>
            {/* Ringkasan Keseluruhan */}
            <div className="bg-[#0d264f] text-white rounded-2xl sm:rounded-3xl shadow-sm p-5 sm:p-8 space-y-5">
              <div className="flex items-end justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-blue-200 text-[11px] sm:text-xs font-bold uppercase tracking-widest">
                    Progres Keseluruhan
                  </p>
                  <p className="text-3xl sm:text-4xl font-extrabold tracking-tight mt-1">
                    {summary?.persentase ?? 0}%
                  </p>
                  <p className="text-blue-100/80 text-xs sm:text-sm font-medium mt-0.5">
                    {summary?.selesai ?? summary?.sudah ?? 0} dari {summary?.total ?? 0} tugas selesai
                  </p>
                </div>
              </div>

              <div className="w-full h-3 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-blue-400 to-emerald-400 transition-all duration-700"
                  style={{ width: `${Math.min(100, Math.max(0, summary?.persentase || 0))}%` }}
                />
              </div>

              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                <div className="bg-white/10 rounded-xl px-3 py-2.5 sm:px-4 sm:py-3 text-center">
                  <p className="text-lg sm:text-2xl font-extrabold leading-none">{summary?.total ?? 0}</p>
                  <p className="text-blue-200 text-[10px] sm:text-xs font-semibold mt-1">Total Tugas</p>
                </div>
                <div className="bg-emerald-400/15 rounded-xl px-3 py-2.5 sm:px-4 sm:py-3 text-center">
                  <p className="text-lg sm:text-2xl font-extrabold text-emerald-300 leading-none">{summary?.selesai ?? summary?.sudah ?? 0}</p>
                  <p className="text-emerald-200/80 text-[10px] sm:text-xs font-semibold mt-1">Selesai</p>
                </div>
                <div className="bg-amber-400/15 rounded-xl px-3 py-2.5 sm:px-4 sm:py-3 text-center">
                  <p className="text-lg sm:text-2xl font-extrabold text-amber-300 leading-none">{summary?.belum ?? 0}</p>
                  <p className="text-amber-200/80 text-[10px] sm:text-xs font-semibold mt-1">Belum Selesai</p>
                </div>
              </div>
            </div>

            {/* Progres Per Mapel */}
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center justify-between gap-3 px-1">
                <h2 className="text-sm sm:text-base font-extrabold text-slate-800">
                  Mata Pelajaran
                </h2>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] sm:text-xs font-bold text-slate-400 whitespace-nowrap">
                    {filteredMapels.length} dari {mapels.length} mapel
                  </span>
                  {isFiltering && (
                    <button
                      type="button"
                      onClick={resetFilters}
                      className="text-[11px] sm:text-xs font-bold text-[#0d264f] hover:underline whitespace-nowrap"
                    >
                      Reset
                    </button>
                  )}
                </div>
              </div>

              {mapels.length === 0 ? (
                <div className="py-14 text-center bg-white rounded-2xl border border-slate-200 p-6">
                  <p className="text-slate-500 text-sm font-medium">
                    Belum ada mata pelajaran yang menghasilkan tugas.
                  </p>
                </div>
              ) : (
                <>
                  {/* Toolbar pencarian & filter (ikut halaman, tidak sticky) */}
                  <div className="space-y-3">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <IconSearch />
                      </div>
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Cari mata pelajaran..."
                        aria-label="Cari mata pelajaran"
                        className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-white border border-slate-200 focus:border-[#0d264f] focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm font-medium text-slate-700 placeholder:text-slate-400"
                      />
                      {searchTerm && (
                        <button
                          type="button"
                          onClick={() => setSearchTerm("")}
                          aria-label="Hapus pencarian"
                          className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                        >
                          <IconX />
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-2 overflow-x-auto pb-0.5">
                      {FILTERS.map((f) => {
                        const active = filterMode === f.key;
                        return (
                          <button
                            key={f.key}
                            type="button"
                            onClick={() => setFilterMode(f.key)}
                            aria-pressed={active}
                            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap border transition-colors ${
                              active
                                ? "bg-[#0d264f] text-white border-[#0d264f]"
                                : "bg-white text-slate-600 border-slate-200 hover:border-[#0d264f] hover:text-[#0d264f]"
                            }`}
                          >
                            {f.label}
                            <span className={active ? "text-blue-200" : "text-slate-400"}>
                              {" "}({mapelCounts[f.key]})
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {filteredMapels.length === 0 ? (
                    <div className="py-14 text-center bg-white rounded-2xl border border-slate-200 p-6 space-y-3">
                      <p className="text-slate-500 text-sm font-medium">
                        {searchTerm.trim()
                          ? `Tidak ada mata pelajaran yang cocok dengan "${searchTerm.trim()}".`
                          : "Tidak ada mata pelajaran pada filter ini."}
                      </p>
                      <button
                        type="button"
                        onClick={resetFilters}
                        className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors"
                      >
                        Reset Filter
                      </button>
                    </div>
                  ) : (
                    filteredMapels.map(({ mapel, index }) => (
                      <MapelCard key={mapel.id_mapel ?? index} mapel={mapel} colorIndex={index} />
                    ))
                  )}
                </>
              )}
            </div>
          </>
        )}
      </div>
    </MainLayoutStudent>
  );
}
