import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; 
import MainLayoutTeacher from '../../components/Teacher/MainLayout';

// --- KOMPONEN NOTIFIKASI TOAST ---
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

// ICONS
const IconArrowLeft = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
);

const IconRefresh = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 4v6h-6"></path>
    <path d="M1 20v-6h6"></path>
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
  </svg>
);

const IconTrash = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 6h18"></path>
    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
  </svg>
);

// MODAL DETAIL NILAI
const ScoreDetailModal = ({ isOpen, onClose, data, studentName }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
        <div className="p-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-2xl font-black text-slate-800">Detail Nilai</h3>
              <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">{studentName}</p>
            </div>
          </div>

          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {data && data.length > 0 ? (
              data.map((item) => (
                <div key={item.id_assignmentStudent} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-blue-200 transition-colors">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-blue-500 uppercase tracking-tight">Tugas</span>
                    <span className="font-bold text-slate-700 text-sm">
                      {item.title || "Tugas Tanpa Judul"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-400 italic">Nilai:</span>
                    <span className="bg-white px-4 py-1.5 rounded-xl shadow-sm text-blue-600 font-black text-sm border border-slate-100">
                      {item.score}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10">
                <div className="text-4xl mb-2">📄</div>
                <p className="text-slate-400 font-medium italic">Belum ada rincian tugas.</p>
              </div>
            )}
          </div>

          <button 
            onClick={onClose}
            className="w-full mt-8 py-4 bg-[#0D264F] text-white rounded-2xl font-bold hover:bg-blue-900 transition-all shadow-lg active:scale-95"
          >
            Tutup Rincian
          </button>
        </div>
      </div>
    </div>
  );
};

// KOMPONEN SEL NILAI
const TotalScoreCell = ({ id_student, id_class, studentName }) => {
  const [scoreData, setScoreData] = useState({ avg: "...", details: [] });
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchScore = async () => {
      try {
        const response = await fetch(
          `/api/student/totalScore?id_student=${id_student}&id_class=${id_class}`, 
          {
            method: "GET",
            headers: { "ngrok-skip-browser-warning": "69420" },
            credentials: 'include'
          }
        );

        const result = await response.json();
        setScoreData({
          avg: result.summary?.average_value ?? 0,
          details: result.assignments_detail || [] 
        });
      } catch (err) {
        console.error("Gagal ambil detail:", err);
        setScoreData({ avg: 0, details: [] });
      }
    };

    if (id_student && id_class) fetchScore();
  }, [id_student, id_class]);

  return (
    <>
      <button 
        onClick={() => setIsModalOpen(true)}
        className="inline-flex items-center justify-center bg-blue-50 border border-blue-100 px-4 py-1.5 rounded-full min-w-[85px] cursor-pointer active:scale-90"
      >
        <span 
          className="font-black text-sm" 
          style={{ color: '#1d4ed8' }} 
        >
          {scoreData.avg}
        </span>
        <span 
          className="text-[10px] ml-1 font-bold uppercase opacity-60" 
          style={{ color: '#1d4ed8' }}
        >
          Rata-rata
        </span>
      </button>

      <ScoreDetailModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        data={scoreData.details}
        studentName={studentName}
      />
    </>
  );
};

