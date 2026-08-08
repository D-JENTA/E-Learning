import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import MainLayoutStudent from "../../components/Student/MainLayout";
import Toast from "../../components/Toast";

const IconArrowLeft = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
);

const IconBook = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
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

const classes = [
  { id: 1, title: "Fruit Electricity", code: "X PPLG 1", teacher: "Pak Budi", email: "budi@sekolah.id" },
  { id: 2, title: "Sun Diameter", code: "X PPLG 1", teacher: "Ibu Siti", email: "siti@sekolah.id" },
  { id: 3, title: "Earth Depth", code: "X PPLG 1", teacher: "Pak Joko", email: "joko@sekolah.id" },
];

export default function LessonStudent() {
  const [openJoin, setOpenJoin] = useState(false);
  const [alertInfo, setAlertInfo] = useState({ show: false, message: '', type: 'success' });
  const navigate = useNavigate();

  const handleDeleteClass = (id) => {
    setAlertInfo({ show: true, message: "Kelas berhasil dihapus.", type: 'success' });
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
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Kelas Saya</h1>
          </div>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pl-11">
             <p className="text-slate-500 text-lg font-medium">
                Akses semua materi dan tugas pelajaranmu.
              </p>
              <button
                onClick={() => setOpenJoin(true)}
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-white bg-[#0d264f] hover:bg-blue-900 shadow-md hover:shadow-xl transition-all font-bold active:scale-95 w-full md:w-auto"
              >
                <IconPlus />
                Gabung Kelas
              </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.length === 0 ? (
            <div className="col-span-full text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-100">
              <div className="mx-auto w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 text-slate-300">
                 <IconBook />
              </div>
              <p className="text-slate-400 font-medium">Belum ada kelas yang diikuti.</p>
              <button onClick={() => setOpenJoin(true)} className="text-[#0d264f] font-bold text-sm mt-2 hover:underline">Gabung kelas sekarang</button>
            </div>
          ) : (
            classes.map((item) => (
              <StudentClassCard 
                key={item.id} 
                data={item} 
                onDelete={handleDeleteClass}
                onOpen={() => console.log(`Navigasi ke Lesson ID: ${item.id}`)} 
              />
            ))
          )}
        </div>
      </div>

      {openJoin && <JoinClassModal onClose={() => setOpenJoin(false)} onNotify={(msg) => setAlertInfo({ show: true, message: msg, type: 'success' })} />}
    </MainLayoutStudent>
  );
}

function StudentClassCard({ data, onDelete, onOpen }) {
  return (
    <div 
      onClick={onOpen}
      className="group relative bg-white rounded-3xl shadow-sm border border-slate-100 p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden"
    >
      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#0d264f] to-blue-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>

      <div className="relative z-10">
        <div className="flex justify-between items-start mb-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 group-hover:bg-[#0d264f] group-hover:text-white transition-all duration-300 flex items-center justify-center shadow-sm">
             <IconBook />
          </div>
          <button 
            onClick={(e) => { 
              e.stopPropagation(); 
              onDelete(data.id); 
            }} 
            className="p-2 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Hapus Kelas"
          >
            <IconTrash />
          </button>
        </div>

        <div className="mb-2">
          <h3 className="text-xl font-bold text-slate-800 group-hover:text-[#0d264f] transition-colors truncate">
            {data.title}
          </h3>
          <div className="flex items-center gap-2 mt-2">
             <span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">Kode:</span>
             <span className="text-xs font-mono font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-100">
               {data.code}
             </span>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <img 
               src={`https://ui-avatars.com/api/?name=${encodeURIComponent(data.teacher)}&background=random`} 
               alt="Teacher" 
               className="w-8 h-8 rounded-full border border-slate-200 shadow-sm object-cover"
             />
             <div className="hidden sm:block">
               <p className="text-xs font-bold text-slate-700 leading-tight">{data.teacher}</p>
               <p className="text-[10px] text-slate-400 leading-tight truncate max-w-[100px]">{data.email}</p>
             </div>
          </div>
          
          <div className="text-[#0d264f] font-bold text-sm opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0 flex items-center gap-1">
            Buka
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

function JoinClassModal({ onClose, onNotify }) {
  const [code, setCode] = useState("");
  const [isJoining, setIsJoining] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!code) return;

    try {
      setIsJoining(true);
      console.log("Joining with code:", code);

      setTimeout(() => {
        onNotify?.("Berhasil bergabung ke kelas.");
        onClose();
        setCode("");
      }, 1000);
    } catch (error) {
      console.error(error);
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300 animate-fade-in"
        onClick={onClose}
      ></div>
      
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md relative z-10 p-8 animate-scale-up">
        <h3 className="text-2xl font-extrabold text-slate-900 mb-2">Gabung Kelas</h3>
        <p className="text-slate-500 text-sm mb-8">Masukkan kode kelas unik yang kamu miliki di sini.</p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">
              Kode Kelas
            </label>
            <input 
              type="text" 
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="CONTOH: KLS-XYZ123"
              maxLength={20}
              disabled={isJoining}
              autoFocus
              className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-2 border-slate-100 outline-none focus:border-[#0d264f] focus:ring-4 focus:ring-[#0d264f]/10 transition-all font-mono font-bold text-center text-lg tracking-widest placeholder:text-slate-400 disabled:bg-slate-100 disabled:opacity-60"
            />
          </div>
          
          <div className="flex gap-3 pt-2">
            <button 
              type="button"
              onClick={onClose}
              disabled={isJoining}
              className="flex-1 py-3.5 rounded-2xl text-slate-600 font-bold hover:bg-slate-100 transition-colors disabled:opacity-50"
            >
              Batal
            </button>
            <button 
              type="submit"
              disabled={isJoining}
              className="flex-1 py-3.5 rounded-2xl bg-[#0d264f] text-white font-bold hover:bg-blue-900 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isJoining ? "Memproses..." : "Gabung Sekarang"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}