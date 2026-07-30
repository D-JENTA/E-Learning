import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import imageBg from '../../assets/Loginimg.png';

const RATE_LIMIT_STORAGE_KEY = 'login_rate_limit_until';
const DEFAULT_RATE_LIMIT_SECONDS = 60;

const ROLE_DEST = {
  student: '/student/home',
  teacher: '/teacher/dashboard',
  admin: '/admin/super-dashboard',
  superAdmin: '/admin/super-dashboard',
  superadmin: '/admin/super-dashboard',
  super_admin: '/admin/super-dashboard',
};

const normalizeRole = (role) => {
  if (role === 'admin' || role === 'superadmin' || role === 'super_admin') {
    return 'superAdmin';
  }
  return role;
};

const formatCooldown = (seconds) => {
  const safeSeconds = Math.max(0, seconds);
  const minutes = Math.floor(safeSeconds / 60);
  const remainingSeconds = safeSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
};

const getRetryAfterSeconds = (response, result) => {
  const retryAfterHeader = response.headers.get('Retry-After');
  const rateLimitResetHeader = response.headers.get('RateLimit-Reset');

  if (retryAfterHeader) {
    const retryAfterNumber = Number(retryAfterHeader);
    if (!Number.isNaN(retryAfterNumber) && retryAfterNumber > 0) return Math.ceil(retryAfterNumber);
    const retryAfterDate = Date.parse(retryAfterHeader);
    if (!Number.isNaN(retryAfterDate)) return Math.max(1, Math.ceil((retryAfterDate - Date.now()) / 1000));
  }

  if (rateLimitResetHeader) {
    const resetNumber = Number(rateLimitResetHeader);
    if (!Number.isNaN(resetNumber) && resetNumber > 0) {
      const nowSeconds = Math.floor(Date.now() / 1000);
      return resetNumber > nowSeconds ? resetNumber - nowSeconds : resetNumber;
    }
  }
  return Number(result?.retryAfter) || DEFAULT_RATE_LIMIT_SECONDS;
};

// --- KOMPONEN NOTIFIKASI TOAST (Bisa di-close & Auto-close) ---
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
        <span className="sr-only">Close</span>
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
      </button>
    </div>
  );
};

const InputField = ({
  label,
  type,
  value,
  onChange,
  placeholder,
  icon,
  onIconClick,
  error,
  name,
  autoComplete,
}) => {
  return (
    <div className="mb-4 w-full relative group">
      <label className="block text-[11px] font-bold text-gray-500 mb-1 ml-1 uppercase tracking-wider text-left">
        {label}
      </label>

      <div className="relative">
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className={`w-full px-4 py-3 rounded-lg bg-white text-sm outline-none border-2 transition-all duration-200 ${
            error
              ? 'border-red-400 focus:border-red-500'
              : 'border-transparent focus:border-blue-500 focus:shadow-md'
          } group-hover:border-gray-200`}
        />

        {icon && (
          <button
            type="button"
            onClick={onIconClick}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors focus:outline-none"
          >
            {icon}
          </button>
        )}
      </div>

      {error && (
        <p className="text-red-500 text-[10px] mt-1 ml-1 font-medium text-left">
          {error}
        </p>
      )}
    </div>
  );
};

