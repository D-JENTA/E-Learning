import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import MainLayoutTeacher from '../../components/Teacher/MainLayout';

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

const IconCopy = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
  </svg>
);

const ScoreDetailModal = ({ isOpen, onClose, summary, studentName }) => {
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

          <div className="space-y-3">
            <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="font-bold text-slate-700 text-sm">Jumlah Tugas Dinilai</span>
              <span className="bg-white px-4 py-1.5 rounded-xl shadow-sm text-blue-600 font-black text-sm border border-slate-100">
                {summary?.total_assignments ?? 0}
              </span>
            </div>

            <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="font-bold text-slate-700 text-sm">Total Skor Nilai</span>
              <span className="bg-white px-4 py-1.5 rounded-xl shadow-sm text-blue-600 font-black text-sm border border-slate-100">
                {summary?.total_score ?? 0}
              </span>
            </div>

            <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="font-bold text-slate-700 text-sm">Rata-rata Nilai</span>
              <span className="bg-white px-4 py-1.5 rounded-xl shadow-sm text-blue-600 font-black text-sm border border-slate-100">
                {summary?.average_value ?? 0}
              </span>
            </div>
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

const TotalScoreCell = ({ id_student, id_mapel, studentName }) => {
  const { id_class } = useParams();
  const [summary, setSummary] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState(false);

  useEffect(() => {
    if (!id_student || !id_mapel) return;

    const fetchTotalScore = async () => {
      setLoading(true);
      setFetchError(false);
      try {
        const tokenKey = `mapel_class_${id_class}token`;
        const token = localStorage.getItem(tokenKey) || localStorage.getItem('token') || sessionStorage.getItem('token');

        const url = `/api/student/totalScore?id_student=${id_student}&id_mapel=${id_mapel}`;
        const options = {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'ngrok-skip-browser-warning': '69420'
          }
        };

        const response = await fetch(url, options);

        if (!response.ok) {
          console.error('totalScore request gagal, status:', response.status);
          setFetchError(true);
          return;
        }

        const result = await response.json();

        if (result && result.summary) {
          setSummary(result.summary);
        } else if (result && typeof result.total_score !== 'undefined') {
          setSummary(result);
        } else {
          setFetchError(true);
        }
      } catch (err) {
        console.error('Error mengambil total score:', err);
        setFetchError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchTotalScore();
  }, [id_student, id_mapel, id_class]);

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        disabled={fetchError}
        className="inline-flex items-center justify-center bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-full cursor-pointer active:scale-90 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span className="font-black text-xs sm:text-sm text-blue-600">
          {loading ? '...' : fetchError ? '-' : (summary?.total_score ?? '0')}
        </span>
        <span className="text-[9px] sm:text-[10px] ml-1 font-bold uppercase opacity-60 text-blue-600 hidden sm:inline">
          Total Nilai
        </span>
      </button>

      <ScoreDetailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        summary={summary}
        studentName={studentName}
      />
    </>
  );
};

export default function ManageStudent() {
  // Ambil id_class DAN id_mapel opsional dari URL
  const { id_class, id_mapel: urlMapelId } = useParams();

  const [students, setStudents] = useState([]);
  const [mapelList, setMapelList] = useState([]);
  const [currentMapelId, setCurrentMapelId] = useState(urlMapelId || null);
  const [mapelLoading, setMapelLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [alertInfo, setAlertInfo] = useState({ show: false, message: '', type: 'success' });

  const extractId = (obj, keys) => {
    if (!obj) return undefined;
    for (const key of keys) {
      if (obj[key] !== undefined && obj[key] !== null && obj[key] !== '') {
        return obj[key];
      }
    }
    return undefined;
  };

  const fetchMapels = async () => {
    setMapelLoading(true);
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      // Ambil HANYA mapel yang diampu guru yang sedang login.
      // Endpoint /classes/:id/mapels mengembalikan mapel SEMUA guru di kelas itu,
      // jadi auto-select mapel pertama bisa menunjuk mapel guru lain -> totalScore balas 403.
      const response = await fetch(`/api/teachers/me/mapels`, {
        method: "GET",
        headers: {
          "ngrok-skip-browser-warning": "69420",
          "Authorization": `Bearer ${token}`
        },
        credentials: 'include'
      });

      if (!response.ok) {
        setAlertInfo({
          show: true,
          message: `Gagal memuat mata pelajaran (status ${response.status}).`,
          type: 'error',
        });
        return;
      }

      const result = await response.json();
      let all = [];

      if (Array.isArray(result)) all = result;
      else if (Array.isArray(result?.data)) all = result.data;
      else if (Array.isArray(result?.mapels)) all = result.mapels;
      else if (result && typeof result === 'object') {
        all = Object.values(result).filter((val) => Array.isArray(val)).flat();
      }

      // Saring ke kelas yang sedang dibuka saja
      const list = all.filter((m) => {
        const mClass = extractId(m, ['id_class', 'class_id', 'idClass']);
        return String(mClass) === String(id_class);
      });

      setMapelList(list);

      // Pakai id_mapel dari URL hanya kalau memang salah satu mapel guru ini; kalau tidak, pilih mapel pertama.
      const urlMapelIsOwned = urlMapelId && list.some(
        (m) => String(extractId(m, ['id_mapel', 'id', 'mapel_id', 'idMapel'])) === String(urlMapelId)
      );
      if (urlMapelIsOwned) {
        setCurrentMapelId(urlMapelId);
      } else if (list.length > 0) {
        const firstMapelId = extractId(list[0], ['id_mapel', 'id', 'mapel_id', 'idMapel']);
        if (firstMapelId !== undefined) {
          setCurrentMapelId(firstMapelId);
        }
      } else {
        setCurrentMapelId(null);
      }
    } catch (error) {
      console.error("Gagal fetch mapel:", error);
      setAlertInfo({ show: true, message: 'Gagal memuat mata pelajaran.', type: 'error' });
    } finally {
      setMapelLoading(false);
    }
  };

  const fetchStudents = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const response = await fetch(`/api/auth/users/${id_class}/students`, {
        method: "GET",
        headers: { 
          "ngrok-skip-browser-warning": "69420",
          "Authorization": `Bearer ${token}`
        },
        credentials: 'include' 
      });

      const result = await response.json();
      let list = [];
      if (Array.isArray(result)) {
        if (result.length > 0 && Array.isArray(result[0].Students)) {
          list = result[0].Students;
        } else {
          list = result;
        }
      } else if (result.Students && Array.isArray(result.Students)) {
        list = result.Students;
      }

      setStudents(list);
    } catch (error) {
      console.error("Gagal fetch students:", error);
      setAlertInfo({ show: true, message: 'Gagal memuat data siswa.', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (id_class) {
      fetchStudents();
      fetchMapels();
    }
  }, [id_class]);

  const handleCopyNis = async (student) => {
    const nis = student.nis ? String(student.nis) : '';
    if (!nis) {
      setAlertInfo({ show: true, message: 'Siswa ini belum memiliki NIS.', type: 'error' });
      return;
    }
    try {
      await navigator.clipboard.writeText(nis);
      setAlertInfo({ show: true, message: `NIS ${nis} disalin ke clipboard.`, type: 'success' });
    } catch {
      setAlertInfo({ show: true, message: 'Gagal menyalin NIS.', type: 'error' });
    }
  };

  const filteredStudents = students.filter((s) =>
    (s.username ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.nis ?? '').toString().includes(searchTerm)
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

      <div className="pl-2 md:pl-4 pr-4 md:pr-8 py-6 md:py-10 max-w-7xl">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-8 gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">Kelola Siswa</h2>
          </div>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
            {/* Dropdown Pemilih Mapel untuk Mencegah 403 */}
            {mapelList.length > 1 && (
              <select
                value={currentMapelId || ''}
                onChange={(e) => setCurrentMapelId(e.target.value)}
                className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all cursor-pointer"
              >
                {mapelList.map((m, idx) => {
                  const mId = extractId(m, ['id_mapel', 'id', 'mapel_id', 'idMapel']);
                  const mName = m.mapel_name || m.nama_mapel || m.name || m.subject_name || `Mapel ${mId}`;
                  return (
                    <option key={mId || idx} value={mId}>
                      {mName}
                    </option>
                  );
                })}
              </select>
            )}

            <input
              type="text"
              placeholder="Cari nama atau NIS..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-sm font-medium placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all w-full sm:w-64"
            />
          </div>
        </div>

        <div className="bg-white rounded-[2rem] shadow-xl border border-slate-50 overflow-hidden">
          <table className="w-full text-left table-auto">
            <thead>
              <tr className="border-b border-slate-50 bg-slate-50/30">
                <th className="px-2 sm:px-4 py-4 text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest w-10 text-center">No</th>
                <th className="px-2 sm:px-6 py-4 text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">Nama Siswa</th>
                <th className="px-2 sm:px-6 py-4 text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">NIS</th>
                <th className="px-2 sm:px-6 py-4 text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Total Nilai</th>
                <th className="px-2 sm:px-6 py-4 text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading ? (
                <tr><td colSpan="5" className="px-4 py-16 text-center animate-pulse text-slate-400 font-bold text-sm">Memuat...</td></tr>
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-4 py-16 text-center text-slate-400">
                      <div className="flex flex-col items-center gap-2">
                        <div className="p-3 bg-slate-50 rounded-full text-slate-300">
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v6m0 6h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <span className="text-xs sm:text-sm">Belum ada siswa.</span>
                      </div>
                  </td>
                </tr>
              ) : filteredStudents.map((s, i) => {
                const studentId = extractId(s, ['id_student', 'id', 'user_id', 'id_siswa', 'student_id']);
                return (
                  <tr key={studentId || i} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-2 sm:px-4 py-4 text-center">
                      <span className="text-slate-400 font-mono text-xs">{i + 1}</span>
                    </td>
                    <td className="px-2 sm:px-6 py-4">
                      <span className="font-bold text-slate-700 text-xs sm:text-sm block truncate max-w-[150px] sm:max-w-xs">{s.username ?? s.name}</span>
                    </td>
                    <td className="px-2 sm:px-6 py-4">
                      <span className="text-slate-400 font-mono text-xs">{s.nis || '-'}</span>
                    </td>
                    <td className="px-2 sm:px-6 py-4 text-center">
                      {mapelLoading ? (
                        <span className="text-xs text-slate-400 italic">Memuat mapel...</span>
                      ) : !currentMapelId ? (
                        <span className="text-xs text-red-400 italic">Mapel tidak ditemukan</span>
                      ) : !studentId ? (
                        <span className="text-xs text-red-400 italic">ID siswa tidak ditemukan</span>
                      ) : (
                        <TotalScoreCell 
                          id_student={studentId} 
                          id_mapel={currentMapelId} 
                          studentName={s.username ?? s.name} 
                        />
                      )}
                    </td>
                    <td className="px-2 sm:px-6 py-4 text-right">
                      <button
                        onClick={() => handleCopyNis(s)}
                        className="inline-flex items-center justify-center p-2 lg:px-3 lg:py-1.5 rounded-lg text-slate-500 hover:text-[#0d264f] hover:bg-slate-50 border border-slate-200 text-xs font-bold transition-all active:scale-95"
                        title="Salin NIS"
                      >
                        <IconCopy />
                        <span className="hidden lg:inline ml-1">Salin NIS</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
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