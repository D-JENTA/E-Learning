import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import MainLayoutStudent from "../../components/Student/MainLayout";

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

const IconArrowLeft = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
);

const IconUpload = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
);

const IconX = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
);

const IconZoom = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
);

export default function Settings() {
  const [profilePic, setProfilePic] = useState(null);
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [alertInfo, setAlertInfo] = useState({ show: false, message: '', type: 'success' });
  
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const fetchUserData = async () => {
    try {
      setIsLoading(true);
      
      const resPic = await fetch("/api/auth/profile-picture", {
        method: "GET",
        headers: { "ngrok-skip-browser-warning": "69420" },
        credentials: "include",
      });
      const picResult = await resPic.json();
      if (resPic.ok) setProfilePic(picResult.profile_picture_url);

      const resUser = await fetch("/api/auth/me", {
        method: "GET",
        headers: { "ngrok-skip-browser-warning": "69420" },
        credentials: "include",
      });
      const userResult = await resUser.json();
      if (resUser.ok) {
        setUsername(userResult.username || "");
      }
    } catch (err) {
      console.error("Gagal sinkronisasi data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("profile_picture", file);

    try {
      setIsUploading(true);
      const response = await fetch("/api/auth/profile-picture", {
        method: "POST",
        headers: { "ngrok-skip-browser-warning": "69420" },
        body: formData,
        credentials: "include",
      });
      const result = await response.json();
      if (response.ok) {
        setProfilePic(result.profile_picture_url);
        setAlertInfo({ show: true, message: "Foto profil berhasil diperbarui!", type: 'success' });
      } else {
        setAlertInfo({ show: true, message: result.message || "Gagal mengunggah gambar.", type: 'error' });
      }
    } catch (err) {
      setAlertInfo({ show: true, message: "Terjadi kesalahan koneksi saat mengunggah foto.", type: 'error' });
    } finally {
      setIsUploading(false);
    }
  };

  const handleUpdateUsername = async (e) => {
    e.preventDefault();
    try {
      setIsUpdating(true);
      const response = await fetch("/api/auth/users/me/username", { 
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "69420" 
        },
        body: JSON.stringify({ username }),
        credentials: "include",
      });

      const result = await response.json();

      if (response.ok) {
        setAlertInfo({ show: true, message: "Nama pengguna berhasil diperbarui!", type: 'success' });
        // Kosongkan input dan fetch ulang data untuk update inisial di avatar
        setUsername("");
        await fetchUserData(); 
      } else {
        setAlertInfo({ show: true, message: result.message || "Gagal memperbarui nama pengguna.", type: 'error' });
      }
    } catch (err) {
      setAlertInfo({ show: true, message: "Terjadi kesalahan jaringan.", type: 'error' });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <MainLayoutStudent>
      {/* Custom Alert */}
      {alertInfo.show && (
        <CustomAlert 
          message={alertInfo.message} 
          type={alertInfo.type} 
          onClose={() => setAlertInfo({ ...alertInfo, show: false })} 
        />
      )}

      <div className="p-6 md:p-10 max-w-4xl mx-auto space-y-8">
        
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 rounded-full bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-[#0d264f] hover:border-slate-300 transition-all shadow-sm"
            title="Kembali"
          >
            <IconArrowLeft />
          </button>
          
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Pengaturan</h1>
            <p className="text-slate-500 text-lg mt-1">Kelola identitas dan keamanan akun.</p>
          </div>
        </div>
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-8 md:p-12">
            
            <div className="flex flex-col md:flex-row items-center gap-8 mb-12">
              <div className="relative group cursor-pointer" onClick={() => profilePic && setIsImageModalOpen(true)}>
                <div className="w-36 h-36 rounded-full overflow-hidden bg-slate-50 border-4 border-white shadow-xl ring-1 ring-slate-200">
                  {profilePic ? (
                    <img src={profilePic} alt="Profile" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300 text-4xl font-bold bg-slate-100">
                      {username?.charAt(0).toUpperCase() || "U"}
                    </div>
                  )}
                </div>

                {profilePic && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                    <div className="bg-white p-2 rounded-full">
                      <IconZoom />
                    </div>
                  </div>
                )}

                {isUploading && (
                  <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-full">
                    <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-4 text-center md:text-left flex-1">
                <div>
                  <h3 className="text-xl font-bold text-slate-800">Foto Profil</h3>
                  <p className="text-sm text-slate-400 mt-1">Perbarui foto agar lebih dikenali.</p>
                </div>
                
                <div className="flex flex-col md:flex-row gap-3 justify-center md:justify-start">
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    className="hidden" 
                    accept="image/*" 
                  />
                  <button 
                    onClick={() => fileInputRef.current.click()}
                    className="px-6 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2"
                    disabled={isUploading}
                  >
                    <IconUpload /> {isUploading ? "Mengunggah..." : "Unggah Foto"}
                  </button>
                  <p className="text-xs text-slate-400 font-medium self-center">
                    PNG, JPG (Max 2MB)
                  </p>
                </div>
              </div>
            </div>

            <hr className="my-10 border-slate-100" />

            <form onSubmit={handleUpdateUsername} className="space-y-8 max-w-2xl">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">
                  Nama Pengguna
                </label>
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-5 py-3.5 rounded-xl border border-slate-200 focus:border-[#0d264f] focus:ring-2 focus:ring-[#0d264f]/20 outline-none transition-all font-medium text-slate-800 placeholder:text-slate-400" 
                  placeholder="Masukkan username baru" 
                />
              </div>

              <div className="pt-4 flex flex-col md:flex-row items-center gap-4">
                <button 
                  type="submit"
                  // PERUBAHAN: Tombol disabled jika username kosong
                  disabled={isUpdating || !username.trim()}
                  className="w-full md:w-auto px-10 py-3.5 bg-[#0d264f] hover:bg-[#1e3a8a] text-white rounded-xl font-bold text-sm transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUpdating ? "Menyimpan..." : "Simpan Perubahan"}
                </button>

                <button 
                  type="button"
                  onClick={() => navigate("/forgot")}
                  className="w-full md:w-auto px-8 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold text-sm transition-all"
                >
                   Ganti Password
                </button>
              </div>
            </form>

          </div>
        </div>

        {isImageModalOpen && (
          <div 
            className="fixed inset-0 bg-slate-900/90 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300"
            onClick={() => setIsImageModalOpen(false)}
          >
            <div className="relative max-w-4xl w-full">
              <button 
                onClick={() => setIsImageModalOpen(false)}
                className="absolute -top-12 right-0 text-white hover:text-slate-300 transition-colors p-2"
              >
                <IconX />
              </button>
              <img 
                src={profilePic} 
                alt="Full Profile" 
                className="w-full h-auto rounded-lg shadow-2xl object-contain max-h-[80vh]"
                onClick={(e) => e.stopPropagation()}  
              />
            </div>
          </div>
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
    </MainLayoutStudent>
  );
}