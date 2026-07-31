import React from "react";
import { Link, useNavigate } from "react-router-dom";
import MainLayout from "../../components/Admin/MainLayout";

export default function HomeAdmin() {
  const navigate = useNavigate();

  const stats = [
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
  ];

  const colorMap = {
    blue: {
      bg: "bg-blue-50",
      icon: "text-blue-500",
      border: "border-blue-100",
      hover: "group-hover:bg-blue-500",
      pill: "bg-blue-100 text-blue-700",
      accent: "bg-blue-500",
    },
    green: {
      bg: "bg-green-50",
      icon: "text-green-500",
      border: "border-green-100",
      hover: "group-hover:bg-green-500",
      pill: "bg-green-100 text-green-700",
      accent: "bg-green-500",
    },
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 lg:px-10">

        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 mb-6 text-sm font-semibold text-gray-500 hover:text-[#0d264f] transition-colors group"
        >
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-gray-200 bg-white shadow-sm group-hover:border-[#0d264f] group-hover:shadow transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </span>
          Back
        </button>

        <div className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-1.5 h-8 rounded-full bg-[#0d264f]" />
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 tracking-tight">
            Dashboard Admin 
            </h2>
          </div>
          <p className="text-gray-400 text-sm ml-5 pl-0.5">
            System overview and quick access.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-2xl">
          {stats.map((stat, idx) => {
            const c = colorMap[stat.color];
            return (
              <Link to={stat.path} key={idx} className="block group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0d264f] rounded-2xl">
                <div className={`relative bg-white rounded-2xl border ${c.border} overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1`}>

                  <div className={`h-1 w-full ${c.accent} opacity-80`} />

                  <div className="p-5 sm:p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className={`flex-shrink-0 p-3 rounded-xl ${c.bg} transition-colors duration-300`}>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className={`h-6 w-6 sm:h-7 sm:w-7 ${c.icon}`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
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
                      <p className="text-base sm:text-lg font-bold text-gray-800 group-hover:text-[#0d264f] transition-colors">
                        {stat.label}
                      </p>
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