import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import imageBg from "../../assets/Loginimg.png";
import lockIcon from "../../assets/Salinan lock.png";

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
    ? <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12 a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
    : <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>;

  return (
    <div className="fixed top-5 right-5 z-50 flex items-center w-full max-w-xs p-4 space-x-3 text-gray-500 bg-white rounded-lg shadow-2xl border-l-4 transition-all duration-300 transform animate-slideIn">
      <div className={`inline-flex items-center justify-center flex-shrink-0 w-8 h-8 rounded-lg ${iconBg}`}>
        {Icon}
      </div>
      <div className="flex-1 text-sm font-medium text-gray-800">{message}</div>
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

export default function ResetPassword() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // State untuk toggle visibilitas password
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false); 
  const [alertInfo, setAlertInfo] = useState({ show: false, message: '', type: 'success' });

  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email || localStorage.getItem("pending_email") || "User";
  const userId = localStorage.getItem("pending_user_id");

  const showAlert = (message, type = 'success') => {
    setAlertInfo({ show: true, message, type });
  };

  useEffect(() => {
    if (!userId && !isSuccess) {
      showAlert("Sesi tidak valid. Silakan masukkan email Anda kembali.", 'error');
      navigate("/forgot");
    }
  }, [userId, navigate, isSuccess]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      showAlert("Konfirmasi password tidak cocok!", 'error');
      return;
    }

    if (newPassword.length < 6) {
      showAlert("Password harus minimal 6 karakter.", 'error');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/update-password', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ 
          user_id: userId,
          newPassword: newPassword 
        })
      });

      const res = await response.json();

      if (response.ok) {
        setIsSuccess(true); 
        showAlert("Password Anda berhasil diperbarui!", 'success');
        
        localStorage.removeItem("pending_user_id");
        localStorage.removeItem("pending_email");
        localStorage.removeItem("auth_mode");
        
        setTimeout(() => {
          navigate("/login", { replace: true });
        }, 1500);
      } else {
        showAlert(res.message || "Terjadi kesalahan saat memperbarui password.", 'error');
      }
    } catch (error) {
      console.error("Fetch error:", error);
      showAlert("Tidak dapat terhubung ke server.", 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen w-full flex overflow-hidden bg-[#e8ecfa] font-sans">
      {/* Render Custom Alert */}
      {alertInfo.show && (
        <CustomAlert 
          message={alertInfo.message} 
          type={alertInfo.type} 
          onClose={() => setAlertInfo({ ...alertInfo, show: false })} 
        />
      )}

      <div className="w-full md:w-[60%] h-full flex items-center justify-center p-4">
        <div className="w-full max-w-[360px]">
          <div className="flex justify-center mb-6">
             <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm border">
                <img src={lockIcon} alt="lock" className="w-10 h-10 object-contain" />
             </div>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-800 mb-2 uppercase text-center tracking-tight">Password Baru</h2>
          <p className="text-[11px] text-gray-500 mb-8 text-center font-bold uppercase tracking-widest">
            Email: <span className="text-blue-600">{email}</span>
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Input Password Baru */}
            <div className="flex flex-col">
              <label className="text-[10px] font-bold text-gray-400 uppercase ml-1 mb-1 tracking-tighter">Password Baru</label>
              <div className="relative">
                <input 
                  type={showNewPassword ? "text" : "password"} 
                  placeholder="••••••••" 
                  required 
                  autoComplete="new-password"
                  value={newPassword}
                  className="w-full px-4 py-3 rounded-lg border-2 border-transparent focus:border-blue-500 outline-none shadow-sm bg-white transition-all pr-10 text-sm" 
                  onChange={(e) => setNewPassword(e.target.value)} 
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors focus:outline-none"
                >
                  {showNewPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                      <line x1="2" x2="22" y1="2" y2="22" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Input Konfirmasi Password */}
            <div className="flex flex-col">
              <label className="text-[10px] font-bold text-gray-400 uppercase ml-1 mb-1 tracking-tighter">Konfirmasi Password</label>
              <div className="relative">
                <input 
                  type={showConfirmPassword ? "text" : "password"} 
                  placeholder="••••••••" 
                  required 
                  autoComplete="new-password"
                  value={confirmPassword}
                  className="w-full px-4 py-3 rounded-lg border-2 border-transparent focus:border-blue-500 outline-none shadow-sm bg-white transition-all pr-10 text-sm" 
                  onChange={(e) => setConfirmPassword(e.target.value)} 
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors focus:outline-none"
                >
                  {showConfirmPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                      <line x1="2" x2="22" y1="2" y2="22" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isLoading} 
              className="w-full bg-[#0d264f] text-white py-3 rounded-lg font-bold hover:shadow-xl transition-all uppercase text-xs tracking-widest disabled:opacity-50 mt-2 shadow-md"
            >
              {isLoading ? 'Memperbarui...' : 'Perbarui Password'}
            </button>
          </form>

          <p className="text-center text-[10px] text-gray-400 mt-8 uppercase font-bold tracking-widest">
            Ingat password? <button onClick={() => navigate("/login")} className="text-blue-600 hover:underline">Masuk</button>
          </p>
        </div>
      </div>

      <div className="hidden md:flex w-[40%] h-full bg-[#0d264f] items-center justify-center relative">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-900/20 to-black/40 opacity-50"></div>
        <img src={imageBg} alt="Illustration" className="w-80 relative z-10" />
      </div>
      
      <style>{` 
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(100%); }
          to   { opacity: 1; transform: translateX(0); }
        }
        .animate-slideIn { animation: slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>
    </div>
  );
}