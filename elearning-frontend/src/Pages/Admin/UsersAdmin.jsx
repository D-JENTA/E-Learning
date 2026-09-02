import React from "react";
import { Link } from "react-router-dom";
import MainLayout from "../../components/Admin/MainLayout";

const management = [
  {
    label: "Students",
    color: "blue",
    icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z",
    path: "/admin/students",
    description: "Manage student data & records",
  },
  {
    label: "Teachers",
    color: "green",
    icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
    path: "/admin/teachers",
    description: "Manage teacher data & records",
  },
 // {
    //label: "Manage User",
    //color: "indigo",
    //icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
    //path: "/admin/super-control",
    //description: "Roles & account protection",
  //},
];

const colorMap = {
  blue: { bg: "bg-blue-50", icon: "text-blue-500", border: "border-blue-100", accent: "bg-blue-500" },
  green: { bg: "bg-green-50", icon: "text-green-500", border: "border-green-100", accent: "bg-green-500" },
  indigo: { bg: "bg-indigo-50", icon: "text-indigo-500", border: "border-indigo-100", accent: "bg-indigo-500" },
};

export default function HomeAdmin() {
  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 lg:px-10">

        {/* Hero */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0d264f] to-[#1a3a75] p-8 sm:p-10 text-white shadow-lg mb-10">
          <div className="absolute -top-12 -right-8 h-44 w-44 rounded-full bg-white/5" />
          <div className="absolute -bottom-16 right-24 h-56 w-56 rounded-full bg-white/5" />
          <div className="relative max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-blue-200 backdrop-blur-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
              Admin Panel
            </span>
            <h1 className="mt-4 text-3xl sm:text-4xl font-bold tracking-tight">Dashboard Admin</h1>
            <p className="mt-2 text-sm sm:text-base text-blue-100/90">
              System overview and quick access to manage students, teachers, classes, and subjects.
            </p>
          </div>
        </div>

        {/* User Management */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-1.5 h-6 rounded-full bg-[#0d264f]" />
          <h2 className="text-lg font-bold text-gray-800 tracking-tight">User Management</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {management.map((stat, idx) => {
            const c = colorMap[stat.color];
            return (
              <Link to={stat.path} key={idx} className="block group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0d264f] rounded-2xl">
                <div className={`relative bg-white rounded-2xl border ${c.border} overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1`}>
                  <div className={`h-1 w-full ${c.accent} opacity-80`} />
                  <div className="p-5 sm:p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className={`flex-shrink-0 p-3 rounded-xl ${c.bg}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 sm:h-7 sm:w-7 ${c.icon}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={stat.icon} />
                        </svg>
                      </div>
                      <span className="mt-1 text-gray-300 group-hover:text-[#0d264f] group-hover:translate-x-1 transition-all duration-200">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </span>
                    </div>
                    <div className="mt-4">
                      <p className="text-base sm:text-lg font-bold text-gray-800 group-hover:text-[#0d264f] transition-colors">{stat.label}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{stat.description}</p>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

      </div>
    </MainLayout>
  );
}
