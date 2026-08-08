import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import MainLayoutTeacher from "../../components/Teacher/MainLayout";

export default function ManageClass() {
  const { id } = useParams(); 
  const navigate = useNavigate();
  const [mapels, setMapels] = useState([]);
  const [classInfo, setClassInfo] = useState(null);
  const [isLoadingMapels, setIsLoadingMapels] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const fetchClassInfo = async () => {
      try {
        const response = await fetch(`/api/classes/${id}`);
        const result = await response.json();
        if (response.ok) {
          setClassInfo(result);
        }
      } catch (error) {
        console.error("Error fetching class info:", error);
      }
    };

    const fetchClassMapels = async () => {
      try {
        setIsLoadingMapels(true);
        const response = await fetch(`/api/classes/${id}/mapels`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });

        const result = await response.json();

        if (response.ok) {
          setMapels(result || []);
        } else {
          if (response.status === 401) {
            navigate("/login");
          } else {
            setErrorMessage(result.message || "Gagal memuat mapel kelas.");
          }
        }
      } catch (error) {
        console.error("Error fetching class mapels:", error);
        setErrorMessage("Terjadi kesalahan saat memuat mapel kelas.");
      } finally {
        setIsLoadingMapels(false);
      }
    };

    if (id) {
      fetchClassInfo();
      fetchClassMapels();
    }
  }, [id, navigate]);

  const currentClass = {
    name: classInfo?.class_name || `Kelas #${id}`,
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
          <Link to="/teacher/classes" className="hover:text-[#0d264f] font-medium">Daftar Kelas</Link>
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

        <div className="mt-10 bg-white rounded-3xl border border-slate-100 shadow-sm p-8">
          <h3 className="text-2xl font-bold text-slate-900 mb-4">Mapel di {currentClass.name || `Kelas #${id}`}</h3>

          {isLoadingMapels ? (
            <div className="text-slate-500">Memuat mapel...</div>
          ) : errorMessage ? (
            <div className="text-red-600">{errorMessage}</div>
          ) : mapels.length === 0 ? (
            <div className="text-slate-500">Belum ada mapel untuk kelas ini.</div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {mapels.map((item) => {
                const mapel = item.Mapel || item;
                const idMapel = mapel.id_mapel || mapel.id;
                return (
                  <Link
                    key={idMapel}
                    to={`/teacher/assignments/${idMapel}`}
                    className="group relative rounded-3xl border-2 border-slate-200 p-6 bg-gradient-to-br from-white to-slate-50 hover:from-blue-50 hover:to-white hover:border-[#0d264f] hover:shadow-xl hover:-translate-y-1 transition-all duration-300 block overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-20 h-20 bg-blue-100 rounded-full -mr-10 -mt-10 opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>

                    <div className="relative flex items-start gap-4">
                      <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 group-hover:bg-[#0d264f] group-hover:text-white flex items-center justify-center transition-all duration-300 shadow-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="text-lg font-bold text-slate-900 group-hover:text-[#0d264f] transition-colors mb-2 truncate">
                          {mapel.mapel_name || "Nama Mapel"}
                        </h4>
                        <p className="text-sm text-slate-500 group-hover:text-slate-700 transition-colors">
                          Klik untuk kelola tugas & materi
                        </p>
                      </div>

                      <div className="flex-shrink-0 text-slate-400 group-hover:text-[#0d264f] group-hover:translate-x-1 transition-all">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </MainLayoutTeacher>
  );
}