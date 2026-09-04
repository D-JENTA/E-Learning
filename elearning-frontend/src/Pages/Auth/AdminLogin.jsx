import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import imageBg from '../../assets/Loginimg.png';

const RATE_LIMIT_STORAGE_KEY  = 'admin_login_rate_limit_until';
const FAILED_ATTEMPTS_KEY     = 'admin_login_failed_attempts';
const MAX_FAILED_ATTEMPTS     = 5;
const DEFAULT_RATE_LIMIT_SECONDS = 60;

const formatCooldown = (seconds) => {
  const safeSeconds = Math.max(0, seconds);
  const minutes = Math.floor(safeSeconds / 60);
  const remainingSeconds = safeSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
};

const getRetryAfterSeconds = (response, result) => {
  const retryAfterHeader  = response.headers.get('Retry-After');
  const rateLimitResetHeader = response.headers.get('RateLimit-Reset');

  if (retryAfterHeader) {
    const retryAfterNumber = Number(retryAfterHeader);
    if (!Number.isNaN(retryAfterNumber) && retryAfterNumber > 0)
      return Math.ceil(retryAfterNumber);
    const retryAfterDate = Date.parse(retryAfterHeader);
    if (!Number.isNaN(retryAfterDate))
      return Math.max(1, Math.ceil((retryAfterDate - Date.now()) / 1000));
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

const CustomAlert = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => { onClose(); }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  if (!message) return null;

  const accentColor = type === 'error' ? 'border-l-red-500' : 'border-l-blue-500';
  const iconBg = type === 'error' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600';
  const Icon = type === 'error'
    ? <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
    : <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>;

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
        <span className="sr-only">Close</span>
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
        </svg>
      </button>
    </div>
  );
};

const InputField = ({ label, type, value, onChange, placeholder, isPassword, showPassword, onIconClick, error, name, autoComplete }) => (
  <div className="mb-5 w-full relative group">
    <label className="block text-[10px] font-black text-slate-400 mb-1.5 ml-1 uppercase tracking-[0.15em] text-left">
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
        className={`w-full px-5 py-3.5 rounded-xl bg-white text-sm font-semibold outline-none border-2 transition-all duration-300
          ${error
            ? 'border-red-400 focus:border-red-500 shadow-sm shadow-red-100'
            : 'border-slate-100 focus:border-indigo-500 focus:bg-white focus:shadow-xl focus:shadow-indigo-100/50'}
          group-hover:border-slate-200 text-slate-700 placeholder:text-slate-300`}
      />
      {isPassword && (
        <button
          type="button"
          onClick={onIconClick}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors focus:outline-none p-1"
        >
          {showPassword ? (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.644C3.399 8.049 7.21 5 12 5c4.79 0 8.601 3.049 9.964 6.678a1.012 1.012 0 010 .644C20.601 15.951 16.79 19 12 19c-4.79 0-8.601-3.049-9.964-6.678z"/>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"/>
            </svg>
          )}
        </button>
      )}
    </div>
    {error && (
      <p className="text-red-500 text-[10px] mt-1.5 ml-2 font-bold uppercase tracking-wider text-left">{error}</p>
    )}
  </div>
);

