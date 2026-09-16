import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import MainLayoutStudent from "../../components/Student/MainLayout";

// Urutan hari sekolah untuk tab filter jadwal mapel (Senin sampai Jumat).
const DAYS = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat"];
// Tab tambahan (muncul hanya kalau ada mapel yang belum punya jadwal).
const NO_SCHEDULE = "Tanpa Jadwal";

// Warna aksen bergilir untuk kartu mapel, supaya tiap mapel kelihatan
// beda dan daftarnya tidak monoton. Class Tailwind ditulis lengkap di sini
// (bukan dirakit dari template string) supaya tetap terdeteksi saat build.
const MAPEL_ACCENTS = [
  {
    bg: "from-blue-50 to-white",
    border: "border-blue-100",
    wash: "bg-blue-100/40",
    tile: "bg-blue-100 text-blue-700 group-hover:bg-blue-600 group-hover:text-white",
    title: "group-hover:text-blue-900",
    accent: "text-blue-600",
    bar: "from-blue-500 to-blue-400",
  },
  {
    bg: "from-emerald-50 to-white",
    border: "border-emerald-100",
    wash: "bg-emerald-100/40",
    tile: "bg-emerald-100 text-emerald-700 group-hover:bg-emerald-600 group-hover:text-white",
    title: "group-hover:text-emerald-900",
    accent: "text-emerald-600",
    bar: "from-emerald-500 to-emerald-400",
  },
  {
    bg: "from-amber-50 to-white",
    border: "border-amber-100",
    wash: "bg-amber-100/40",
    tile: "bg-amber-100 text-amber-700 group-hover:bg-amber-500 group-hover:text-white",
    title: "group-hover:text-amber-900",
    accent: "text-amber-600",
    bar: "from-amber-500 to-amber-400",
  },
  {
    bg: "from-violet-50 to-white",
    border: "border-violet-100",
    wash: "bg-violet-100/40",
    tile: "bg-violet-100 text-violet-700 group-hover:bg-violet-600 group-hover:text-white",
    title: "group-hover:text-violet-900",
    accent: "text-violet-600",
    bar: "from-violet-500 to-violet-400",
  },
  {
    bg: "from-rose-50 to-white",
    border: "border-rose-100",
    wash: "bg-rose-100/40",
    tile: "bg-rose-100 text-rose-700 group-hover:bg-rose-600 group-hover:text-white",
    title: "group-hover:text-rose-900",
    accent: "text-rose-600",
    bar: "from-rose-500 to-rose-400",
  },
  {
    bg: "from-cyan-50 to-white",
    border: "border-cyan-100",
    wash: "bg-cyan-100/40",
    tile: "bg-cyan-100 text-cyan-700 group-hover:bg-cyan-600 group-hover:text-white",
    title: "group-hover:text-cyan-900",
    accent: "text-cyan-600",
    bar: "from-cyan-500 to-cyan-400",
  },
];
const accentFor = (index) => MAPEL_ACCENTS[index % MAPEL_ACCENTS.length];

// Default tab = Senin.
function getTodayDay() {
  return "Senin";
}

// Normalisasi teks hari: rapikan spasi & kapitalisasi supaya
// "selasa" / "SELASA" / " Selasa " semua tetap cocok jadi "Selasa".
function normalizeDay(raw) {
  if (!raw) return null;
  const trimmed = String(raw).trim();
  const lower = trimmed.toLowerCase();
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}

const IconBook = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
  </svg>
);

const CustomAlert = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  if (!message) return null;

  const iconBg = type === 'error' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600';

  const Icon = type === 'error'
    ? <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
    : <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>;

  return (
    <div className="fixed top-5 right-5 z-50 flex items-center w-full max-w-xs p-4 space-x-3 text-gray-500 bg-white rounded-lg shadow-2xl border-l-4 transition-all duration-300 transform animate-slideIn">
      <div className={`inline-flex items-center justify-center flex-shrink-0 w-8 h-8 rounded-lg ${iconBg}`}>
        {Icon}
      </div>
      <div className="flex-1 text-sm font-medium text-gray-800">
        {message}
      </div>
      <button
        type="button"
        onClick={onClose}
        className="ml-auto -mx-1.5 -my-1.5 bg-white text-gray-400 hover:text-gray-900 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 hover:bg-gray-100 inline-flex h-8 w-8 items-center justify-center transition-colors"
        aria-label="Close"
      >
        <span className="sr-only">Tutup</span>
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
      </button>
    </div>
  );
};

