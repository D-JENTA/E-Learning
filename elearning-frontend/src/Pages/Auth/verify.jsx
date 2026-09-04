import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import imageBg from "../../assets/Loginimg.png";
import lockIcon from "../../assets/Salinan lock.png";
import logoAnimation from "../../assets/EDUSpace_logo_animation.mp4";

const VERIFIED_ACCOUNTS_STORAGE_KEY = 'verified_accounts';

const saveVerifiedAccount = (email, role) => {
  if (!email) return;

  try {
    const normalizedEmail = String(email).trim().toLowerCase();
    const normalizedRole = String(role || 'student').trim().toLowerCase();
    const existing = JSON.parse(localStorage.getItem(VERIFIED_ACCOUNTS_STORAGE_KEY) || '[]');
    const next = existing.filter(
      (entry) => !(entry?.email === normalizedEmail && entry?.role === normalizedRole)
    );

    next.push({ email: normalizedEmail, role: normalizedRole });
    localStorage.setItem(VERIFIED_ACCOUNTS_STORAGE_KEY, JSON.stringify(next));
  } catch (error) {
    console.warn('Gagal menyimpan akun terverifikasi:', error);
  }
};

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

const VideoLoadingOverlay = () => (
  <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white">
    <video
      src={logoAnimation}
      autoPlay
      muted
      loop
      playsInline
      className="w-96 h-96 md:w-[28rem] md:h-[28rem] object-contain"
    />
    <p className="mt-6 text-sm font-bold text-gray-600 uppercase tracking-widest animate-pulse">
      Menyiapkan akun Anda...
    </p>
  </div>
);

