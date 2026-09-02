import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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

const StatCard = ({ icon, label, value, color }) => (
  <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4">
    <div className={`p-3 rounded-2xl ${color}`}>{icon}</div>
    <div>
      <p className="text-3xl font-extrabold text-slate-900 leading-none">{value}</p>
      <p className="text-sm text-slate-500 font-medium mt-1">{label}</p>
    </div>
  </div>
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
      const mapels = Array.isArray(json.data) ? json.data : (Array.isArray(json) ? json : []);

      const classIds = [...new Set(mapels.map((m) => m.id_class).filter(Boolean))];

      const [assignmentCounts, studentCounts] = await Promise.all([
        Promise.all(
          mapels.map((m) =>
            fetch(`/api/me/mapel/${m.id_mapel}/assignmentsTeacher`, { credentials: "include" })
              .then((r) => (r.ok ? r.json() : null))
              .then((d) => (Array.isArray(d?.data) ? d.data.length : 0))
              .catch(() => 0)
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
        total_assignments: assignmentCounts.reduce((a, b) => a + b, 0),
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
              <StatCard icon={<IconAcademic />} label="Total Kelas" value={stats.total_classes} color="bg-indigo-50 text-indigo-600" />
              <StatCard icon={<IconUsers />} label="Total Siswa" value={stats.total_students} color="bg-emerald-50 text-emerald-600" />
              <StatCard icon={<IconClipboard />} label="Total Tugas" value={stats.total_assignments} color="bg-amber-50 text-amber-600" />
            </div>

            <div className="cursor-pointer group" onClick={() => navigate("/teacher/classes")}>
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