import React, { useState, useEffect } from "react";
import MainLayoutStudent from "../../components/Student/MainLayout";
import Toast from "../../components/Toast";
import Clock from "../../components/Clock";
import { Link } from "react-router-dom";

const IconBook = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
  </svg>
);

const IconArrowRight = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
  </svg>
);

export default function StudentDashboard() {
  const [openJoin, setOpenJoin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [mapelCount, setMapelCount] = useState(0);
  const [className, setClassName] = useState(null);
  const [alertInfo, setAlertInfo] = useState({ show: false, message: '', type: 'success' });

  useEffect(() => {
    fetch('/api/students/me/classes', { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : null))
      .then((res) => {
        const list = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
        setMapelCount(list.length);
        setClassName(list[0]?.class_name || null);
      })
      .catch(() => {});
  }, []);

  const handleJoinClass = async (code) => {
    if (!code.trim()) {
      setAlertInfo({ show: true, message: "Silakan masukkan kode kelas yang valid.", type: 'error' });
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch('/api/classes/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ code: code })
      });

      const result = await response.json();

      if (response.ok) {
        setOpenJoin(false);
        setAlertInfo({ show: true, message: "Berhasil bergabung ke kelas.", type: 'success' });
      } else {
        setAlertInfo({ show: true, message: result.message || "Gagal bergabung ke kelas.", type: 'error' });
      }
    } catch (error) {
      console.error("Join error:", error);
      setAlertInfo({ show: true, message: "Terjadi kesalahan pada server.", type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MainLayoutStudent>
      {alertInfo.show && (
        <Toast message={alertInfo.message} type={alertInfo.type} onClose={() => setAlertInfo({ ...alertInfo, show: false })} />
      )}
      <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 animate-fade-in-up">

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
              Dashboard Siswa
            </h1>
            <p className="text-slate-500 text-lg md:text-xl font-medium">
              Selamat datang kembali! Siap untuk belajar hari ini?
            </p>
          </div>
          <Clock />
        </div>

        {/* Ringkasan mapel */}
        <div className="bg-[#0d264f] text-white rounded-3xl shadow-sm p-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            {/* Teks utama dibesarkan, teks "1 Mata Pelajaran" di bawahnya dihilangkan */}
            <h2 className="text-1xl md:text-3xl font-extrabold tracking-tight">
              {className || "Mata Pelajaran Yang Diikuti :"}
            </h2>
          </div>

          {/* Badge jumlah di ujung kanan tetap ada */}
          <div className="flex items-center gap-3 bg-white/10 rounded-2xl px-5 py-3 self-start sm:self-auto">
            <span className="text-3xl font-extrabold">{mapelCount}</span>
            <span className="text-blue-100 text-xs font-semibold leading-tight">
              Mata<br />Pelajaran
            </span>
          </div>
        </div>

        <Link to="/student/class" className="group relative block bg-white rounded-3xl shadow-sm border border-slate-100 p-8 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden">
          <div className="absolute inset-0 bg-blue-50/0 group-hover:bg-blue-50/50 transition-colors duration-500 -z-10"></div>

          <div className="flex justify-between items-start">
            <div>
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-4 group-hover:bg-[#0d264f] group-hover:text-white transition-colors duration-300">
                <IconBook />
              </div>
              <h3 className="text-2xl font-bold text-slate-800 group-hover:text-[#0d264f] transition-colors">
                Mata Pelajaran Saya
              </h3>
              <p className="text-slate-500 mt-2 font-medium leading-relaxed">
                Lihat materi, tugas, dan jadwal pelajaranmu.
              </p>
            </div>
            <div className="p-3 rounded-full bg-slate-50 text-slate-400 group-hover:bg-[#0d264f] group-hover:text-white transition-all duration-300">
              <IconArrowRight />
            </div>
          </div>
        </Link>
      </div>

      {openJoin && (
        <JoinClassModal
          onClose={() => setOpenJoin(false)}
          onJoin={handleJoinClass}
          isSubmitting={isLoading}
        />
      )}
    </MainLayoutStudent>
  );
}

function JoinClassModal({ onClose, onJoin, isSubmitting }) {
  const [code, setCode] = useState("");

  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300 animate-fade-in"
        onClick={handleBackdropClick}
      ></div>

      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md relative z-10 p-8 animate-scale-up">
        <h3 className="text-2xl font-extrabold text-slate-900 mb-2">Gabung Kelas</h3>
        <p className="text-slate-500 mb-8 text-sm">Masukkan kode kelas yang kamu miliki di sini.</p>

        <div className="space-y-6">
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
              disabled={isSubmitting}
              className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-2 border-slate-100 outline-none focus:border-[#0d264f] focus:ring-4 focus:ring-[#0d264f]/10 transition-all font-mono font-bold text-center text-lg tracking-widest placeholder:text-slate-400 disabled:bg-slate-100 disabled:opacity-60"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 py-3.5 rounded-2xl text-slate-600 font-bold hover:bg-slate-100 transition-colors disabled:opacity-50"
            >
              Batal
            </button>
            <button
              onClick={() => onJoin(code)}
              disabled={isSubmitting}
              className="flex-1 py-3.5 rounded-2xl bg-[#0d264f] text-white font-bold hover:bg-blue-900 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Memproses...
                </>
              ) : "Gabung Sekarang"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}