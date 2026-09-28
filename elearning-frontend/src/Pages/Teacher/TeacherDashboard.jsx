import React from "react";
import { Link, useNavigate } from "react-router-dom";
import MainLayoutTeacher from "../../components/Teacher/MainLayout";
import Clock from "../../components/Clock";
import LoadError from "../../components/LoadError";
import { Skeleton, StatGridSkeleton } from "../../components/Skeleton";
import useApiResource from "../../hooks/useApiResource";
import { apiGet, asArray, errorMessage } from "../../services/apiClient";

const IconAcademic = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
  </svg>
);

const IconUsers = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m6-1.13a4 4 0 100-8 4 4 0 000 8z" />
  </svg>
);

const IconClipboard = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
  </svg>
);

const StatCard = ({ data }) => (
  <Link to={data.path} className="block group h-full">
    <div
      className={`relative h-full overflow-hidden rounded-2xl border bg-gradient-to-br from-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${data.tint} ${data.borderSoft} ${data.hoverBorder}`}
    >
      <div
        className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r opacity-80 transition-opacity duration-300 group-hover:opacity-100 ${data.bar}`}
      ></div>

      <div
        className={`absolute -right-6 -top-6 h-24 w-24 rounded-full blur-2xl transition-opacity duration-500 opacity-[0.06] group-hover:opacity-[0.12] ${data.color}`}
      ></div>

      <div className="relative">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
              {data.title}
            </p>
            <h3
              className={`text-4xl font-black text-slate-800 transition-colors duration-300 ${data.hoverText}`}
            >
              {data.value}
            </h3>
          </div>

          <div
            className={`p-3 rounded-xl ${data.bgSoft} ${data.textAccent} group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}
          >
            {data.icon}
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-400 font-medium">Lihat Detail</span>
          <div className={`w-2 h-2 rounded-full ${data.color}`}></div>
        </div>
      </div>
    </div>
  </Link>
);

export default function DashboardTeacher({ user }) {
  const navigate = useNavigate();

  // Sebelumnya kegagalan request hanya `if (!res.ok) return;` — guru melihat
  // "0 kelas / 0 siswa / 0 tugas" tanpa tanda apa pun bahwa datanya gagal
  // dimuat. Sekarang kegagalan jadi state error yang bisa ditampilkan dan
  // dicoba ulang.
  const { data: stats, isLoading, error, reload } = useApiResource(async ({ signal }) => {
    const mapelList = asArray(await apiGet("/api/teachers/me/mapels", { signal }));

    const classIds = [...new Set(mapelList.map((m) => m.id_class).filter(Boolean))];

    const [assignmentLists, studentCounts] = await Promise.all([
      Promise.all(
        mapelList.map((m) =>
          apiGet(`/api/me/mapel/${m.id_mapel}/assignmentsTeacher`, { signal })
            .then(asArray)
            .catch(() => [])
        )
      ),
      Promise.all(
        classIds.map((cid) =>
          apiGet(`/api/auth/users/${cid}/students`, { signal })
            .then((d) => {
              const list = asArray(d);
              return (list[0]?.Students ?? list).length || 0;
            })
            .catch(() => 0)
        )
      ),
    ]);

    return {
      total_classes: classIds.length,
      total_students: studentCounts.reduce((a, b) => a + b, 0),
      total_assignments: assignmentLists.reduce((a, list) => a + list.length, 0),
    };
  }, "teacher-dashboard-stats");

  // cardsData dihitung sebelum render bercabang, jadi harus aman saat data
  // belum ada (null) maupun saat gagal.
  const safeStats = stats ?? { total_classes: 0, total_students: 0, total_assignments: 0 };

  // Buka hub daftar kelas — pusat pengelolaan kelas, siswa, dan tugas.
  const openClasses = () => navigate("/teacher/classes");

  // Warna mengikuti entitas: kelas pakai navy brand (sama dengan daftar kelas),
  // siswa emerald, tugas amber (sama dengan ikon tugas di dashboard siswa).
  const cardsData = [
    {
      title: "Total Kelas",
      value: safeStats.total_classes,
      color: "bg-brand",
      bar: "from-brand via-brand-light to-transparent",
      tint: "to-blue-50/70",
      borderSoft: "border-blue-100",
      hoverBorder: "hover:border-blue-200",
      textAccent: "text-brand",
      hoverText: "group-hover:text-brand",
      bgSoft: "bg-blue-50",
      icon: <IconAcademic />,
      path: "/teacher/classes",
    },
    {
      title: "Total Siswa",
      value: safeStats.total_students,
      color: "bg-emerald-500",
      bar: "from-emerald-500 via-emerald-400 to-transparent",
      tint: "to-emerald-50/70",
      borderSoft: "border-emerald-100",
      hoverBorder: "hover:border-emerald-200",
      textAccent: "text-emerald-600",
      hoverText: "group-hover:text-emerald-600",
      bgSoft: "bg-emerald-50",
      icon: <IconUsers />,
      path: "/teacher/classes",
    },
    {
      title: "Total Tugas",
      value: safeStats.total_assignments,
      color: "bg-amber-500",
      bar: "from-amber-500 via-amber-400 to-transparent",
      tint: "to-amber-50/70",
      borderSoft: "border-amber-100",
      hoverBorder: "hover:border-amber-200",
      textAccent: "text-amber-600",
      hoverText: "group-hover:text-amber-600",
      bgSoft: "bg-amber-50",
      icon: <IconClipboard />,
      path: "/teacher/classes",
    },
  ];

  return (
    <MainLayoutTeacher user={user}>
      <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Dashboard Guru
            </h1>
            <p className="text-slate-500 mt-1 text-lg font-medium">
              Ringkasan aktivitas dan jadwal mengajar Anda.
            </p>
          </div>
          <Clock />
        </header>

        {isLoading ? (
          // Kerangka yang menyerupai isi akhirnya (3 kartu + banner), supaya
          // tata letak tidak melompat saat data tiba.
          <div className="space-y-8">
            <StatGridSkeleton cards={3} />
            <Skeleton className="h-28 w-full rounded-3xl" />
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-slate-100 bg-white shadow-sm">
            <LoadError
              message="Gagal memuat ringkasan kelas Anda."
              hint={errorMessage(error)}
              onRetry={reload}
            />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {cardsData.map((card) => (
                <StatCard key={card.title} data={card} />
              ))}
            </div>

            <div className="cursor-pointer group" onClick={openClasses}>
              <div className="relative overflow-hidden bg-gradient-to-r from-brand to-blue-800 p-6 rounded-3xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 active:scale-[0.98]">
                {/* Semburat biru lembut di sudut kanan */}
                <div className="absolute -right-10 -top-10 w-48 h-48 rounded-full bg-blue-400/20 blur-3xl"></div>

                <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-2xl md:text-3xl font-bold text-white">
                      Lihat Daftar Kelas
                    </h3>
                    <p className="mt-2 text-sm text-blue-100">Kelola Kelas, tugas, dan siswa dengan mudah.</p>
                  </div>
                  <div className="p-3 bg-white/10 rounded-3xl text-white group-hover:bg-white group-hover:text-brand transition-colors duration-300">
                    <IconAcademic />
                  </div>
                </div>
              </div>
            </div>

          </>
        )}
      </div>
    </MainLayoutTeacher>
  );
}