export default function AdminLogin() {
  const [formData, setFormData]       = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading]     = useState(false);
  const [errors, setErrors]           = useState({});
  const [rateLimitSeconds, setRateLimitSeconds] = useState(0);
  const [failedAttempts, setFailedAttempts]     = useState(0);
  const [alertInfo, setAlertInfo]     = useState({ show: false, message: '', type: 'success' });

  const navigate      = useNavigate();
  const isRateLimited = rateLimitSeconds > 0;

  useEffect(() => {
    const updateCooldown = () => {
      const storedUntil = Number(localStorage.getItem(RATE_LIMIT_STORAGE_KEY) || 0);
      const remaining   = Math.ceil((storedUntil - Date.now()) / 1000);
      if (remaining > 0) {
        setRateLimitSeconds(remaining);
      } else {
        setRateLimitSeconds(0);
        localStorage.removeItem(RATE_LIMIT_STORAGE_KEY);
      }
    };

    const storedAttempts = Number(localStorage.getItem(FAILED_ATTEMPTS_KEY) || 0);
    setFailedAttempts(storedAttempts);

    updateCooldown();
    const interval = setInterval(updateCooldown, 1000);
    return () => clearInterval(interval);
  }, []);

  const startRateLimitCooldown = (seconds = DEFAULT_RATE_LIMIT_SECONDS) => {
    const cooldownSeconds = Number(seconds) > 0 ? Number(seconds) : DEFAULT_RATE_LIMIT_SECONDS;
    const until = Date.now() + cooldownSeconds * 1000;
    localStorage.setItem(RATE_LIMIT_STORAGE_KEY, String(until));
    localStorage.removeItem(FAILED_ATTEMPTS_KEY);
    setFailedAttempts(0);
    setRateLimitSeconds(cooldownSeconds);
  };

  const incrementFailedAttempts = () => {
    const newAttempts = failedAttempts + 1;
    setFailedAttempts(newAttempts);

    if (newAttempts >= MAX_FAILED_ATTEMPTS) {
      startRateLimitCooldown(DEFAULT_RATE_LIMIT_SECONDS);
      return true; 
    }

    localStorage.setItem(FAILED_ATTEMPTS_KEY, String(newAttempts));
    return false;
  };

  const clearLoginState = () => {
    localStorage.removeItem(RATE_LIMIT_STORAGE_KEY);
    localStorage.removeItem(FAILED_ATTEMPTS_KEY);
    setRateLimitSeconds(0);
    setFailedAttempts(0);
  };

  const showAlert = (message, type = 'success') =>
    setAlertInfo({ show: true, message, type });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: '', general: '' });
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

    setIsLoading(true);
    setErrors({});

    try {
      const response = await fetch('/api/auth/loginAdmin-onlyAdmin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

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
        const justTriggeredCooldown = incrementFailedAttempts();

        let errorMessage = 'Email atau Password salah';

        if (justTriggeredCooldown) {
          errorMessage = `Terlalu banyak percobaan login. Coba lagi dalam ${formatCooldown(DEFAULT_RATE_LIMIT_SECONDS)}.`;
        } else {
          const remaining = MAX_FAILED_ATTEMPTS - (failedAttempts + 1);
          if (remaining > 0) {
            errorMessage += ` (${remaining} percobaan tersisa)`;
          }
        }

        throw new Error(errorMessage);
      }

      clearLoginState();

      // Hapus token sesi non-admin yang mungkin tersisa — interceptor global
      // (setupFetchAuth.js) memprioritaskan key "token" sebelum "admin_token",
      // jadi token basi di key itu akan terkirim dan ditolak backend (401).
      localStorage.removeItem('token');
      if (result.token) localStorage.setItem('admin_token', result.token);
      localStorage.setItem('pending_user_id', result.user.id_user || result.user.id);
      localStorage.setItem('pending_role', result.user.role);
      localStorage.setItem('pending_email', formData.email);

      showAlert('Login Berhasil! Mengarahkan...', 'success');

      setTimeout(() => {
        navigate('/verify', { state: { email: formData.email } });
      }, 1000);

    } catch (error) {
      console.error('Login error:', error);
      const message = error.message || 'Kesalahan koneksi ke server.';
      setErrors({ general: message });
      showAlert(message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const attemptsRemaining = MAX_FAILED_ATTEMPTS - failedAttempts;

  return (
    <div className="h-screen w-full flex overflow-hidden bg-[#F8FAFC] font-sans">
      {alertInfo.show && (
        <CustomAlert
          message={alertInfo.message}
          type={alertInfo.type}
          onClose={() => setAlertInfo({ ...alertInfo, show: false })}
        />
      )}

      <div className="w-full md:w-[60%] h-full flex items-center justify-center p-6 relative z-10">
        <div className="w-full max-w-[380px]">
          <div className="mb-10 text-center">
            <span className="inline-block bg-indigo-600 text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-[0.25em] shadow-lg shadow-indigo-200">
              Terminal Otoritas
            </span>
            <h2 className="text-4xl font-black text-slate-900 mt-5 tracking-tighter">LOGIN ADMIN</h2>
            <div className="flex items-center justify-center gap-2 mt-2">
              <span className="h-[1px] w-5 bg-slate-200" />
              <p className="text-slate-400 text-[10px] uppercase tracking-[0.3em] font-bold">Akses Internal</p>
              <span className="h-[1px] w-5 bg-slate-200" />
            </div>
          </div>
          <form onSubmit={handleLogin} className="space-y-2">
            <InputField
              label="Identifikasi Admin"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="admin@sekolah.id"
              error={errors.email}
              autoComplete="email"
            />
            <InputField
              label="Kata Sandi Aman"
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              error={errors.password}
              autoComplete="current-password"
              isPassword
              showPassword={showPassword}
              onIconClick={() => setShowPassword((prev) => !prev)}
            />

            {errors.general && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold text-red-600">
                {errors.general}
              </div>
            )}

            {failedAttempts > 0 && !isRateLimited && (
              <div className="flex items-center gap-2 pt-1">
                {Array.from({ length: MAX_FAILED_ATTEMPTS }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                      i < failedAttempts ? 'bg-red-400' : 'bg-slate-200'
                    }`}
                  />
                ))}
                <span className="text-[10px] font-bold text-red-500 whitespace-nowrap">
                  {attemptsRemaining}x lagi
                </span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || isRateLimited}
              className={`w-full bg-[#0d264f] text-white py-4 rounded-xl mt-6 font-black text-[11px] uppercase tracking-[0.2em] transition-all duration-300 shadow-xl shadow-slate-200 active:scale-95 ${
                isLoading || isRateLimited
                  ? 'opacity-80 cursor-not-allowed'
                  : 'hover:bg-black hover:-translate-y-1'
              }`}
            >
              {isLoading
                ? 'Memproses...'
                : isRateLimited
                  ? `Coba lagi dalam ${formatCooldown(rateLimitSeconds)}`
                  : 'Otorisasi Akses'}
            </button>

            <button
              type="button"
              onClick={() => navigate('/login')}
              className="mt-10 w-full text-[10px] text-slate-400 hover:text-indigo-600 font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 transition-all duration-300 group"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
              </svg>
              Kembali ke Login User
            </button>
          </form>
        </div>
      </div>

      <div className="hidden md:flex w-[40%] h-full bg-[#0d264f] items-center justify-center relative overflow-hidden z-20 shadow-[-20px_0_50px_rgba(0,0,0,0.1)]">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/40 to-[#0d264f] opacity-90" />
        <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-[-5%] left-[-5%] w-48 h-48 bg-sky-500/10 rounded-full blur-3xl" />

        <div className="relative z-10 flex flex-col items-center text-center p-8">
          <div className="relative">
            <div className="absolute inset-0 bg-indigo-500/20 blur-[60px] rounded-full animate-pulse" />
            <img src={imageBg} alt="Admin" className="w-80 animate-float drop-shadow-[0_35px_35px_rgba(0,0,0,0.4)] relative z-10" />
          </div>
          <div className="mt-10">
            <h3 className="text-white text-2xl font-black tracking-tight uppercase">Kontrol Sistem</h3>
            <div className="h-1 w-12 bg-indigo-500 mx-auto mt-3 rounded-full" />
            <p className="text-indigo-200/60 text-[10px] mt-4 max-w-[240px] leading-relaxed uppercase tracking-[0.25em] font-bold">
              Akses tingkat tinggi untuk manajemen dan keamanan data pendidikan.
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50%       { transform: translateY(-20px) rotate(2deg); }
        }
        .animate-float { animation: float 6s ease-in-out infinite; }
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(100%); }
          to   { opacity: 1; transform: translateX(0); }
        }
        .animate-slideIn { animation: slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>
    </div>
  );
}