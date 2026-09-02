import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import MainLayout from "../../components/Admin/MainLayout";

export default function SuperAdminDashboard() {
  const [stats, setStats] = useState({ totalUsers: 0, totalAdmins: 0, totalTeachers: 0, totalStudents: 0 });

  useEffect(() => {
    fetch("/api/auth/users")
      .then(res => res.json())
      .then(data => {
        setStats({
          totalUsers: data.length,
          totalAdmins: data.filter(u => u.role === 'admin').length,
          totalTeachers: data.filter(u => u.role === 'teacher').length,
          totalStudents: data.filter(u => u.role === 'student').length,
        });
      });
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
      title: "Admin", 
      value: stats.totalAdmins, 
      color: "bg-orange-500", 
      textAccent: "text-orange-600",
      bgSoft: "bg-orange-50", 
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

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
           <h3 className="font-bold text-lg text-slate-800 mb-4">Sistem Status</h3>
           <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 bg-slate-50 p-4 rounded-xl">
                 <p className="text-xs text-slate-500 font-bold uppercase">Database Connection</p>
                 <p className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    Stable
                 </p>
              </div>
              <div className="flex-1 bg-slate-50 p-4 rounded-xl">
                 <p className="text-xs text-slate-500 font-bold uppercase">Last Update</p>
                 <p className="text-sm font-semibold text-slate-700">Real-time</p>
              </div>
           </div>
        </div>

      </div>
    </MainLayout>
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