// Ambil teacher_name & class_name dari endpoint /classes/:id_class/mapels (sudah include
// Teacher & Class), dengan mencocokkan id_mapel. Dipakai karena getMapelByStudent belum
// include Teacher/Class.
const enrichMapelData = async (mapelList) => {
  try {
    const classesRes = await fetch('/api/classes', { credentials: 'include' });
    console.log("[enrich] /api/classes status:", classesRes.status);
    if (!classesRes.ok) return mapelList;

    const classesData = await classesRes.json();
    const allClasses = classesData.data || classesData || [];
    console.log("[enrich] allClasses:", allClasses);

    // Fetch mapel (dengan teacher & class) untuk tiap kelas secara paralel.
    const mapelPerClass = await Promise.all(
      allClasses.map((c) => {
        const cid = c.id_class ?? c.id;
        return fetch(`/api/classes/${cid}/mapels`, { credentials: 'include' })
          .then((res) => {
            console.log(`[enrich] /api/classes/${cid}/mapels status:`, res.status);
            return res.ok ? res.json() : [];
          })
          .then((json) => {
            console.log(`[enrich] RAW json kelas ${cid}:`, json);
            let list;
            if (Array.isArray(json)) {
              list = json;
            } else if (Array.isArray(json?.data)) {
              list = json.data;
            } else if (json && typeof json === 'object') {
              list = Object.values(json).flat();
            } else {
              list = [];
            }
            console.log(`[enrich] mapel kelas ${cid}:`, list);
            return list;
          })
          .catch((err) => {
            console.error(`[enrich] gagal fetch mapel kelas ${cid}:`, err);
            return [];
          });
      })
    );
    console.log("[enrich] mapelPerClass:", mapelPerClass);

    // Bangun peta id_mapel -> { teacher_name, class_name, id_class } dari semua kelas.
    const extraInfoMap = {};
    mapelPerClass.flat().forEach((m) => {
      if (m?.id_mapel != null) {
        extraInfoMap[m.id_mapel] = {
          teacher_name: m.teacher_name || null,
          class_name: m.class_name || null,
          id_class: m.id_class ?? null,
        };
      }
    });
    console.log("[enrich] extraInfoMap:", extraInfoMap);
    console.log("[enrich] mapelList (dari student):", mapelList);

    const result = mapelList.map((item) => {
      const extra = extraInfoMap[item.id_mapel] || {};
      return {
        ...item,
        teacher_name: extra.teacher_name || null,
        class_name: extra.class_name || null,
        id_class: extra.id_class ?? null,
      };
    });
    console.log("[enrich] hasil akhir:", result);
    return result;
  } catch (error) {
    console.error("[enrich] Gagal ambil data tambahan mapel:", error);
    return mapelList;
  }
};

