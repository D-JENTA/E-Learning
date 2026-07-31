import { useState, useEffect } from 'react';
import { Link, useNavigate } from "react-router-dom"; 
import imageBg from "../../assets/Loginimg.png";
import lockIcon from "../../assets/Salinan lock.png";

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
// ---------------------------------------------------

const InputField = ({ label, type, value, onChange, placeholder, error, name }) => (
  <div className="mb-4 w-full relative text-left">
    <label className="block text-[11px] font-bold text-gray-500 mb-1 ml-1 uppercase tracking-wider">{label}</label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`w-full px-4 py-3 rounded-lg bg-white text-sm outline-none border-2 transition-all ${error ? 'border-red-400' : 'border-transparent focus:border-blue-500'}`}
    />
    {error && <p className="text-red-500 text-[10px] mt-1 ml-1 font-medium">{error}</p>}
  </div>
);

export default function Forgot() {
  const [formData, setFormData] = useState({ email: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [alertInfo, setAlertInfo] = useState({ show: false, message: '', type: 'success' }); // State Alert
  
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email) return setErrors({ email: "Email wajib diisi" });

    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/validate-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email }),
      });

      const result = await response.json();

      if (response.ok) {
        const userId = result.user_id || result.id_user || result.id;

        if (userId) {
          localStorage.setItem("pending_user_id", userId);
          localStorage.setItem("pending_email", formData.email);
          localStorage.setItem("auth_mode", "reset_password");
          
          setAlertInfo({ show: true, message: "OTP telah dikirim ke email Anda!", type: 'success' });
          
          setTimeout(() => {
            navigate("/verify", { state: { email: formData.email } });
          }, 1500);
        } else {
          setAlertInfo({ show: true, message: "Terjadi kesalahan sistem. ID pengguna tidak ditemukan.", type: 'error' });
        }
      } else {
        setAlertInfo({ show: true, message: result.message || "Email tidak ditemukan.", type: 'error' });
      }
    } catch (error) {
      setAlertInfo({ show: true, message: "Kesalahan Server. Periksa koneksi Anda.", type: 'error' });
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

      <div className="w-full md:w-[60%] h-full flex items-center justify-center p-4 z-10 text-center">
        <div className="w-full max-w-[360px]">
          <div className="flex justify-center mb-6">
             <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm border">
                <img src={lockIcon} alt="lock" className="w-10 h-10 object-contain" />
             </div>
          </div>
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-2 uppercase tracking-tight">Lupa Password?</h2>
            <p className="text-xs text-gray-500">Masukkan email akun Anda untuk menerima kode OTP.</p>
          </div>
          <form onSubmit={handleSubmit} className="flex flex-col">
            <InputField label="Alamat Email" type="email" name="email" value={formData.email} onChange={(e) => setFormData({email: e.target.value})} placeholder="nama@sekolah.com" error={errors.email} />
            <button type="submit" disabled={isLoading} className="w-full bg-[#0d264f] text-white py-3 rounded-lg font-bold hover:shadow-xl transition-all uppercase text-xs tracking-widest disabled:opacity-50">
              {isLoading ? 'Mengirim...' : 'Kirim OTP'}
            </button>
            <p className="text-center text-xs text-gray-600 mt-8 uppercase tracking-widest font-bold">
              Batal? <Link to="/login" className="text-blue-600 hover:underline">Masuk</Link>
            </p>
          </form>
        </div>
      </div>
      <div className="hidden md:flex w-[40%] h-full bg-[#0d264f] items-center justify-center relative z-20 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-900/20 to-black/60 opacity-80"></div>
        <img src={imageBg} alt="Ilustrasi" className="w-80 animate-float z-10" />
      </div>
      <style>{` 
        @keyframes float { 
          0%, 100% { transform: translateY(0px); } 
          50% { transform: translateY(-20px); } 
        } 
        .animate-float { animation: float 5s ease-in-out infinite; }
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(100%); }
          to   { opacity: 1; transform: translateX(0); }
        }
        .animate-slideIn { animation: slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>
    </div>
  );
}