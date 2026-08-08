import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

import imageBg from "../../assets/Loginimg.png";
import hide from "../../assets/hide.png";
import witness from "../../assets/witness.png";

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
        <span className="sr-only">Tutup</span>
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
      </button>
    </div>
  );
};

const InputField = ({ label, type, value, onChange, placeholder, name, autoComplete, icon, onIconClick, error, maxLength, hint }) => {
  return (
    <div className="mb-3 w-full relative group">
      <label className="block text-[11px] font-bold text-gray-500 mb-1 ml-1 uppercase tracking-wider">
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
          maxLength={maxLength}
          className={`w-full px-4 py-3 rounded-lg bg-white text-sm outline-none border-2 transition-all duration-200
            ${error ? 'border-red-400 focus:border-red-500' : 'border-transparent focus:border-blue-500 focus:shadow-md'}
            group-hover:border-gray-200
          `}
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
      <div className="flex justify-between items-center mt-1 min-h-[16px]">
        {error
          ? <p className="text-red-500 text-[10px] ml-1 font-medium">{error}</p>
          : hint
            ? <p className="text-gray-400 text-[10px] ml-1">{hint}</p>
            : <span />
        }
        {maxLength && (
          <p className={`text-[10px] mr-1 font-medium tabular-nums ${value.length >= maxLength ? 'text-red-400' : 'text-gray-300'}`}>
            {value.length}/{maxLength}
          </p>
        )}
      </div>
    </div>
  );
};

