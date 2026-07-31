import { useState } from 'react';

const IconX = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
);

const IconCheck = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
  </svg>
);

const IconLoading = () => (
  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

export default function JoinClass({ onClose, onJoinSuccess }) {
  const [classCode, setClassCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleJoin = async (e) => {
    e.preventDefault();
    
    if (!classCode.trim()) {
      setError("Kode kelas wajib diisi");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/classes/join", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", 
        body: JSON.stringify({
          code: classCode.trim() 
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Gagal bergabung ke kelas");
      } 
      if (onJoinSuccess) {
        onJoinSuccess(); 
      }
      onClose();
      setClassCode(""); 

    } catch (err) {
      console.error("Join Error:", err);
      setError(err.message || "Terjadi kesalahan koneksi ke server.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  React.useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={handleBackdropClick}
      ></div>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md relative z-10 overflow-hidden animate-scale-up">
        <div className="bg-gradient-to-r from-[#0d264f] to-[#1a3a75] p-6 text-center">
          <h3 className="text-2xl font-extrabold text-white mb-1">Gabung Kelas</h3>
          <p className="text-blue-200 text-sm">Masukkan kode kelas dari gurumu.</p>
        </div>
        <div className="p-8">
          <form onSubmit={handleJoin} className="space-y-6">
            
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">
                Kode Kelas
              </label>
              <input 
                type="text" 
                value={classCode}
                onChange={(e) => {
                  setClassCode(e.target.value.toUpperCase()); // OTOMATIS KAPITAL
                  if (error) setError("");
                }}
                placeholder="Contoh: KLS-XYZ123"
                disabled={isLoading}
                maxLength={20}
                className={`w-full px-5 py-4 rounded-2xl bg-slate-50 border-2 outline-none font-mono font-bold text-center tracking-widest text-lg transition-all
                  ${error 
                    ? 'border-red-400 text-red-600 focus:bg-red-50' 
                    : 'border-slate-200 focus:border-[#0d264f] focus:ring-4 focus:ring-[#0d264f]/10 focus:bg-white'
                  } disabled:bg-slate-100 disabled:opacity-60`}
              />
              {error && (
                <div className="mt-2 flex items-center gap-2 text-xs font-bold text-red-600 bg-red-50 p-2 rounded-lg animate-pulse">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001-1h4a1 1 0 001-1V9a1 1 0 100-2zm1-5a1 1 0 100-2 0 1 1 0 012 0z" clipRule="evenodd" />
                  </svg>
                  {error}
                </div>
              )}
            </div>
          
            <div className="flex gap-3 pt-2">
              <button 
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="flex-1 py-3.5 rounded-2xl text-slate-600 font-bold hover:bg-slate-100 transition-all disabled:opacity-50"
              >
                Batal
              </button>
              <button 
                type="submit"
                disabled={isLoading || !classCode}
                className="flex-1 py-3.5 rounded-2xl bg-[#0d264f] text-white font-bold hover:bg-blue-900 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <IconLoading />
                    Memproses...
                  </>
                ) : (
                  <>
                    <IconCheck />
                    Gabung Sekarang
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}