// KOMPONEN UTAMA
export default function ManageStudents() {
  const { id_class } = useParams(); 
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  // FIX: Melacak id_student yang sedang dihapus secara individual
  const [deletingId, setDeletingId] = useState(null);
  const [alertInfo, setAlertInfo] = useState({ show: false, message: '', type: 'success' });

  const fetchStudents = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/auth/users/${id_class}/students`, {
        method: "GET",
        headers: { "ngrok-skip-browser-warning": "69420" },
        credentials: 'include' 
      });

      const result = await response.json();
      if (response.ok && result[0]?.Students) {
        setStudents(result[0].Students);
      } else {
        setStudents([]);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
      // FIX: isRefreshing di-reset setelah fetch selesai
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (id_class) fetchStudents();
  }, [id_class]);

  const handleRefresh = () => {
    if (!isRefreshing) {
      // FIX: isRefreshing di-set true saat tombol ditekan
      setIsRefreshing(true);
      fetchStudents();
    }
  };

  const handleDelete = async (id_student) => {
    // FIX: Gunakan deletingId per-siswa, bukan isLoading global
    setDeletingId(id_student);
    try {
      const response = await fetch(`/api/teachers/me/classes/${id_class}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json", "ngrok-skip-browser-warning": "69420" },
        credentials: 'include',
        body: JSON.stringify({ id_student }) 
      });
      
      if (response.ok) {
        setAlertInfo({ show: true, message: `Siswa berhasil dikeluarkan.`, type: 'success' });
        fetchStudents();
      } else {
        const result = await response.json().catch(() => ({}));
        setAlertInfo({ show: true, message: result.message || "Gagal menghapus siswa.", type: 'error' });
      }
    } catch (error) {
      console.error(error);
      setAlertInfo({ show: true, message: "Terjadi kesalahan jaringan.", type: 'error' });
    } finally {
      setDeletingId(null);
    }
  };

  const filteredStudents = students.filter((s) =>
    s.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.nis?.toString().includes(searchTerm)
  );

  return (
    <MainLayoutTeacher>
      {alertInfo.show && (
        <CustomAlert 
          message={alertInfo.message} 
          type={alertInfo.type} 
          onClose={() => setAlertInfo({ ...alertInfo, show: false })} 
        />
      )}

      <div className="p-4 md:p-8 max-w-7xl mx-auto">
        <div className="mb-6">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 rounded-full bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-[#0d264f] hover:border-slate-300 transition-all shadow-sm"
            title="Kembali"
          >
            <IconArrowLeft />
          </button>
        </div>

        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-10 gap-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">Kelola Siswa</h2>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">
              ID Kelas: <span className="text-blue-600">#{id_class}</span>
            </p>
          </div>
          
          {/* FIX: Input pencarian yang sebelumnya tidak dirender */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
            <input
              type="text"
              placeholder="Cari nama atau NIS..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-sm font-medium placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all w-full sm:w-64"
            />
            <button 
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 hover:text-[#0d264f] hover:border-[#0d264f] transition-all disabled:opacity-50"
              title="Refresh Data"
            >
              {/* FIX: Animasi spin hanya pada icon, bukan wrapper */}
              <span className={isRefreshing ? "animate-spin" : ""}>
                <IconRefresh />
              </span>
              Refresh
            </button>
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[600px]">
              <thead>
                <tr className="border-b border-slate-50 bg-slate-50/30">
                  <th className="px-4 md:px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Nama Siswa</th>
                  <th className="px-4 md:px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">NIS</th>
                  <th className="px-4 md:px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Nilai Rata-rata</th>
                  <th className="px-4 md:px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {isLoading ? (
                  <tr><td colSpan="4" className="px-4 md:px-10 py-24 text-center animate-pulse text-slate-400 font-bold">Memuat...</td></tr>
                ) : filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-4 md:px-10 py-24 text-center text-slate-400">
                        <div className="flex flex-col items-center gap-3">
                          <div className="p-3 bg-slate-50 rounded-full text-slate-300">
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v6m0 6h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                          </div>
                          <span>Belum ada siswa.</span>
                        </div>
                    </td>
                  </tr>
                ) : filteredStudents.map((s) => (
                  <tr key={s.id_student} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 md:px-10 py-6">
                      <span className="font-bold text-slate-700">{s.username}</span>
                    </td>
                    <td className="px-4 md:px-10 py-6">
                      <span className="text-slate-400 font-mono text-xs">{s.nis || '-'}</span>
                    </td>
                    <td className="px-4 md:px-10 py-6 text-center">
                      <TotalScoreCell id_student={s.id_student} id_class={id_class} studentName={s.username} />
                    </td>
                    <td className="px-4 md:px-10 py-6 text-right">
                      <button 
                        onClick={() => handleDelete(s.id_student)} 
                        disabled={deletingId === s.id_student}
                        className="p-3 text-slate-300 hover:text-red-500 transition-all disabled:opacity-50"
                        title="Hapus Siswa"
                      >
                        {/* FIX: SVG spinner yang benar menggunakan <circle> bukan <path> dengan atribut cx/cy/r */}
                        {deletingId === s.id_student ? (
                          <svg className="animate-spin h-5 w-5 text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        ) : (
                          <IconTrash />
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { 
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        @keyframes slideIn {
          from { opacity:0; transform: translateX(100%); }
          to { opacity: 1; transform: translateX(0); }
        }
        .animate-slideIn {
          animation: slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </MainLayoutTeacher>
  );
}