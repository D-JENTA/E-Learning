import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MainLayoutTeacher from "../../components/Teacher/MainLayout";

// --- KOMPONEN NOTIFIKASI TOAST (Universal & Bisa di-close) ---
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
// -----------------------------------------------------------

export default function ClassList() {
  const [classes, setClasses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [alertInfo, setAlertInfo] = useState({ show: false, message: '', type: 'success' });
  const navigate = useNavigate();

  const ITEMS_PER_PAGE_DESKTOP = 6;
  const ITEMS_PER_PAGE_MOBILE = 3;
  
  const [currentPage, setCurrentPage] = useState(1);

  const fetchMyClasses = async () => {
    try {
      setIsLoading(true);
      
      const response = await fetch('/api/teachers/me/classes', {
        method: 'GET',
        credentials: 'include', 
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const result = await response.json();

      if (response.ok) {
        setClasses(result.data || []);
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

  const handleDeleteClass = async (id_class) => {
    // DIHAPUS: window.confirm("Apakah Anda yakin ingin menghapus kelas ini? Semua data materi dan tugas di dalamnya akan ikut terhapus.");
    // Langsung hapus tanpa konfirmasi bawaan chrome

    try {
      const response = await fetch(`/api/classes/${id_class}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        setClasses((prev) => {
            const newClasses = prev.filter((item) => item.id_class !== id_class);
            const itemsPerPage = window.innerWidth >= 768 ? ITEMS_PER_PAGE_DESKTOP : ITEMS_PER_PAGE_MOBILE;
            const totalPages = Math.ceil(newClasses.length / itemsPerPage);
            if (currentPage > totalPages && totalPages > 0) {
                setCurrentPage(totalPages);
            }
            return newClasses;
        });
        setAlertInfo({ show: true, message: "Kelas berhasil dihapus.", type: 'success' });
      } else {
        const err = await response.json();
        setAlertInfo({ show: true, message: err.message || "Gagal menghapus kelas.", type: 'error' });
      }
    } catch (error) {
      console.error("Delete error:", error);
      setAlertInfo({ show: true, message: "Terjadi kesalahan koneksi saat menghapus.", type: 'error' });
    }
  };

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
      {/* Custom Alert */}
      {alertInfo.show && (
        <CustomAlert 
          message={alertInfo.message} 
          type={alertInfo.type} 
          onClose={() => setAlertInfo({ ...alertInfo, show: false })} 
        />
      )}

      <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 animate-fade-in-up">
        
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
             <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-full bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-[#0d264f] hover:border-slate-300 transition-all shadow-sm"
              title="Kembali ke halaman sebelumnya"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
            </button>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Daftar Kelas</h1>
          </div>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pl-11">
             <p className="text-slate-500 text-lg font-medium">
                Kelola dan pantau perkembangan kelas Anda.
              </p>
              <button
                onClick={() => navigate("/Teacher/create-class")}
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-white bg-[#0d264f] hover:bg-[#1a3a75] shadow-md hover:shadow-xl transition-all font-bold active:scale-95 w-full md:w-auto"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Buat Kelas Baru
              </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-100 border-t-[#0d264f] mb-4"></div>
            <p className="text-slate-400 font-medium">Memuat data kelas...</p>
          </div>
        ) : (
          <>
            <div className={`grid gap-6 transition-all duration-500 
              ${window.innerWidth >= 768 ? 'grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'} 
              ${window.innerWidth >= 768 && itemsPerPage === 6 ? 'grid-rows-2' : 'grid-rows-1'}
            `}>
              {currentClasses.length === 0 ? (
                <div className="col-span-full text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-100">
                  <div className="mx-auto w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 text-slate-300">
                       <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                  </div>
                  <p className="text-slate-400 font-medium">Belum ada kelas yang dibuat.</p>
                  <button onClick={() => navigate("/Teacher/create-class")} className="text-[#0d264f] font-bold text-sm mt-2 hover:underline">Mulai buat kelas pertama</button>
                </div>
              ) : (
                currentClasses.map((item) => (
                  <TeacherClassCard 
                    key={item.id_class} 
                    data={item} 
                    onDelete={handleDeleteClass}
                    onManage={() => navigate(`/teacher/manage-class/${item.id_class}`)}
                  />
                ))
              )}
            </div>

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

function TeacherClassCard({ data, onDelete, onManage }) {
  const classCode = data.classCode || "N/A";

  return (
    <div 
      onClick={onManage}
      className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group cursor-pointer relative overflow-hidden"
    >
      <div className="absolute top-0 left-0 w-full h-1.5 bg-[#0d264f] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 rounded-xl bg-blue-50 text-[#0d264f] group-hover:bg-[#0d264f] group-hover:text-white transition-all shadow-sm">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <rect x="6" y="6" width="12" height="14" rx="2" ry="2" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10h2M13 10h2M9 14h2M13 14h2" />
          </svg>
        </div>
        
        <button 
          onClick={(e) => { 
            e.stopPropagation(); 
            onDelete(data.id_class); 
          }} 
          className="p-2 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-full transition-all hover:shadow-md"
          title="Hapus Kelas"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      <div className="mb-2">
        <h3 className="text-xl font-bold text-slate-800 group-hover:text-[#0d264f] transition-colors truncate">
          {data.class_name}
        </h3>
        <div className="flex items-center gap-2 mt-2">
           <span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">Kode Join:</span>
           <span className="text-xs font-mono font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-100">
             {classCode}
           </span>
        </div>
      </div>
      <div className="mt-6 pt-4 border-t border-slate-50 flex items-center justify-between">
        <span className="text-xs text-slate-400 font-medium">Klik untuk kelola materi & siswa</span>
        <div className="text-[#0d264f] font-bold text-sm opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0 flex items-center gap-1">
          Buka
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </div>
      </div>
    </div>
  );
}