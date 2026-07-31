import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MainLayoutStudent from "../../components/Student/MainLayout";

const IconArrowLeft = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
);

const IconBook = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
  </svg>
);

const IconTrash = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
  </svg>
);

const IconPlus = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
  </svg>
);

// --- KOMPONEN NOTIFIKASI TOAST (Universal & Bisa di-close) ---
const CustomAlert = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  if (!message) return null;

  const accentColor = type === 'error' ? 'border-l-red-500' : 'border-l-blue-500';
  const iconBg = type === 'error' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600';
  
  const Icon = type === 'error' 
    ? <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
    : <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>;

  return (
    <div className="fixed top-5 right-5 z-50 flex items-center w-full max-w-xs p-4 space-x-3 text-gray-500 bg-white rounded-lg shadow-2xl border-l-4 transition-all duration-300 transform animate-slideIn">
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

export default function ClassStudent() {
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
      const response = await fetch('/api/students/me/classes', { 
        method: 'GET',
        credentials: 'include',
      });
      const result = await response.json();
      if (response.ok) {
        setClasses(result.joinedMapels || []);
      }
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMyClasses();
  }, []);

  const handleOpenClass = (id_mapel) => {
    if (!id_mapel) {
      setAlertInfo({ show: true, message: "Error: ID Mapel tidak ditemukan.", type: 'error' });
      return;
    }
    navigate(`/student/task/${id_mapel}`);
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
    <MainLayoutStudent>
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
              title="Kembali"
            >
              <IconArrowLeft />
            </button>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Mapel Saya</h1>
          </div>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pl-11">
             <p className="text-slate-500 text-lg font-medium">
                Kelola dan akses tugas harianmu.
              </p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-100 border-t-[#0d264f] mb-4"></div>
            <p className="text-slate-400 font-medium">Memuat daftar mapel...</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {classes.length === 0 ? (
                <div className="col-span-full text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-100">
                  <div className="mx-auto w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 text-slate-300">
                    <IconBook /> 
                  </div>
                  <p className="text-slate-400 font-medium">Belum ada mata pelajaran yang diikuti.</p>
                  <button onClick={() => setOpenJoin(true)} className="text-[#0d264f] font-bold text-sm mt-2 hover:underline">Gabung sekarang</button>
                </div>
              ) : (
                currentClasses.map((item) => (
                  <StudentClassCard 
                    key={item.id_mapel} 
                    data={item} 
                    onOpen={() => handleOpenClass(item.id_mapel)}
                  />
                ))
              )}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-10 pb-4">
                <button 
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-100 hover:text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
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
                      className={`w-10 h-10 rounded-xl font-bold text-sm transition-all shadow-sm duration-300 transform hover:scale-105 ${isActive ? 'bg-[#0d264f] text-white shadow-lg' : 'text-slate-500 hover:bg-white hover:text-[#0d264f]'}`}
                    >
                      {pageNumber}
                    </button>
                  );
                })}

                <button 
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-100 hover:text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
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
    </MainLayoutStudent>
  );
}

function StudentClassCard({ data, onOpen }) {
  return (
    <div 
      onClick={onOpen}
      className="group relative bg-white rounded-3xl shadow-sm border border-slate-100 p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden"
    >
      <div className="absolute inset-0 bg-blue-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0"></div>

      <div className="relative z-10">
        <div className="flex justify-between items-start mb-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 group-hover:bg-white group-hover:text-blue-600 group-hover:shadow-sm flex items-center justify-center transition-all duration-300">
             <IconBook />
          </div>
        </div>

        <div className="mb-4">
          <h3 className="text-xl font-bold text-slate-800 group-hover:text-blue-900 transition-colors truncate">
            {data.mapel_name}
          </h3>
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-400 font-medium">Klik untuk lihat tugas</span>
          <div className="text-blue-600 font-bold text-sm opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0 flex items-center gap-1">
            Buka
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

function JoinModal({ onClose, onJoinSuccess, setParentAlert }) {
  const [code, setCode] = useState("");
  const [isJoining, setIsJoining] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!code) return;
    
    try {
      setIsJoining(true);
      const response = await fetch('/api/classes/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ code: code.trim() }),
      });
      
      const res = await response.json();
      
      if (response.ok) {
        onJoinSuccess();
        onClose();
        setCode("");
        setParentAlert({ show: true, message: "Berhasil bergabung ke mapel!", type: 'success' });
      } else {
        setParentAlert({ show: true, message: res.message || "Gagal bergabung ke mapel.", type: 'error' });
      }
    } catch (error) {
      setParentAlert({ show: true, message: "Kesalahan koneksi ke server.", type: 'error' });
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      ></div>
      
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md relative z-10 p-8 animate-scale-up">
        <h3 className="text-2xl font-bold text-slate-900 mb-2">Gabung Mapel</h3>
        <p className="text-slate-500 text-sm mb-6">Masukkan kode mapel dari gurumu untuk mengakses materi.</p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">
              Kode Mapel
            </label>
            <input 
              type="text" 
              value={code}
              onChange={(e) => setCode(e.target.value.toLowerCase())}
              placeholder="contoh: kls-xyz123"
              maxLength={20}
              disabled={isJoining}
              autoFocus
              className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-2 border-slate-100 outline-none focus:border-[#0d264f] focus:ring-4 focus:ring-[#0d264f]/10 transition-all font-mono font-bold text-center tracking-widest text-sm placeholder:text-slate-400 disabled:bg-slate-100 disabled:opacity-60"
            />
          </div>
          
          <div className="flex gap-3 pt-2">
            <button 
              type="button"
              onClick={onClose} 
              disabled={isJoining}
              className="flex-1 py-3.5 rounded-2xl text-slate-600 font-bold hover:bg-slate-100 transition-colors disabled:opacity-50"
            >
              Batal
            </button>
            <button 
              type="submit" 
              disabled={isJoining}
              className="flex-1 py-3.5 rounded-2xl bg-[#0f172a] text-white font-bold hover:bg-slate-800 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isJoining ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Memproses...
                </>
              ) : "Gabung Sekarang"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}