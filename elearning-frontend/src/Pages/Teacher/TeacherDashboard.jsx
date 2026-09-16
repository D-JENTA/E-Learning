import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import MainLayoutTeacher from "../../components/Teacher/MainLayout";
import Clock from "../../components/Clock";

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

// Stat card bergaya sama dengan dashboard admin: label kecil uppercase,
// angka besar, ikon di kanan atas dengan latar lembut, dan footer garis
// tipis "Lihat Detail" dengan titik warna. Semua card mengarah ke daftar
// kelas — hub untuk mengelola kelas, siswa, dan tugas.
const StatCard = ({ data }) => (
  <Link to={data.path} className="block group">
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 h-full relative overflow-hidden group-hover:border-slate-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
      <div className={`absolute -right-4 -top-4 w-24 h-24 ${data.color} rounded-full opacity-0 group-hover:opacity-5 transition-opacity duration-500 blur-2xl`}></div>

      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
            {data.title}
          </p>
          <h3 className="text-4xl font-black text-slate-800">{data.value}</h3>
        </div>

        <div className={`p-3 rounded-xl ${data.bgSoft} ${data.textAccent} group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
          {data.icon}
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between">
        <span className="text-xs text-slate-400 font-medium">Lihat Detail</span>
        <div className={`w-2 h-2 rounded-full ${data.color}`}></div>
      </div>
    </div>
  </Link>
);

export default function DashboardTeacher({ user }) {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ total_classes: 0, total_students: 0, total_assignments: 0 });
  const [isLoading, setIsLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/teachers/me/mapels", { credentials: "include" });
      if (!res.ok) return;
      const json = await res.json();
      const mapelList = Array.isArray(json.data) ? json.data : (Array.isArray(json) ? json : []);

      const classIds = [...new Set(mapelList.map((m) => m.id_class).filter(Boolean))];

      const [assignmentLists, studentCounts] = await Promise.all([
        Promise.all(
          mapelList.map((m) =>
            fetch(`/api/me/mapel/${m.id_mapel}/assignmentsTeacher`, { credentials: "include" })
              .then((r) => (r.ok ? r.json() : null))
              .then((d) => (Array.isArray(d?.data) ? d.data : []))
              .catch(() => [])
          )
        ),
        Promise.all(
          classIds.map((cid) =>
            fetch(`/api/auth/users/${cid}/students`, { credentials: "include" })
              .then((r) => (r.ok ? r.json() : null))
              .then((d) => {
                if (!d) return 0;
                const list = Array.isArray(d) ? d : (d.data ?? []);
                return (list[0]?.Students ?? list).length || 0;
              })
              .catch(() => 0)
          )
        ),
      ]);

      setStats({
        total_classes: classIds.length,
        total_students: studentCounts.reduce((a, b) => a + b, 0),
        total_assignments: assignmentLists.reduce((a, list) => a + list.length, 0),
      });
    } catch (error) {
      console.error("Gagal mengambil statistik:", error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await fetchStats();
      setIsLoading(false);
    };
    loadData();
  }, []);

  // Buka hub daftar kelas — pusat pengelolaan kelas, siswa, dan tugas.
  const openClasses = () => navigate("/teacher/classes");

  const cardsData = [
    {
      title: "Total Kelas",
      value: stats.total_classes,
      color: "bg-indigo-500",
      textAccent: "text-indigo-600",
      bgSoft: "bg-indigo-50",
      icon: <IconAcademic />,
      path: "/teacher/classes",
    },
    {
      title: "Total Siswa",
      value: stats.total_students,
      color: "bg-emerald-500",
      textAccent: "text-emerald-600",
      bgSoft: "bg-emerald-50",
      icon: <IconUsers />,
      path: "/teacher/classes",
    },
    {
      title: "Total Tugas",
      value: stats.total_assignments,
      color: "bg-amber-500",
      textAccent: "text-amber-600",
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
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {cardsData.map((card) => (
                <StatCard key={card.title} data={card} />
              ))}
            </div>

            <div className="cursor-pointer group" onClick={openClasses}>
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl hover:border-indigo-300 hover:-translate-y-1 transition-all duration-300 active:scale-[0.98]">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-2xl md:text-3xl font-bold text-slate-900 group-hover:text-indigo-700 transition-colors">
                      Lihat Daftar Kelas
                    </h3>
                    <p className="mt-2 text-sm text-slate-500">Kelola Kelas, tugas, dan siswa dengan mudah.</p>
                  </div>
                  <div className="p-3 bg-indigo-50 group-hover:bg-indigo-600 rounded-3xl text-indigo-600 group-hover:text-white transition-colors duration-300">
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