export default function Verify() {
  const [otp, setOtp] = useState(new Array(6).fill(""));
  const [isLoading, setIsLoading] = useState(false);
  const [timer, setTimer] = useState(0);
  const [canResend, setCanResend] = useState(true);
  const [alertInfo, setAlertInfo] = useState({ show: false, message: '', type: 'success' });
  
  const inputRefs = useRef([]);
  const navigate = useNavigate();
  const location = useLocation();

  const emailFromState = location.state?.email || localStorage.getItem("pending_email") || "";
  const authMode = localStorage.getItem("auth_mode");
  const isRegisterFlow = authMode === "register";

  useEffect(() => {
    const pendingUser = localStorage.getItem("pending_user_id");

    if (!emailFromState && !pendingUser) {
      console.warn("Sesi verifikasi tidak ditemukan, mengalihkan...");
      navigate("/forgot");
      return;
    }

    if (emailFromState && !pendingUser && !isRegisterFlow) {
      const syncPendingUserId = async () => {
        try {
          const response = await fetch('/api/auth/validate-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: emailFromState }),
          });
          if (!response.ok) return;
          const result = await response.json();
          if (result?.id_user) {
            localStorage.setItem('pending_user_id', result.id_user.toString());
          }
        } catch (err) {
          console.warn('Gagal sinkronisasi pending_user_id:', err);
        }
      };
      syncPendingUserId();
    }
  }, [emailFromState, navigate, isRegisterFlow]);

  useEffect(() => {
    let interval = null;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
      if (interval) clearInterval(interval);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timer]);

  const handleResendOtp = async () => {
    if (!canResend) return; 
    if (!emailFromState) {
      setAlertInfo({ show: true, message: "Email tidak ditemukan.", type: 'error' });
      return;
    }

    try {
      const savedUserId = localStorage.getItem("pending_user_id");
      const response = await fetch('/api/auth/resend-otp', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: emailFromState,
          ...(savedUserId ? { user_id: savedUserId } : {}),
        }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result?.id_user) {
          localStorage.setItem('pending_user_id', result.id_user.toString());
        }
        setCanResend(false);
        setTimer(60); 
        setAlertInfo({ show: true, message: "Kode OTP berhasil dikirim ulang.", type: 'success' });
      }
    } catch (e) {
      setAlertInfo({ show: true, message: "Terjadi kesalahan pada server.", type: 'error' });
    }
  };

  const handleChange = (e, index) => {
    const value = e.target.value;
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value !== "" && index < 5) inputRefs.current[index + 1].focus();
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  // --- HANDLER TEMPEL / PASTE OTP ---
  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();
    // Ambil hanya karakter angka
    const digitsOnly = pastedData.replace(/\D/g, "");

    if (digitsOnly.length > 0) {
      const newOtp = [...otp];
      // Isi array OTP sesuai jumlah angka yang ditempel (maksimal 6)
      for (let i = 0; i < Math.min(digitsOnly.length, 6); i++) {
        newOtp[i] = digitsOnly[i];
      }
      setOtp(newOtp);

      // Otomatis pindahkan fokus ke kolom berikutnya setelah angka terakhir yang ditempel
      const nextFocusIndex = Math.min(digitsOnly.length, 5);
      if (inputRefs.current[nextFocusIndex]) {
        inputRefs.current[nextFocusIndex].focus();
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const code = otp.join("");
    const savedUserId = localStorage.getItem("pending_user_id");
    const savedRole = localStorage.getItem("pending_role");

    if (code.length < 6) {
      setAlertInfo({ show: true, message: "Masukkan 6 digit kode OTP.", type: 'error' });
      return;
    }
    
    if (!savedUserId) {
      setAlertInfo({ show: true, message: "Sesi berakhir. Silakan login kembali.", type: 'error' });
      return navigate("/login");
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/verifyOtp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          user_id: savedUserId, 
          otp: code 
        })
      });

      const result = await response.json();

      if (!response.ok) throw new Error(result.message || "OTP Salah.");

      const token = result.token || result.accessToken || result.access_token || result.data?.token;
      // Bersihkan token admin lama supaya interceptor global (setupFetchAuth.js)
      // tidak mengirim token basi dari sesi sebelumnya.
      localStorage.removeItem("admin_token");
      if (token) localStorage.setItem("token", token);

      if (authMode === "reset_password") {
        setIsLoading(false);
        navigate("/reset-password", { state: { email: emailFromState } });
      } else {
        const normalizedRole = String(savedRole || "student").toLowerCase();
        saveVerifiedAccount(emailFromState || localStorage.getItem("pending_email") || "", normalizedRole);
        
        const redirectDelay = isRegisterFlow ? 5000 : 0;

        setTimeout(() => {
          localStorage.removeItem("pending_user_id");
          localStorage.removeItem("pending_role");
          localStorage.removeItem("pending_email");
          localStorage.removeItem("auth_mode");

          if (normalizedRole === "superadmin" || normalizedRole === "admin") {
            window.location.href = "/admin/super-dashboard";
          } else if (normalizedRole === "student") {
            window.location.href = "/student/home";
          } else if (normalizedRole === "teacher") {
            window.location.href = "/teacher/dashboard";
          } else {
            window.location.href = "/dashboard";
          }
        }, redirectDelay);
      }
    } catch (error) {
      setIsLoading(false);
      setAlertInfo({ show: true, message: error.message, type: 'error' });
    }
  };

  return (
    <div className="h-screen w-full flex overflow-hidden bg-[#e8ecfa] font-sans text-center">
      {isLoading && isRegisterFlow && <VideoLoadingOverlay />}

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
          <h2 className="text-2xl font-bold text-gray-800 mb-2 uppercase tracking-tight">Verifikasi Kode</h2>
          <p className="text-xs text-gray-500 mb-8 leading-relaxed">
            Kode verifikasi telah dikirim ke <br />
            <span className="font-bold text-blue-600">{emailFromState || "Email Anda"}</span>
          </p>
          <form onSubmit={handleSubmit} className="flex flex-col">
            <div className="flex justify-between gap-2 mb-6">
              {otp.map((data, index) => (
                <input
                  key={index}
                  type="text"
                  ref={(el) => (inputRefs.current[index] = el)}
                  value={data}
                  onChange={(e) => handleChange(e, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  onPaste={handlePaste}
                  maxLength={1}
                  className="w-10 h-12 md:w-12 bg-white rounded-lg text-center text-xl font-bold outline-none border-2 border-transparent focus:border-blue-500 shadow-sm transition-all"
                />
              ))}
            </div>
            <button 
              type="submit" 
              disabled={isLoading} 
              className="w-full bg-[#0d264f] text-white py-3 rounded-lg font-bold hover:shadow-xl transition-all uppercase text-xs tracking-widest disabled:opacity-50"
            >
              {isLoading ? 'Memverifikasi...' : 'Verifikasi & Lanjutkan'}
            </button>

            <div className="mt-6">
              {canResend ? (
                <p 
                  onClick={handleResendOtp} 
                  className="text-blue-600 cursor-pointer text-xs font-bold hover:underline uppercase"
                >
                  Kirim Ulang OTP
                </p>
              ) : (
                <p className="text-gray-400 text-xs font-bold uppercase tracking-tight">
                  Tunggu {timer} detik untuk kirim ulang
                </p>
              )}
            </div>
          </form>
        </div>
      </div>
      <div className="hidden md:flex w-[40%] h-full bg-[#0d264f] items-center justify-center relative shadow-2xl">
        <img src={imageBg} alt="Ilustrasi" className="w-80" />
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
    </div>
  );
}