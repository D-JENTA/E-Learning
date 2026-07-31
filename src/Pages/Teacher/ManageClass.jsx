import React from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import MainLayoutTeacher from "../../components/Teacher/MainLayout";

export default function ManageClass() {
  const { id } = useParams(); 
  
  const currentClass = {
  };

  const menuItems = [
    { 
      title: 'Kelola Siswa', 
      desc: 'Lihat daftar siswa, tambah atau hapus anggota kelas.', 
      icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      link: `/teacher/manage-students/${id}` 
    },
    { 
      title: 'Tugas & Materi', 
      desc: 'Lihat, edit, atau hapus tugas dan materi pelajaran.', 
      icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
      color: 'text-green-600',
      bg: 'bg-green-50',
      link: `/teacher/assignments/${id}` 
    },
  ];

  return (
    <MainLayoutTeacher>
      <div className="animate-fade-in-up">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-3">
              <button
                onClick={() => window.history.back()}
                className="p-2 rounded-full bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-[#0d264f] hover:border-slate-300 transition-all shadow-sm"
                title="Kembali"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 12H5M12 19l-7-7 7-7"/>
                </svg>
              </button>
              <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Manajemen Kelas</h2>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-slate-500 mb-8 pl-14">
          <Link to="/Teacher/ClassList" className="hover:text-[#0d264f] font-medium">Daftar Kelas</Link>
          <span>/</span>
          <span className="text-slate-800 font-medium">{currentClass.name || "Kelas Aktif"}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {menuItems.map((item, index) => (
            <Link key={index} to={item.link} className="group bg-white rounded-3xl shadow-sm border border-slate-100 p-8 flex flex-col items-center text-center gap-4 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
              <div className={`absolute inset-0 ${item.bg} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
              
              <div className={`w-24 h-24 rounded-2xl flex items-center justify-center text-4xl shadow-sm group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 bg-white border border-slate-100 group-hover:border-transparent z-10 ${item.color}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.icon} />
                  </svg>
              </div>
              <div className="flex-1 z-10">
                <h3 className="text-2xl font-bold text-slate-800 group-hover:text-[#0d264f] transition-colors mb-2">{item.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed group-hover:text-slate-600">{item.desc}</p>
              </div>
              
              <div className={`mt-4 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider border z-10 ${item.bg} ${item.color} group-hover:bg-white group-hover:bg-opacity-10 transition-colors`}>
                Akses Menu
              </div>
            </Link>
          ))}
        </div>
      </div>
    </MainLayoutTeacher>
  );
}