export default function Create() {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student', 
    nis: '',
    nip: '',
    classId: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingClasses, setIsLoadingClasses] = useState(false);
  const [errors, setErrors] = useState({});
  const [classes, setClasses] = useState([]);
  
  const [alertInfo, setAlertInfo] = useState({ show: false, message: '', type: 'success' });

  useEffect(() => {
    const fetchClasses = async () => {
      setIsLoadingClasses(true);
      try {
        const response = await fetch('/api/classes', {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          let errorMsg = `API Error ${response.status}`;
          try {
            const errorData = await response.json();
            errorMsg = errorData.message || errorMsg;
          } catch (e) {
            // If response is not JSON, use status code only
          }
          throw new Error(errorMsg);
        }

        const result = await response.json();
        setClasses(Array.isArray(result) ? result : []);
        console.log('Kelas berhasil dimuat:', result);
      } catch (error) {
        console.error('Error mengambil kelas:', error.message);
        setAlertInfo({ 
          show: true, 
          message: `Gagal memuat daftar kelas: ${error.message}`, 
          type: 'error' 
        });
        setClasses([]);
      } finally {
        setIsLoadingClasses(false);
      }
    };

    fetchClasses();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    let newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!formData.fullName) newErrors.fullName = 'Nama wajib diisi';
    
    if (!formData.email) {
      newErrors.email = 'Email wajib diisi';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Format email salah';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password wajib diisi';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Minimal 6 karakter';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Password tidak cocok';
    }

    if (formData.role === 'student' && !formData.classId) {
      newErrors.classId = 'Kelas wajib dipilih';
    }
    
    if (formData.role === 'student' && !formData.nis) newErrors.nis = 'NIS wajib diisi';
    if (formData.role === 'teacher' && !formData.nip) newErrors.nip = 'NIP wajib diisi';
    
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLoading) return;

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);

    const payload = {
      username: formData.fullName,
      email: formData.email,
      password: formData.password,
      role: formData.role,
      nis: formData.role === 'student' ? formData.nis : null,
      nip: formData.role === 'teacher' ? formData.nip : null,
      id_class: formData.classId ? Number(formData.classId) : null
    };

    try {
      const response = await fetch('/api/auth/register', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Gagal melakukan registrasi.");
      }

      const userId = result.user_id || result.id || (result.user && result.user.id);

      if (userId) {
        localStorage.setItem("pending_user_id", userId.toString());
        localStorage.setItem("pending_role", formData.role);
        localStorage.setItem("pending_email", formData.email);
        
        setAlertInfo({ show: true, message: "Registrasi Berhasil! Silakan cek email untuk kode OTP.", type: 'success' });
        
        setTimeout(() => {
            navigate('/verify', { state: { email: formData.email }, replace: true }); 
        }, 1500);
      } else {
        navigate('/login', { replace: true });
      }
      
    } catch (error) {
      setAlertInfo({ show: true, message: "Gagal Registrasi: " + error.message, type: 'error' });
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
        <div className="w-full max-w-[360px] overflow-y-auto max-h-screen py-8 px-2 no-scrollbar">
          <h2 className="text-3xl font-bold text-gray-800 mb-2 tracking-tight text-center">Buat Akun</h2>

          <form onSubmit={handleSubmit} className="flex flex-col">
            <InputField
              label="Nama Lengkap"
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="John Doe"
              error={errors.fullName}
              autoComplete="name"
            />

            <InputField
              label="Alamat Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="john@contoh.com"
              error={errors.email}
              autoComplete="email"
            />

            <div className="mb-3">
              <label className="block text-[11px] font-bold text-gray-500 mb-1 ml-1 uppercase tracking-wider">Peran</label>
              <select 
                name="role" 
                value={formData.role} 
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg bg-white text-sm outline-none border-2 border-transparent focus:border-blue-500 transition-all cursor-pointer"
              >
                <option value="student">Siswa (Student)</option>
                <option value="teacher">Guru (Teacher)</option>
              </select>
            </div>

            {formData.role === 'student' && (
              <div className="mb-3">
                <label className="block text-[11px] font-bold text-gray-500 mb-1 ml-1 uppercase tracking-wider">Pilih Kelas</label>
                <select
                  name="classId"
                  value={formData.classId}
                  onChange={handleChange}
                  disabled={isLoadingClasses}
                  required
                  className={`w-full px-4 py-3 rounded-lg bg-white text-sm outline-none border-2 transition-all cursor-pointer disabled:cursor-not-allowed disabled:bg-gray-100 ${errors.classId ? 'border-red-400 focus:border-red-500' : 'border-transparent focus:border-blue-500'}`}
                >
                  <option value="">{isLoadingClasses ? 'Memuat kelas...' : 'Pilih kelas'}</option>
                  {classes.map((kelas) => (
                    <option key={kelas.id_class} value={kelas.id_class}>
                      {kelas.class_name}
                    </option>
                  ))}
                </select>
                {errors.classId && <p className="text-red-500 text-[10px] ml-1 mt-1 font-medium">{errors.classId}</p>}
              </div>
            )}

            {formData.role === 'student' ? (
              <InputField
                key="nis"
                label="NIS (Nomor Induk Siswa)"
                type="text"
                name="nis"
                value={formData.nis}
                onChange={handleChange}
                placeholder="Maks. 10 angka"
                error={errors.nis}
                maxLength={10}
                hint="Boleh diisi 1–10 karakter"
              />
            ) : (
              <InputField
                key="nip"
                label="NIP (Nomor Induk Pegawai)"
                type="text"
                name="nip"
                value={formData.nip}
                onChange={handleChange}
                placeholder="Maks. 18 angka"
                error={errors.nip}
                maxLength={18}
                hint="Boleh diisi 1–18 karakter"
              />
            )}

            <InputField
              label="Kata Sandi"
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              error={errors.password}
              autoComplete="new-password"
              icon={<img src={showPassword ? witness : hide} alt="toggle" className="w-5 h-5" />}
              onIconClick={() => setShowPassword(!showPassword)}
            />

            <InputField
              label="Konfirmasi Kata Sandi"
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="••••••••"
              error={errors.confirmPassword}
              autoComplete="new-password"
            />

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full bg-[#0d264f] text-white py-3 rounded-lg mb-5 font-medium transition-all duration-200
                ${isLoading ? 'opacity-80 cursor-not-allowed' : 'hover:bg-[#0d203f] hover:shadow-xl active:scale-[0.98]'}
              `}
            >
              {isLoading ? 'Membuat Akun...' : 'Daftar'}
            </button>

            <p className="text-center text-xs text-gray-600 mt-auto">
              Sudah punya akun?{" "}
              <Link to="/login" className="text-blue-600 font-bold hover:underline">
                Masuk
              </Link>
            </p>
          </form>
        </div>
      </div>

      <div className="hidden md:flex w-[40%] h-full bg-[#0051ff] items-center justify-center relative overflow-hidden shadow-2xl z-20">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gray-800 to-black opacity-80"></div>
        <div className="relative z-10 flex flex-col items-center justify-center text-center">
          <div className="animate-float">
            <img src={imageBg} alt="Ilustrasi" className="w-80" />
          </div>
          <div className="-mt-20 px-6 text-white">
            <h3 className="text-xl font-semibold mb-2">Mulai Perjalananmu</h3>
            <p className="text-gray-400 text-sm">Bergabunglah dan mulai petualangan belajarmu sekarang.</p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-10px); } }
        .animate-float { animation: float 3s ease-in-out infinite; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
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