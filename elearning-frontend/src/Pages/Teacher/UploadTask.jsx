// FIX: Import useEffect langsung, bukan lewat React.useEffect
import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from 'react-router-dom';
import MainLayoutTeacher from '../../components/Teacher/MainLayout';

// --- KOMPONEN NOTIFIKASI TOAST ---
const CustomAlert = ({ message, type, onClose }) => {
  // FIX: Hapus useState(timer) yang tidak perlu — cukup pakai useEffect langsung
  useEffect(() => {
    const t = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(t);
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

export default function UploadTask() {
  const { id_class } = useParams(); 
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '23:59',
    file: null,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [alertInfo, setAlertInfo] = useState({ show: false, message: '', type: 'success' });

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, file: e.target.files[0] });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!id_class || id_class === "undefined") {
      setAlertInfo({ show: true, message: "ID Kelas tidak valid!", type: 'error' });
      return;
    }

    if (!formData.title || !formData.file) {
      setAlertInfo({ show: true, message: "Judul tugas dan File wajib diisi!", type: 'error' });
      return;
    }

    const MAX_FILE_SIZE = 10 * 1024 * 1024;
    if (formData.file.size > MAX_FILE_SIZE) {
      setAlertInfo({ show: true, message: "File terlalu besar. Maksimum 10MB.", type: 'error' });
      return;
    }

    if (formData.date) {
      const selectedDate = new Date(`${formData.date}T${formData.time}`);
      const now = new Date();
      if (selectedDate < now) {
        setAlertInfo({ show: true, message: "Waktu deadline tidak boleh di masa lalu!", type: 'error' });
        return;
      }
    }

    try {
      setIsLoading(true);
      const data = new FormData();
      data.append("assignment_title", formData.title);
      data.append("description", formData.description);
      data.append("file", formData.file);
      
      if (formData.date) {
        const deadlineString = new Date(`${formData.date}T${formData.time}`).toISOString();
        data.append("deadline", deadlineString);
      }

      const response = await fetch(`/api/teachers/mapel/${id_class}/assignments`, {
        method: "POST",
        credentials: "include",
        body: data,
      });

      const contentType = response.headers.get("content-type") || "";
      let result = null;
      let textResponse = null;
      if (contentType.includes("application/json")) {
        result = await response.json().catch(() => null);
      } else {
        textResponse = await response.text().catch(() => null);
      }

      if (response.ok) {
        setAlertInfo({ show: true, message: "Tugas berhasil dibuat!", type: 'success' });
        setTimeout(() => {
          navigate(`/teacher/assignments/${id_class}`);
        }, 1000);
      } else {
        const message = result?.message || result?.error || textResponse || `Gagal mengunggah tugas. (HTTP ${response.status})`;
        setAlertInfo({ show: true, message: message, type: 'error' });
      }
    } catch (error) {
      console.error("Upload error:", error);
      setAlertInfo({ show: true, message: "Gagal menghubungi server.", type: 'error' });
    } finally {
      setIsLoading(false);
    }
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

      <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-8 animate-fade-in-up">
        
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-full bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-[#0d264f] hover:border-slate-300 transition-all shadow-sm"
              title="Kembali"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
            </button>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Buat Tugas Baru</h1>
          </div>
          <div className="pl-11">
            <p className="text-slate-500 text-lg font-medium">Isi detail tugas baru untuk kelas ini.</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <form onSubmit={handleSubmit} className="p-6 md:p-10 space-y-8">
            
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">
                Judul Tugas
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder="Contoh: Kuis Matematika Bab 1"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 text-base font-bold text-slate-800 focus:bg-white focus:border-[#0d264f] focus:ring-2 focus:ring-[#0d264f]/10 outline-none transition-all placeholder:text-slate-400"
              />
            </div>      

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">
                Deskripsi / Instruksi
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Apa yang harus dilakukan siswa?"
                rows="5"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 text-base font-medium text-slate-800 focus:bg-white focus:border-[#0d264f] focus:ring-2 focus:ring-[#0d264f]/10 outline-none transition-all placeholder:text-slate-400 resize-none"
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">
                  Deadline
                </label>
                <span className="text-[10px] text-slate-300 bg-slate-100 px-2 py-0.5 rounded-full font-medium">Opsional</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#0d264f] transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    min={new Date().toISOString().split("T")[0]}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-4 py-3.5 text-base font-bold text-slate-800 focus:bg-white focus:border-[#0d264f] focus:ring-2 focus:ring-[#0d264f]/10 outline-none transition-all [color-scheme:light]"
                  />
                </div>

                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#0d264f] transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <input
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-4 py-3.5 text-base font-bold text-slate-800 focus:bg-white focus:border-[#0d264f] focus:ring-2 focus:ring-[#0d264f]/10 outline-none transition-all [color-scheme:light]"
                  />
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 flex items-start gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-sm">
                  {formData.date ? (
                    <p className="text-blue-800 font-medium">
                      Tenggat waktu: <span className="font-bold">{formData.date}</span> pukul <span className="font-bold">{formData.time} WIB</span>.
                    </p>
                  ) : (
                    <p className="text-blue-600/80">
                      Jika tanggal dikosongkan, siswa dapat mengumpulkan tugas kapan saja tanpa batas waktu.
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">
                Lampirkan File
              </label>
              <div
                className={`relative border-2 border-dashed rounded-2xl p-8 md:p-12 text-center transition-all duration-300 cursor-pointer group
                  ${isDragging ? 'border-[#0d264f] bg-blue-50 scale-[1.01]' : 'border-slate-200 hover:bg-slate-50'}
                  ${formData.file ? 'border-green-500 bg-green-50' : ''}
                `}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  if (e.dataTransfer.files[0]) setFormData({...formData, file: e.dataTransfer.files[0]});
                }}
              >
                <input
                  type="file"
                  accept="application/pdf,image/*,video/*"
                  required
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className="flex flex-col items-center gap-4 relative z-0">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110
                    ${formData.file ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200 group-hover:text-[#0d264f]'}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-slate-700 font-semibold text-base">
                      {formData.file ? (
                        <span className="text-green-700 truncate max-w-xs block">{formData.file.name}</span>
                      ) : (
                        <>
                          <span className="text-[#0d264f]">Klik untuk mengunggah</span> atau drag & drop
                        </>
                      )}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">PDF, Gambar, atau Video (Maks. 10MB)</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-6 border-t border-slate-100">
              <button 
                type="button"
                onClick={() => navigate(-1)}
                className="w-full sm:w-auto px-6 py-3 rounded-xl text-slate-600 font-bold hover:bg-slate-100 transition-all"
              >
                Batal
              </button>
              <button 
                type="submit"
                disabled={isLoading}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl text-white bg-[#0d264f] hover:bg-blue-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl font-bold flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Mengunggah...
                  </>
                ) : "Buat Tugas"}
              </button>
            </div>

          </form>
        </div>
      </div>

      <style>{`
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