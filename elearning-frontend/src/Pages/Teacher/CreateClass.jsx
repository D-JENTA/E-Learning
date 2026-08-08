import MainLayoutTeacher from "../../components/Teacher/MainLayout";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

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

export default function BuatKelas({ user }) {
  const [formData, setFormData] = useState({ 
    nama: '', 
    deskripsi: '' 
  });
  const [isLoading, setIsLoading] = useState(false);
  const [alertInfo, setAlertInfo] = useState({ show: false, message: '', type: 'success' });
  const navigate = useNavigate();

  const teacherId = user?.id_user || user?.id;

  useEffect(() => {
    if (!user && !isLoading) {
      navigate('/login');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.nama.trim()) {
      setAlertInfo({ show: true, message: "Nama kelas tidak boleh kosong!", type: 'error' });
      return;
    }

    if (user?.role !== 'teacher') {
      setAlertInfo({ show: true, message: `Akses Ditolak: Role anda adalah ${user?.role}. Hanya Guru yang bisa membuat kelas.`, type: 'error' });
      return;
    }

    setIsLoading(true);

    try {
      const targetUrl = `/api/teachers/me/classes`;
      const token = localStorage.getItem("token") || localStorage.getItem("admin_token");
      
      const response = await fetch(targetUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        credentials: 'include', 
        body: JSON.stringify({
          "class_name": formData.nama,
          "id_teacher": teacherId 
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setAlertInfo({ show: true, message: "Kelas berhasil dibuat!", type: 'success' });
        setTimeout(() => {
            navigate('/teacher/classes');
        }, 1000);
      } else {
        throw new Error(result.message || "Gagal membuat kelas (Cek apakah ID anda terdaftar di tabel teacher)");
      }

    } catch (error) {
      console.error("Fetch Error:", error);
      setAlertInfo({ show: true, message: "Terjadi Kesalahan: " + error.message, type: 'error' });
    } finally {
      setIsLoading(false);
    }
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

      <div className="max-w-2xl mx-auto p-4">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800">Buat Kelas Baru</h2>
          <p className="text-gray-500">Buat ruang belajar baru untuk siswa Anda.</p>
        </div>
        
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">
              Nama Kelas <span className="text-red-500">*</span>
            </label>
            <input 
              type="text" 
              className="w-full border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[#0d264f] focus:border-transparent transition-all" 
              placeholder="Contoh: XII dkv 6"
              value={formData.nama}
              onChange={(e) => setFormData({...formData, nama: e.target.value})}
              required
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button type="button" onClick={() => navigate(-1)} className="flex-1 bg-gray-100 text-gray-600 py-3 rounded-xl font-bold hover:bg-gray-200">
              Batal
            </button>
            <button type="submit" disabled={isLoading} className="flex-1 bg-[#0d264f] text-white py-3 rounded-xl font-bold">
              {isLoading ? 'Membuat...' : 'Buat Kelas'}
            </button>
          </div>
        </form>
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