export default function ClassStudent() {
  const [classes, setClasses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [alertInfo, setAlertInfo] = useState({ show: false, message: '', type: 'success' });
  const [openJoin, setOpenJoin] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);
  const navigate = useNavigate();

  const ITEMS_PER_PAGE_DESKTOP = 6;
  const ITEMS_PER_PAGE_MOBILE = 3;

  const [currentPage, setCurrentPage] = useState(1);

  const fetchMyClasses = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/students/me/classes', {
        method: 'GET',
        credentials: 'include',
      });
      const result = await response.json();

      if (response.ok) {
        const rawList = result.data || [];
        const enriched = await enrichMapelData(rawList);
        setClasses(enriched);
      } else if (response.status === 404) {
        setClasses([]);
      } else {
        setClasses([]);
        setAlertInfo({ show: true, message: result.message || 'Gagal memuat daftar mapel.', type: 'error' });
      }
    } catch (error) {
      console.error("Fetch error:", error);
      setAlertInfo({ show: true, message: 'Kesalahan koneksi ke server.', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMyClasses();
  }, []);

  const handleOpenClass = (id_mapel) => {
    if (!id_mapel) {
      setAlertInfo({ show: true, message: "Error: ID Mapel tidak ditemukan.", type: 'error' });
      return;
    }
    navigate(`/student/task/${id_mapel}`);
  };

  const studentClassName = useMemo(() => {
    const found = classes.find(item => item.class_name);
    return found ? found.class_name : null;
  }, [classes]);

  const getDaysOf = (item) => {
    const rawList = item.Schedules && item.Schedules.length
      ? item.Schedules.map(s => normalizeDay(s.day)).filter(Boolean)
      : [];
    return rawList.length ? rawList : [NO_SCHEDULE];
  };

  const dayCounts = useMemo(() => {
    const counts = {};
    DAYS.forEach(d => { counts[d] = 0; });
    counts[NO_SCHEDULE] = 0;
    classes.forEach(item => {
      getDaysOf(item).forEach(day => {
        if (counts[day] === undefined) counts[day] = 0;
        counts[day] += 1;
      });
    });
    return counts;
  }, [classes]);

  const tabs = useMemo(() => {
    const list = [...DAYS];
    if (dayCounts[NO_SCHEDULE] > 0) list.push(NO_SCHEDULE);
    return list;
  }, [dayCounts]);

  const activeDay = useMemo(() => {
    if (selectedDay) return selectedDay;
    return "Senin";
  }, [selectedDay]);

  const mapelForDay = useMemo(() => {
    return classes
      .filter(item => getDaysOf(item).includes(activeDay))
      .map(m => ({
        id_mapel: m.id_mapel,
        mapel_name: m.mapel_name,
        teacher_name: m.teacher_name || null,
        class_name: m.class_name || null,
      }))
      .sort((a, b) => a.mapel_name.localeCompare(b.mapel_name));
  }, [classes, activeDay]);

  const handleSelectDay = (day) => {
    setSelectedDay(day);
    setCurrentPage(1);
  };

  const itemsPerPage = window.innerWidth >= 768 ? ITEMS_PER_PAGE_DESKTOP : ITEMS_PER_PAGE_MOBILE;
  const totalPages = Math.max(1, Math.ceil(mapelForDay.length / itemsPerPage));
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentClasses = mapelForDay.slice(indexOfFirstItem, indexOfLastItem);
  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <MainLayoutStudent>
      {alertInfo.show && (
        <CustomAlert
          message={alertInfo.message}
          type={alertInfo.type}
          onClose={() => setAlertInfo({ ...alertInfo, show: false })}
        />
      )}

      {openJoin && (
        <JoinModal
          onClose={() => setOpenJoin(false)}
          onJoinSuccess={fetchMyClasses}
          setParentAlert={setAlertInfo}
        />
      )}

      <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 animate-fade-in-up">

        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Mapel Saya</h1>
            {studentClassName && (
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100 shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                </svg>
                <span className="text-[10px] font-bold uppercase tracking-widest text-blue-400">Kelas</span>
                <span className="text-base font-extrabold text-[#0d264f]">{studentClassName}</span>
              </span>
            )}
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
             <p className="text-slate-500 text-lg font-medium">
               Kelola dan akses tugas harianmu.
             </p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-100 border-t-[#0d264f] mb-4"></div>
            <p className="text-slate-400 font-medium">Memuat daftar mapel...</p>
          </div>
        ) : classes.length === 0 ? (
          <div className="col-span-full text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-100">
            <div className="mx-auto w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 text-slate-300">
              <IconBook />
            </div>
            <p className="text-slate-400 font-medium">Belum ada mata pelajaran yang diikuti.</p>
            <button onClick={() => setOpenJoin(true)} className="text-[#0d264f] font-bold text-sm mt-2 hover:underline">Gabung sekarang</button>
          </div>
        ) : (
          <>
            {/* Tab filter hari */}
            <div className="flex flex-wrap gap-2">
              {tabs.map((day) => {
                const isActive = activeDay === day;
                return (
                  <button
                    key={day}
                    onClick={() => handleSelectDay(day)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 shadow-sm ${
                      isActive
                        ? 'bg-[#0d264f] text-white shadow-lg'
                        : 'bg-white text-slate-500 hover:bg-slate-50 hover:text-[#0d264f] border border-slate-200'
                    }`}
                  >
                    {day}
                    <span
                      className={`text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center ${
                        isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {dayCounts[day] || 0}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mapelForDay.length === 0 ? (
                <div className="col-span-full text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-100">
                  <div className="mx-auto w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 text-slate-300">
                    <IconBook />
                  </div>
                  <p className="text-slate-400 font-medium">
                    {activeDay === NO_SCHEDULE
                      ? 'Semua mapel sudah punya jadwal.'
                      : `Tidak ada mapel pada hari ${activeDay}.`}
                  </p>
                </div>
              ) : (
                currentClasses.map((item, i) => (
                  <StudentClassCard
                    key={item.id_mapel}
                    data={item}
                    /* index di daftar penuh, bukan di halaman ini, supaya
                       warna kartu tidak berpindah saat pindah halaman */
                    colorIndex={indexOfFirstItem + i}
                    onOpen={() => handleOpenClass(item.id_mapel)}
                  />
                ))
              )}
            </div>

            {totalPages > 1 && (
              <div className="px-4 sm:px-6 py-4 mt-10 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 font-medium">
                <div>
                  Halaman <span className="font-bold text-slate-800">{currentPage}</span> dari <span className="font-bold text-slate-800">{totalPages}</span>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                  <button
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed font-bold transition-all inline-flex items-center gap-1 shadow-sm"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Kembali
                  </button>
                  <button
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed font-bold transition-all inline-flex items-center gap-1 shadow-sm"
                  >
                    Lanjut
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </MainLayoutStudent>
  );
}

function StudentClassCard({ data, colorIndex = 0, onOpen }) {
  const accent = accentFor(colorIndex);

  return (
    <div
      onClick={onOpen}
      className={`group relative rounded-3xl shadow-sm border p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col justify-between bg-gradient-to-br ${accent.bg} ${accent.border}`}
    >
      <div className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r z-20 ${accent.bar}`} />
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0 ${accent.wash}`}></div>

      <div className="relative z-10 space-y-4">
        {/* Header Kartu: Hanya Ikon */}
        <div className="flex justify-between items-start">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-sm ${accent.tile}`}>
            <IconBook />
          </div>
        </div>

        {/* Informasi Mapel & Guru */}
        <div>
          <h3 className={`text-xl font-black text-slate-900 transition-colors line-clamp-2 leading-snug ${accent.title}`}>
            {data.mapel_name}
          </h3>
          {data.teacher_name && (
            <p className="text-sm text-slate-700 font-bold mt-1.5 flex items-center gap-1.5 truncate">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>{data.teacher_name}</span>
            </p>
          )}
        </div>
      </div>

      {/* Footer Aksi */}
      <div className="relative z-10 pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
        <span className="text-xs text-slate-400 font-semibold">Klik untuk lihat tugas</span>
        <div className={`font-extrabold text-sm opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0 flex items-center gap-1 ${accent.accent}`}>
          Buka
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function JoinModal({ onClose, onJoinSuccess, setParentAlert }) {
  const [code, setCode] = useState("");
  const [isJoining, setIsJoining] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!code) return;

    try {
      setIsJoining(true);
      const response = await fetch('/api/classes/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ code: code.trim() }),
      });

      const res = await response.json();

      if (response.ok) {
        onJoinSuccess();
        onClose();
        setCode("");
        setParentAlert({ show: true, message: "Berhasil bergabung ke mapel!", type: 'success' });
      } else {
        setParentAlert({ show: true, message: res.message || "Gagal bergabung ke mapel.", type: 'error' });
      }
    } catch (error) {
      setParentAlert({ show: true, message: "Kesalahan koneksi ke server.", type: 'error' });
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      ></div>

      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md relative z-10 p-8 animate-scale-up">
        <h3 className="text-2xl font-bold text-slate-900 mb-2">Gabung Mapel</h3>
        <p className="text-slate-500 text-sm mb-6">Masukkan kode mapel dari gurumu untuk mengakses materi.</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">
              Kode Mapel
            </label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toLowerCase())}
              placeholder="contoh: kls-xyz123"
              maxLength={20}
              disabled={isJoining}
              autoFocus
              className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-2 border-slate-100 outline-none focus:border-[#0d264f] focus:ring-4 focus:ring-[#0d264f]/10 transition-all font-mono font-bold text-center tracking-widest text-sm placeholder:text-slate-400 disabled:bg-slate-100 disabled:opacity-60"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isJoining}
              className="flex-1 py-3.5 rounded-2xl text-slate-600 font-bold hover:bg-slate-100 transition-colors disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isJoining}
              className="flex-1 py-3.5 rounded-2xl bg-[#0f172a] text-[#ffffff] font-bold hover:bg-slate-800 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isJoining ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Memproses...
                </>
              ) : "Gabung Sekarang"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}