import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MainLayoutTeacher from "../../components/Teacher/MainLayout";

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
    <div className="fixed top-5 right-5 z-[100] flex items-center w-full max-w-xs p-4 space-x-3 text-gray-500 bg-white rounded-lg shadow-2xl border-l-4 transition-all duration-300 transform animate-slideIn">
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

export default function ClassList({ user }) {
  const [classes, setClasses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [teacherName, setTeacherName] = useState("");
  const [alertInfo, setAlertInfo] = useState({ show: false, message: '', type: 'success' });
  const navigate = useNavigate();

  const ITEMS_PER_PAGE_DESKTOP = 6;
  const ITEMS_PER_PAGE_MOBILE = 3;
  
  const [currentPage, setCurrentPage] = useState(1);

  const fetchMyClasses = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");

      const response = await fetch('/api/teachers/me/mapels', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const result = await response.json();
     
      if (response.ok) {
        const classData = Array.isArray(result.data) ? result.data : (Array.isArray(result) ? result : []);
        setClasses(classData);
      } else {
        if (response.status === 401) navigate('/login');
        console.error("Gagal mengambil data:", result.message);
      }
    } catch (error) {
      console.error("Error fetching classes:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMyClasses();
  }, []);

  useEffect(() => {
    const fetchTeacherName = async () => {
      try {
        const res = await fetch("/api/auth/users/me", {
          headers: {
            "ngrok-skip-browser-warning": "69420",
            "Cache-Control": "no-cache, no-store, must-revalidate",
          },
          credentials: "include",
        });
        const data = await res.json().catch(() => null);
        if (res.ok && data) {
          setTeacherName(data.username || data.data?.username || data.user?.username || "");
        }
      } catch (err) {
        console.error("Gagal ambil nama guru:", err);
      }
    };
    fetchTeacherName();
  }, []);

  const itemsPerPage = window.innerWidth >= 768 ? ITEMS_PER_PAGE_DESKTOP : ITEMS_PER_PAGE_MOBILE;
  const totalPages = Math.ceil(classes.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentClasses = classes.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <MainLayoutTeacher>
      {alertInfo.show && (
        <CustomAlert 
          message={alertInfo.message} 
          type={alertInfo.type} 
          onClose={() => setAlertInfo({ ...alertInfo, show: false })} 
        />
      )}

      <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 animate-fade-in-up">
        
        <div className="flex flex-col gap-4">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Daftar Kelas</h1>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
             <p className="text-slate-500 text-lg font-medium">
               Kelola dan pantau perkembangan kelas Anda.
             </p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-100 border-t-[#0d264f] mb-4"></div>
            <p className="text-slate-400 font-medium">Memuat data kelas...</p>
          </div>
        ) : (
          <>
            {currentClasses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {currentClasses.map((item, index) => {
                  const mapelId = item.id_mapel || item.id_class;

                  return (
                    <TeacherClassCard
                      key={mapelId || index}
                      data={item}
                      teacherName={teacherName || user?.username || "Guru"}
                      onManage={() => {
                        if (mapelId) {
                          navigate(`/teacher/assignments/${mapelId}`, {
                            state: {
                              id_class: item.id_class,
                              class_name: item.class_name,
                              mapel_name: item.mapel_name,
                            },
                          });
                        } else {
                          console.error("ID Mapel tidak ditemukan:", item);
                        }
                      }}
                    />
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-2xl border border-slate-100 shadow-sm">
                <p className="text-slate-500 font-medium text-lg">Belum ada mata pelajaran yang tersedia.</p>
              </div>
            )}

            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-10 pb-4">
                <button 
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-100 hover:text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                {[...Array(totalPages).keys()].map((page) => {
                  const pageNumber = page + 1;
                  const isActive = currentPage === pageNumber;
                  return (
                    <button
                      key={pageNumber}
                      onClick={() => paginate(pageNumber)}
                      className={`w-10 h-10 rounded-xl font-bold text-sm transition-all shadow-sm ${isActive ? 'bg-[#0d264f] text-white' : 'text-slate-500 hover:bg-white hover:text-[#0d264f]'}`}
                    >
                      {pageNumber}
                    </button>
                  );
                })}
              
                <button 
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-100 hover:text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}
          </>
        )}
      </div>
      
      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(100%); }
          to { opacity: 1; transform: translateX(0); }
        }
        .animate-slideIn {
          animation: slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </MainLayoutTeacher>
  );
}

function TeacherClassCard({ data, onManage, teacherName }) {
  const mapelName = data.mapel_name || data.class_name || "Mata Pelajaran";
  const className = data.class_name || "-";

  return (
    <div
      onClick={onManage}
      className="group relative cursor-pointer overflow-hidden rounded-2xl border border-slate-100 bg-white p-5 sm:p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-100 hover:shadow-xl flex flex-col justify-between"
    >
      <div className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-blue-500/10 blur-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"></div>
      <div className="absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-gradient-to-r from-[#0d264f] to-blue-500 transition-transform duration-300 group-hover:scale-x-100"></div>

      <div>
        {/* Header: Ikon Buku + Nama Mapel (Geser kanan dengan ml-2) */}
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#0d264f] shadow-xs transition-all duration-300 group-hover:bg-[#0d264f] group-hover:text-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h3 className="ml-2 text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight line-clamp-2 leading-tight group-hover:text-[#0d264f] transition-colors">
            {mapelName}
          </h3>
        </div>

        {/* Badge Nama Kelas (Diperbesar: text-sm sm:text-base) */}
        <div className="mb-4">
          <span className="inline-block rounded-full border border-blue-100 bg-blue-50/80 px-4 py-1 text-sm sm:text-base font-bold text-blue-700 tracking-wide uppercase">
            {className}
          </span>
        </div>
      </div>

      {/* Footer Card: Nama Pengajar */}
      <div className="flex items-center justify-between border-t border-slate-100 pt-3 mt-2">
        <span className="text-sm sm:text-base font-semibold text-slate-600 truncate mr-2 group-hover:text-[#0d264f] transition-colors">
          {teacherName}
        </span>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-400 transition-all duration-300 group-hover:translate-x-1 group-hover:text-[#0d264f]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </div>
      </div>
    </div>
  );
}