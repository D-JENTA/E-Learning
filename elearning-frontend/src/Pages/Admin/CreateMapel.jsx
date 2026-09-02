import React, { useState, useEffect, useRef, useCallback } from "react";
import MainLayout from "../../components/Admin/MainLayout";

const CustomAlert = ({ message, type, onClose }) => {
  React.useEffect(() => {
    const timer = setTimeout(() => onClose(), 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  if (!message) return null;

  const isError = type === 'error';
  const iconBg = isError ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600';

  return (
    <div className="fixed top-5 right-5 z-[100] flex items-center w-full max-w-sm p-4 space-x-3 text-slate-600 bg-white rounded-2xl shadow-xl border border-slate-100 transition-all duration-300">
      <div className={`inline-flex items-center justify-center flex-shrink-0 w-9 h-9 rounded-xl font-bold ${iconBg}`}>
        {isError ? '!' : '✓'}
      </div>
      <div className="flex-1 text-sm font-semibold text-slate-800">{message}</div>
      <button onClick={onClose} className="text-slate-400 hover:text-slate-700 font-bold text-lg px-2">×</button>
    </div>
  );
};

// Disesuaikan dengan backend (Senin - Jumat)
const DAYS = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'];
const JP_OPTIONS = Array.from({ length: 10 }, (_, i) => String(i + 1));

export default function CreateMapelAdmin() {
  const [formData, setFormData] = useState({
    mapel_name: '',
    id_teacher: '',
    id_class: '',
    day: DAYS[0],
    jp: [],
  });

  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingOptions, setIsLoadingOptions] = useState(true);
  const [alertInfo, setAlertInfo] = useState({ show: false, message: '', type: 'success' });

  const [takenJp, setTakenJp] = useState([]);
  const [isLoadingJp, setIsLoadingJp] = useState(false);
  const [isJpOpen, setIsJpOpen] = useState(false);
  const jpDropdownRef = useRef(null);

  // 1. Fetch opsi kelas & guru
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [classesRes, teachersRes] = await Promise.all([
          fetch('/api/classes', { method: 'GET', credentials: 'include' }),
          fetch('/api/admin/users/teachers', { method: 'GET', credentials: 'include' })
        ]);

        if (!classesRes.ok) throw new Error('Gagal memuat daftar kelas');
        if (!teachersRes.ok) throw new Error('Gagal memuat daftar guru');

        const classesData = await classesRes.json();
        const teachersData = await teachersRes.json();

        const safeClasses = Array.isArray(classesData) ? classesData : [];
        const safeTeachers = Array.isArray(teachersData) ? teachersData : [];

        setClasses(safeClasses);
        setTeachers(safeTeachers);

        setFormData((prev) => ({
          ...prev,
          id_class: prev.id_class || safeClasses[0]?.id_class || '',
          // Guru opsional — jangan auto-pilih guru pertama.
          id_teacher: prev.id_teacher || '',
        }));
      } catch (err) {
        console.error(err);
        setAlertInfo({ show: true, message: err.message || 'Gagal memuat opsi kelas atau guru', type: 'error' });
      } finally {
        setIsLoadingOptions(false);
      }
    };

    fetchOptions();
  }, []);

  const expandJp = (jpValue) => {
    if (!jpValue) return [];
    return String(jpValue)
      .split(',')
      .flatMap((part) => {
        const trimmed = part.trim();
        if (trimmed.includes('-')) {
          const [start, end] = trimmed.split('-').map((n) => parseInt(n.trim(), 10));
          if (Number.isNaN(start) || Number.isNaN(end)) return [];
          const range = [];
          for (let i = start; i <= end; i++) range.push(String(i));
          return range;
        }
        return trimmed ? [trimmed] : [];
      });
  };

  const fetchTakenJp = useCallback(async (signal) => {
    if (!formData.id_class || !formData.day) {
      setTakenJp([]);
      return;
    }

    setIsLoadingJp(true);
    try {
      const params = new URLSearchParams({
        classId: formData.id_class,
        day: formData.day,
      });

      const response = await fetch(`/api/schedule?${params.toString()}`, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        signal,
      });

      if (response.status === 429) {
        throw new Error('Terlalu banyak permintaan.');
      }

      if (!response.ok) {
        throw new Error('Gagal memuat jadwal yang sudah terpakai');
      }

      const data = await response.json();
      const scheduleList = Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : []);

      const taken = scheduleList.flatMap((item) => expandJp(item.jp));
      setTakenJp(taken);

      setFormData((prev) => ({
        ...prev,
        jp: prev.jp.filter((j) => !taken.includes(j)),
      }));
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error(err);
        setTakenJp([]);
        if (err.message.includes('Terlalu banyak permintaan')) {
          setAlertInfo({ show: true, message: err.message, type: 'error' });
        }
      }
    } finally {
      setIsLoadingJp(false);
    }
  }, [formData.id_class, formData.day]);

  useEffect(() => {
    const controller = new AbortController();

    const timer = setTimeout(() => {
      fetchTakenJp(controller.signal);
    }, 300);


    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [formData.id_class, formData.day]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (jpDropdownRef.current && !jpDropdownRef.current.contains(event.target)) {
        setIsJpOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleJp = (jpValue) => {
    if (takenJp.includes(jpValue)) return;
    setFormData((prev) => {
      const already = prev.jp.includes(jpValue);
      return {
        ...prev,
        jp: already
          ? prev.jp.filter((v) => v !== jpValue)
          : [...prev.jp, jpValue].sort((a, b) => Number(a) - Number(b)),
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const mapelName = String(formData.mapel_name || '').trim();
    const classId = String(formData.id_class || '').trim();
    const day = String(formData.day || '').trim();

    if (!mapelName || !classId || !day || formData.jp.length === 0) {
      setAlertInfo({ show: true, message: 'Nama mapel, kelas, hari, dan JP wajib diisi.', type: 'error' });
      return;
    }

    setIsLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/me/mapels', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        // Guru opsional — kirim null (bukan string kosong) kalau tidak dipilih.
        body: JSON.stringify({ ...formData, id_teacher: formData.id_teacher || null, jp: formData.jp.join(',') }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || 'Gagal membuat mapel.');
      }

      setAlertInfo({ show: true, message: 'Mapel berhasil dibuat.', type: 'success' });
      setFormData((prev) => ({ ...prev, mapel_name: '', jp: [] }));
      fetchTakenJp();
      setAlertInfo({ show: true, message: err.message || 'Server error.', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MainLayout>
      {alertInfo.show && (
        <CustomAlert message={alertInfo.message} type={alertInfo.type} onClose={() => setAlertInfo({ ...alertInfo, show: false })} />
      )}

      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="border-b border-slate-200 pb-5">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Buat Mapel Baru</h1>
            <p className="text-sm text-slate-500 font-medium">Lengkapi formulir di bawah ini untuk menambahkan mata pelajaran.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white border border-slate-200/80 rounded-3xl p-8 shadow-sm space-y-6">

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">Nama Mapel</label>
            <input
              type="text"
              value={formData.mapel_name}
              onChange={(e) => setFormData({ ...formData, mapel_name: e.target.value })}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 p-3.5 text-slate-800 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all placeholder:text-slate-400"
              placeholder="Masukkan nama mata pelajaran (Contoh: PAI, Matematika)"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">Pilih Kelas</label>
              <div className="relative">
                <select
                  value={formData.id_class}
                  onChange={(e) => setFormData({ ...formData, id_class: e.target.value })}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3.5 pr-10 text-slate-800 font-medium shadow-sm transition appearance-none focus:bg-white focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isLoadingOptions}
                >
                  {isLoadingOptions && <option value="">Memuat kelas...</option>}
                  {classes.map((kelas) => (
                    <option key={kelas.id_class} value={kelas.id_class}>
                      {kelas.class_name}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-slate-400">
                  <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6 8L10 12L14 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">Pilih Guru <span className="normal-case font-medium text-slate-400">(opsional)</span></label>
              <div className="relative">
                <select
                  value={formData.id_teacher}
                  onChange={(e) => setFormData({ ...formData, id_teacher: e.target.value })}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3.5 pr-10 text-slate-800 font-medium shadow-sm transition appearance-none focus:bg-white focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isLoadingOptions}
                >
                  {isLoadingOptions && <option value="">Memuat guru...</option>}
                  {!isLoadingOptions && <option value="">Tanpa Guru</option>}
                  {teachers.map((teacher) => (
                    <option key={teacher.id_teacher} value={teacher.id_teacher}>
                      {teacher.username}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-slate-400">
                  <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6 8L10 12L14 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Row 3: Hari & JP Popover */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">Hari</label>
              <div className="relative">
                <select
                  value={formData.day}
                  onChange={(e) => setFormData({ ...formData, day: e.target.value })}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3.5 pr-10 text-slate-800 font-medium shadow-sm transition appearance-none focus:bg-white focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                >
                  {DAYS.map((hari) => (
                    <option key={hari} value={hari}>{hari}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-slate-400">
                  <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6 8L10 12L14 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
            </div>

            {/* Popover Dropdown JP */}
            <div ref={jpDropdownRef} className="relative">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">JP (Jam Pelajaran)</label>
              <button
                type="button"
                onClick={() => setIsJpOpen((prev) => !prev)}
                className="w-full flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3.5 text-left text-slate-800 font-medium shadow-sm transition focus:bg-white focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
              >
                <span className={formData.jp.length ? 'text-slate-900 font-semibold' : 'text-slate-400'}>
                  {isLoadingJp
                    ? 'Memuat jam terpakai...'
                    : formData.jp.length
                      ? `JP Terpilih: ${formData.jp.join(', ')}`
                      : 'Pilih Jam Pelajaran'}
                </span>
                <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className={`text-slate-400 transition-transform duration-200 ${isJpOpen ? 'rotate-180' : ''}`}>
                  <path d="M6 8L10 12L14 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>

              {/* Grid Box Checkbox Popover */}
              {isJpOpen && (
                <div className="absolute right-0 z-30 mt-2 w-full min-w-[320px] sm:min-w-[380px] rounded-3xl border border-slate-100 bg-white p-4 shadow-xl transition-all">
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Pilih JP</span>
                    <span className="text-xs font-semibold text-sky-600">{formData.jp.length} Dipilih</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-60 overflow-y-auto pr-1">
                    {JP_OPTIONS.map((jp) => {
                      const isTaken = takenJp.includes(jp);
                      const isChecked = formData.jp.includes(jp);

                      return (
                        <label
                          key={jp}
                          className={`flex flex-col justify-between p-2.5 min-h-[58px] rounded-2xl border text-sm font-semibold transition-all select-none cursor-pointer ${
                            isTaken
                              ? 'bg-slate-100/80 text-slate-400 border-slate-200 cursor-not-allowed'
                              : isChecked
                              ? 'bg-sky-50 border-sky-500 text-sky-700 ring-2 ring-sky-500/20'
                              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-center justify-between w-full">
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                disabled={isTaken}
                                onChange={() => toggleJp(jp)}
                                className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500 disabled:opacity-50 cursor-pointer"
                              />
                              <span className="whitespace-nowrap font-bold text-xs sm:text-sm">JP {jp}</span>
                            </div>

                            {isTaken && (
                              <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-md bg-rose-100 text-rose-600">
                                Penuh
                              </span>
                            )}
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-2xl bg-[#0d264f] py-4 text-white font-bold tracking-wide hover:bg-[#081a38] focus:ring-4 focus:ring-[#0d264f]/30 transition-all shadow-lg shadow-[#0d264f]/10 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Menyimpan...</span>
                </div>
              ) : (
                'Buat Mapel'
              )}
            </button>
          </div>

        </form>
      </div>
    </MainLayout>
  );
}