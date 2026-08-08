import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import MainLayoutStudent from "../../components/Student/MainLayout";
import Toast from "../../components/Toast";

const IconArrowLeft = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
);

const IconBook = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
  </svg>
);

const IconClipboard = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
  </svg>
);

const IconTrash = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
  </svg>
);

const IconPlus = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
  </svg>
);

const classInfo = {
  name: "IPAS",
  code: "X PPLG 1",
  teacher: "Ibu Siti Aminah",
  lessons: 11,
  tasks: 17
};

export default function StudentClass() {
  const navigate = useNavigate();
  const [openJoin, setOpenJoin] = useState(false);
  const [alertInfo, setAlertInfo] = useState({ show: false, message: '', type: 'success' });

  const handleDeleteClass = () => {
    setAlertInfo({ show: true, message: "Kelas berhasil dihapus.", type: 'success' });
    navigate("/student/class");
  };

  const handleJoinAction = () => {
    setOpenJoin(true);
  };

  return (
    <MainLayoutStudent>
      {alertInfo.show && (
        <Toast message={alertInfo.message} type={alertInfo.type} onClose={() => setAlertInfo({ ...alertInfo, show: false })} />
      )}
      <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 animate-fade-in-up">
        
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
             <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-full bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-[#0d264f] hover:border-slate-300 transition-all shadow-sm"
              title="Kembali"
            >
              <IconArrowLeft />
            </button>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">{classInfo.name}</h1>
          </div>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pl-11">
            <div className="flex items-center gap-4">
               <div className="p-3 rounded-xl bg-blue-50 text-blue-600">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
               </div>
               <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Guru Pengampu</span>
                  <p className="text-base font-bold text-slate-700">{classInfo.teacher}</p>
               </div>
            </div>

            <div className="flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-full border border-slate-200">
               <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Kode Kelas</span>
               <span className="font-mono font-bold text-slate-800 text-lg">{classInfo.code}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 flex items-center justify-between hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Pelajaran</p>
              <h3 className="text-4xl font-extrabold text-slate-800">{classInfo.lessons}</h3>
            </div>
            <div className="p-4 rounded-2xl bg-blue-50 text-blue-600 shadow-sm">
              <IconBook />
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 flex items-center justify-between hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Tugas</p>
              <h3 className="text-4xl font-extrabold text-slate-800">{classInfo.tasks}</h3>
            </div>
            <div className="p-4 rounded-2xl bg-orange-50 text-orange-600 shadow-sm">
              <IconClipboard />
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-end">
          <button 
            onClick={handleDeleteClass}
            className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-red-600 bg-red-50 hover:bg-red-100 font-bold transition-all w-full sm:w-auto border border-transparent hover:border-red-200"
          >
            <IconTrash /> Hapus Kelas
          </button>

          <button 
            onClick={handleJoinAction}
            className="flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl text-white bg-[#0d264f] hover:bg-blue-900 font-bold transition-all shadow-md hover:shadow-xl w-full sm:w-auto"
          >
            <IconPlus /> Gabung Kelas
          </button>
        </div>

        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-slate-800 pl-2 border-l-4 border-blue-500">
            Materi & Pengumuman
          </h2>
          
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-12 text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414-2.414a1 1 0 01-.707-.293h-3.172a1 1 0 01-.707-.293l-2.414 2.414a1 1 0 01-.707.293H6" />
                </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Belum ada materi</h3>
            <p className="text-slate-500">Guru belum mengunggah materi atau tugas untuk kelas ini.</p>
          </div>
        </div>

      </div>

      {openJoin && <JoinClassModal onClose={() => setOpenJoin(false)} onNotify={(msg, type = 'success') => setAlertInfo({ show: true, message: msg, type })} />}
    </MainLayoutStudent>
  );
}

function JoinClassModal({ onClose, onNotify }) {
  const [code, setCode] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!code) {
      onNotify?.("Silakan masukkan kode kelas.", 'error');
      return;
    }
    onNotify?.(`Berhasil bergabung dengan kode ${code}.`);
    onClose();
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  React.useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm" onClick={handleBackdropClick}></div>
      
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md relative z-10 p-8 overflow-hidden">
        <h3 className="text-2xl font-extrabold text-slate-900 mb-2">Gabung Kelas</h3>
        <p className="text-slate-500 text-sm mb-6">Masukkan kode kelas untuk bergabung.</p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">
              Kode Kelas
            </label>
            <input 
              type="text" 
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="CONTOH: KLS-XYZ"
              className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-2 border-slate-100 outline-none focus:border-[#0d264f] focus:ring-4 focus:ring-[#0d264f]/10 transition-all font-mono font-bold text-center tracking-widest text-lg placeholder:text-slate-400"
            />
          </div>
          
          <div className="flex gap-3 pt-2">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 py-3.5 rounded-2xl text-slate-600 font-bold hover:bg-slate-100 transition-all"
            >
              Batal
            </button>
            <button 
              type="submit"
              className="flex-1 py-3.5 rounded-2xl bg-[#0d264f] text-white font-bold hover:bg-blue-900 transition-all shadow-md hover:shadow-lg"
            >
              Gabung Sekarang
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}