export default function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [rateLimitSeconds, setRateLimitSeconds] = useState(0);

  // State untuk Custom Alert (Toast)
  const [alertInfo, setAlertInfo] = useState({ show: false, message: '', type: 'success' });

  const navigate = useNavigate();
  const isRateLimited = rateLimitSeconds > 0;

  useEffect(() => {
    const updateCooldown = () => {
      const storedUntil = Number(localStorage.getItem(RATE_LIMIT_STORAGE_KEY) || 0);
      const remaining = Math.ceil((storedUntil - Date.now()) / 1000);
      if (remaining > 0) {
        setRateLimitSeconds(remaining);
      } else {
        setRateLimitSeconds(0);
        localStorage.removeItem(RATE_LIMIT_STORAGE_KEY);
      }
    };
    updateCooldown();
    const interval = setInterval(updateCooldown, 1000);
    return () => clearInterval(interval);
  }, []);

  const startRateLimitCooldown = (seconds = DEFAULT_RATE_LIMIT_SECONDS) => {
    const cooldownSeconds = Number(seconds) > 0 ? Number(seconds) : DEFAULT_RATE_LIMIT_SECONDS;
    const until = Date.now() + cooldownSeconds * 1000;
    localStorage.setItem(RATE_LIMIT_STORAGE_KEY, String(until));
    setRateLimitSeconds(cooldownSeconds);
  };

  const showAlert = (message, type = 'success') => {
    setAlertInfo({ show: true, message, type });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setErrors((prev) => ({
      ...prev,
      [name]: '',
      general: '',
    }));
  };

  const validate = () => {
    const newErrors = {};

    // Hanya validasi kosong, format email dihilangkan agar fokus error ke "Email atau Password salah"
    if (!formData.email) {
      newErrors.email = 'Email wajib diisi';
    }

    if (!formData.password) {
      newErrors.password = 'Password wajib diisi';
    }

    return newErrors;
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (isLoading) return;

    if (isRateLimited) {
      const message = `Terlalu banyak percobaan login. Coba lagi dalam ${formatCooldown(rateLimitSeconds)}.`;
      setErrors({ general: message });
      showAlert(message, 'error'); 
      return;
    }

    const validationErrors = validate();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      const contentType = response.headers.get('content-type');

      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server bermasalah atau URL salah (Response bukan JSON)'); 
      }

      const result = await response.json();

      if (response.status === 429) {
        const retryAfter = getRetryAfterSeconds(response, result);
        startRateLimitCooldown(retryAfter);
        throw new Error(
          result.message ||
            `Terlalu banyak percobaan login. Coba lagi dalam ${formatCooldown(retryAfter)}.`
        );
      }

      if (!response.ok) {
        // PERUBAHAN: Menggabungkan semua error login (email salah/pass salah) menjadi satu pesan
        throw new Error('Email atau Password salah');
      }

      localStorage.removeItem(RATE_LIMIT_STORAGE_KEY);
      setRateLimitSeconds(0);

      const userId = result.user?.id_user || result.user_id || result.id;
      const rawUserRole =
        result.user?.role || result.role || (result.requiresTwoFactor ? 'admin' : undefined);
      const userRole = normalizeRole(rawUserRole);
      const requiresOtp = result.requiresOTP || result.requiresTwoFactor || false;

      if (result.user) {
        localStorage.setItem(
          'user',
          JSON.stringify({
            ...result.user,
            role: userRole,
          })
        );
      }

      if (userId && requiresOtp) {
        localStorage.setItem('pending_user_id', userId.toString());
        localStorage.setItem('pending_role', userRole || 'admin');
        localStorage.setItem('pending_email', formData.email);

        showAlert('Login Berhasil! Masukkan kode OTP yang dikirim ke email.', 'success');

        setTimeout(() => {
          navigate('/verify', {
            state: { email: formData.email },
            replace: true,
          });
        }, 1500);

        return;
      }

      const dest = ROLE_DEST[userRole];

      if (!dest) {
        throw new Error('Role user tidak dikenali');
      }

      window.location.replace(dest);
    } catch (error) {
      console.error('Login Error:', error);
      const message = error.message || 'Terjadi kesalahan saat login';
      setErrors({ general: message });
      showAlert(message,'error'); 
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen w-full flex overflow-hidden bg-[#e8ecfa] font-sans">
      {/* Render Custom Alert (Toast Pojok Kanan Atas) */}
      {alertInfo.show && (
        <CustomAlert 
          message={alertInfo.message} 
          type={alertInfo.type} 
          onClose={() => setAlertInfo({ ...alertInfo, show: false })} 
        />
      )}

      <div className="w-full md:w-[60%] h-full flex items-center justify-center p-4 relative z-10">
        <div className="w-full max-w-[360px]">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 tracking-tight text-center">
            Selamat Datang Kembali
          </h2>

          <form onSubmit={handleLogin} className="flex flex-col">
            <InputField
              label="Alamat Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="nama@email.com"
              error={errors.email}
              autoComplete="email"
            />

            <InputField
              label="Kata Sandi"
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              error={errors.password}
              autoComplete="current-password"
              onIconClick={() => setShowPassword((prev) => !prev)}
              icon={
                showPassword ? (
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
                )
              }
            />

            {errors.general && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold text-red-600">
                {errors.general}
              </div>
            )}

            <div className="flex justify-end mb-4">
              <Link
                to="/forgot"
                className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 transition-colors"
              >
                Lupa Kata Sandi?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoading || isRateLimited}
              className={`w-full bg-[#0d264f] text-white py-3 rounded-lg mb-4 font-medium transition-all duration-200 ${
                isLoading || isRateLimited
                  ? 'opacity-80 cursor-not-allowed'
                  : 'hover:bg-[#0d203f] hover:shadow-xl active:scale-[0.98]'
              }`}
            >
              {isLoading
                ? 'Memproses...'
                : isRateLimited
                  ? `Coba lagi dalam ${formatCooldown(rateLimitSeconds)}`
                  : 'Masuk'}
            </button>

            <div className="flex items-center my-3">
              <div className="flex-1 h-px bg-gray-300" />
              <span className="mx-3 text-[10px] text-gray-400 uppercase font-bold tracking-widest">
                Atau
              </span>
              <div className="flex-1 h-px bg-gray-300" />
            </div>

            <p className="text-center text-xs text-gray-600 mt-4">
              Belum punya akun?{' '}
              <Link to="/create" className="text-blue-600 font-bold hover:underline">
                Daftar Sekarang
              </Link>
            </p>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-center text-xs text-gray-500">
              masuk sebagai siswa, guru, atau admin.
              </p>
            </div>
          </form>
        </div>
      </div>

      <div className="hidden md:flex w-[40%] h-full bg-[#0d264f] items-center justify-center relative overflow-hidden shadow-2xl z-20">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/40 to-black/80 opacity-90" />

        <div className="relative z-10 flex flex-col items-center justify-center text-center p-8">
          <div className="animate-float">
            <img src={imageBg} alt="Ilustrasi" className="w-80 drop-shadow-2xl" />
          </div>

          <div className="-mt-8 px-6">
            <h3 className="text-white text-xl font-semibold mb-2 tracking-tight">
              Mulai Perjalananmu
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
              Akses materi pembelajaran terbaik dan kembangkan skill Anda bersama kami.
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-15px);
          }
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
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