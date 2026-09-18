import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import imageBg from '../../assets/Loginimg.png';
import {
  formatCooldown,
  getRetryAfterSeconds,
  rateLimitMessage,
  useRateLimit,
} from '../../hooks/useRateLimit';
import { toIndonesianMessage } from '../../utils/authMessages';

const RATE_LIMIT_STORAGE_KEY = 'login_rate_limit_until';

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
      <label className="block text-[11px] font-bold text-gray-600 mb-1 ml-1 uppercase tracking-wider text-left">
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

  const [alertInfo, setAlertInfo] = useState({ show: false, message: '', type: 'success' });

  const navigate = useNavigate();
  const {
    rateLimitSeconds,
    isRateLimited,
    startCooldown: startRateLimitCooldown,
    clearCooldown: clearRateLimit,
  } = useRateLimit(RATE_LIMIT_STORAGE_KEY);

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
      const message = rateLimitMessage(rateLimitSeconds);
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

      const contentType = response.headers.get('content-type') || '';
      const isJson = contentType.includes('application/json');

      let result = null;
      let responseText = '';

      try {
        if (isJson) result = await response.json();
        else responseText = await response.text();
      } catch {
        responseText = await response.text().catch(() => '');
      }

      if (response.status === 429) {
        const retryAfter = getRetryAfterSeconds(response, result);
        startRateLimitCooldown(retryAfter);
        throw new Error(rateLimitMessage(retryAfter));
      }

      if (!response.ok) {
        const serverMessage = result?.message || responseText || response.statusText;

        if (response.status === 403 && /verified/i.test(serverMessage)) {
          const pendingUserId = result?.user?.id_user || result?.user_id;
          const pendingEmail = result?.email || formData.email;
          const pendingRole = normalizeRole(result?.role || 'student');

          localStorage.setItem('pending_email', pendingEmail);
          localStorage.setItem('pending_role', pendingRole);
          if (pendingUserId) localStorage.setItem('pending_user_id', pendingUserId.toString());
          localStorage.setItem('auth_mode', 'login');

          showAlert('Akun belum terverifikasi. Silakan masukkan kode OTP.', 'success');
          setTimeout(() => {
            navigate('/verify', {
              state: { email: pendingEmail },
              replace: true,
            });
          }, 1200);
          return;
        }

        console.error('Login request failed', {
          status: response.status,
          contentType,
          serverMessage,
          responseText,
          result,
        });
        const errorMessage = toIndonesianMessage(
          serverMessage,
          'Server bermasalah atau URL salah'
        );
        throw new Error(errorMessage);
      }

      clearRateLimit();

      const token =
        result.token || result.accessToken || result.access_token || result.data?.token;
      localStorage.removeItem("admin_token");
      if (token) localStorage.setItem("token", token);

      const userId = result.user?.id_user || result.user_id || result.id;
      const rawUserRole = result.user?.role || result.role || (result.requiresTwoFactor ? 'admin' : undefined);
      const userRole = normalizeRole(rawUserRole);
      const requiresOtp = Boolean(result.requiresOTP || result.requiresTwoFactor || false);
      const dest = ROLE_DEST[userRole];

      if (userId && requiresOtp) {
        localStorage.setItem('pending_user_id', userId.toString());
        localStorage.setItem('pending_role', userRole || 'admin');
        localStorage.setItem('pending_email', formData.email);
        localStorage.setItem('auth_mode', 'login');

        showAlert('Login Berhasil! Masukkan kode OTP yang dikirim ke email.', 'success');

        setTimeout(() => {
          navigate('/verify', {
            state: { email: formData.email },
            replace: true,
          });
        }, 1500);

        return;
      }

      if (!dest) {
        throw new Error('Role user tidak dikenali');
      }

      window.location.replace(dest);
    } catch (error) {
      console.error('Login Error:', error);
      const message = error.message || 'Terjadi kesalahan saat login';
      setErrors({ general: message });
      showAlert(message, 'error'); 
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen w-full flex overflow-hidden bg-[#e8ecfa] font-sans">
      {alertInfo.show && (
        <CustomAlert 
          message={alertInfo.message} 
          type={alertInfo.type} 
          onClose={() => setAlertInfo({ ...alertInfo, show: false })} 
        />
      )}

      <div className="w-full md:w-[60%] h-full flex items-center justify-center p-4 relative z-10">
        <main className="w-full max-w-[360px]">
          <h1 className="text-2xl font-bold text-gray-800 mb-6 tracking-tight text-center">
            Selamat Datang
          </h1>

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
              <span className="mx-3 text-[10px] text-gray-600 uppercase font-bold tracking-widest">
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
          </form>
        </main>
      </div>

      <div className="hidden md:flex w-[40%] h-full bg-[#0d264f] items-center justify-center relative overflow-hidden shadow-2xl z-20">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/40 to-black/80 opacity-90" />

        <div className="relative z-10 flex flex-col items-center justify-center text-center p-8">
          <div className="animate-float">
            <img src={imageBg} alt="Ilustrasi" width={623} height={1024} loading="lazy" decoding="async" className="w-80 drop-shadow-2xl" />
          </div>

          <div className="-mt-8 px-6">
            <h2 className="text-white text-xl font-semibold mb-2 tracking-tight">
              Mulai Perjalananmu
            </h2>
            {/* text-gray-400 di sini dibiarkan: latarnya navy gelap (#0d264f),
                jadi kontrasnya sudah lolos ambang 4.5:1. */}
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