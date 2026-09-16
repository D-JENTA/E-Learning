import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import MainLayout from "../../components/Admin/MainLayout";

export default function SuperAdminDashboard() {
  const [stats, setStats] = useState({ totalUsers: 0, totalTeachers: 0, totalStudents: 0 });
  const [totalClasses, setTotalClasses] = useState(null);

  useEffect(() => {
    fetch("/api/auth/users")
      .then(res => res.json())
      .then(data => {
        setStats({
          totalUsers: data.length,
          totalTeachers: data.filter(u => u.role === 'teacher').length,
          totalStudents: data.filter(u => u.role === 'student').length,
        });
      })
      .catch(() => {});
  }, []);

  // Total kelas untuk stat card "Kelas".
  useEffect(() => {
    fetch("/api/classes", { credentials: "include" })
      .then(res => res.json())
      .then(result => {
        const raw = result.data ?? result;
        setTotalClasses(Array.isArray(raw) ? raw.length : 0);
      })
      .catch(() => {});
  }, []);

  const cardsData = [
    {
      title: "Total Users",
      value: stats.totalUsers,
      color: "bg-slate-800",
      textAccent: "text-slate-800",
      bgSoft: "bg-slate-100",
    },
    {
      title: "Teachers",
      value: stats.totalTeachers,
      color: "bg-emerald-500",
      textAccent: "text-emerald-600",
      bgSoft: "bg-emerald-50",
      path: "/admin/teachers"
    },
    {
      title: "Students",
      value: stats.totalStudents,
      color: "bg-blue-500",
      textAccent: "text-blue-600",
      bgSoft: "bg-blue-50",
      path: "/admin/students"
    },
    {
      title: "Kelas",
      value: totalClasses ?? "...",
      color: "bg-violet-500",
      textAccent: "text-violet-600",
      bgSoft: "bg-violet-50",
      path: "/admin/classes"
    },
  ];

  // Data distribusi role — persentase dihitung dari totalUsers.
  // Warna mengikuti entitas di stat card (Teachers=emerald, Students=blue);
  // "Lainnya" sengaja netral karena adalah kategori "Other" (de-emphasis).
  // Nilai hex dipakai langsung oleh SVG donut.
  const roleBreakdown = [
    { label: "Teachers", count: stats.totalTeachers, color: "#10b981" },
    { label: "Students", count: stats.totalStudents, color: "#3b82f6" },
    { label: "Lainnya", count: Math.max(0, stats.totalUsers - stats.totalTeachers - stats.totalStudents), color: "#64748b" },
  ];

  return (
    <MainLayout>
      <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">

        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800 tracking-tight">
            Admin Console
          </h1>
          <p className="text-slate-500 text-lg">
            Monitoring seluruh user dan sistem e-learning.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {cardsData.map((card, index) => (
            <StatCard key={index} data={card} />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* Distribusi role — donut (part-to-whole) + legend berisi nilai */}
          <div className="lg:col-span-3 bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <div className="flex items-baseline justify-between mb-5">
              <h3 className="font-bold text-lg text-slate-800">Distribusi Role</h3>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Komposisi user
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-8">
              <RoleDonut breakdown={roleBreakdown} total={stats.totalUsers} />

              {/* Legend rows — sekalian jadi table view nilainya */}
              <div className="flex-1 w-full space-y-3">
                {roleBreakdown.map((role) => {
                  const percent = stats.totalUsers > 0
                    ? Math.round((role.count / stats.totalUsers) * 100)
                    : 0;
                  return (
                    <div
                      key={role.label}
                      className="flex items-center gap-3 rounded-xl bg-slate-50 border border-slate-100 px-4 py-3"
                    >
                      <span
                        className="shrink-0 w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: role.color }}
                      />
                      <span className="flex-1 text-sm font-semibold text-slate-600">
                        {role.label}
                      </span>
                      <span className="text-lg font-black text-slate-800">{role.count}</span>
                      <span className="text-xs font-bold text-slate-400 w-10 text-right">
                        {percent}%
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Sistem status */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h3 className="font-bold text-lg text-slate-800 mb-4">Sistem Status</h3>
            <div className="flex flex-col gap-4">
              <div className="bg-slate-50 p-4 rounded-xl">
                <p className="text-xs text-slate-500 font-bold uppercase">Database Connection</p>
                <p className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500"></span>
                  Stable
                </p>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl">
                <p className="text-xs text-slate-500 font-bold uppercase">Last Update</p>
                <p className="text-sm font-semibold text-slate-700">Real-time</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </MainLayout>
  );
}

// Donut chart distribusi role: satu lingkaran SVG, tiap role jadi segmen
// stroke dengan gap tipis antar segmen, total user di tengah.
function RoleDonut({ breakdown, total }) {
  const radius = 56;
  const stroke = 14;
  const circumference = 2 * Math.PI * radius;
  const gap = 4; // gap tipis antar segmen (warna permukaan card)

  // Panjang tiap segmen proporsional jumlahnya; titik awal segmen adalah
  // akhir segmen sebelumnya. Role dengan count 0 dilewati.
  const segments = breakdown
    .filter((role) => role.count > 0)
    .reduce((segs, role) => {
      const prev = segs[segs.length - 1];
      const dashOffset = prev ? prev.dashOffset + prev.len : 0;
      const len = (role.count / total) * circumference;
      segs.push({ ...role, len, dashOffset });
      return segs;
    }, []);

  // Role dengan jumlah terbesar, untuk ditampilkan di tengah donut.
  const topRole = segments.length > 0
    ? segments.reduce((top, seg) => (seg.count > top.count ? seg : top))
    : null;

  return (
    <div className="relative shrink-0">
      <svg viewBox="0 0 160 160" className="w-40 h-40 -rotate-90">
        {/* Track: latar donut saat ada bagian kosong / data belum termuat */}
        <circle cx="80" cy="80" r={radius} fill="none" stroke="#f1f5f9" strokeWidth={stroke} />
        {segments.map((seg) => {
          const visibleLen = Math.max(0, seg.len - gap);
          const percent = Math.round((seg.count / total) * 100);
          return (
            <circle
              key={seg.label}
              cx="80"
              cy="80"
              r={radius}
              fill="none"
              stroke={seg.color}
              strokeWidth={stroke}
              strokeDasharray={`${visibleLen} ${circumference - visibleLen}`}
              strokeDashoffset={-seg.dashOffset}
              strokeLinecap="butt"
              className="transition-all duration-700"
            >
              <title>{`${seg.label}: ${seg.count} (${percent}%)`}</title>
            </circle>
          );
        })}
      </svg>
      {/* Tengah donut: persentase role terbesar — angka total user
          sengaja tidak ditampilkan lagi karena sudah ada di stat card. */}
      {segments.length > 0 ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-2xl font-black text-slate-800 leading-none">
            {Math.round((topRole.count / total) * 100)}%
          </p>
          <p className="mt-1.5 flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider">
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: topRole.color }}
            />
            {topRole.label}
          </p>
        </div>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-slate-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
      )}
    </div>
  );
}

function StatCard({ data }) {
  return (
    <Link to={data.path} className="block group">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 h-full hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group-hover:border-slate-200">

        <div className={`absolute -right-4 -top-4 w-24 h-24 ${data.color} rounded-full opacity-0 group-hover:opacity-5 transition-opacity duration-500 blur-2xl`}></div>

        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
              {data.title}
            </p>
            <h3 className={`text-4xl font-black text-slate-800 group-hover:${data.textAccent} transition-colors duration-300`}>
              {data.value}
            </h3>
          </div>

          <div className={`p-3 rounded-xl ${data.bgSoft} ${data.textAccent} group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
             </svg>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between">
           <span className="text-xs text-slate-400 font-medium">Lihat Detail</span>
           <div className={`w-2 h-2 rounded-full ${data.color}`}></div>
        </div>
      </div>
    </Link>
  );
}
