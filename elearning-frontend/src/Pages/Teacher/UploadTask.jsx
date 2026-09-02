import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useParams } from 'react-router-dom';
import MainLayoutTeacher from '../../components/Teacher/MainLayout';

const CustomAlert = ({ message, type, onClose }) => {
  useEffect(() => {
    const t = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(t);
  }, [onClose]);

  if (!message) return null;

  const iconBg = type === 'error' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600';
  
  const Icon = type === 'error' 
    ? <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
    : <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>;

  return (
    <div className="fixed top-5 right-5 z-[100] flex items-center w-full max-w-xs p-4 space-x-3 text-gray-500 bg-white rounded-lg shadow-2xl border-l-4 transition-all duration-300 transform animate-slideIn">
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

export default function UploadTask() {
  const { id_class } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '23:59',
    file: null,
    link: '',
  });

  // Sumber tugas: "file" atau "link" — backend menolak kalau keduanya dikirim
  const [attachmentMode, setAttachmentMode] = useState('file');

  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [alertInfo, setAlertInfo] = useState({ show: false, message: '', type: 'success' });

  // State untuk Custom Popover Date & Time Picker
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  
  // State navigasi kalender custom
  const [currentCalendarDate, setCurrentCalendarDate] = useState(new Date());

  const datePickerRef = useRef(null);
  const timePickerRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target)) {
        setShowDatePicker(false);
      }
      if (timePickerRef.current && !timePickerRef.current.contains(event.target)) {
        setShowTimePicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, file: e.target.files[0] });
    }
  };

  const setQuickDate = (daysToAdd) => {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + daysToAdd);
    const dateStr = targetDate.toISOString().split("T")[0];
    setFormData((prev) => ({ ...prev, date: dateStr }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!id_class || id_class === "undefined") {
      setAlertInfo({ show: true, message: "ID Kelas tidak valid!", type: 'error' });
      return;
    }

    if (!formData.title) {
      setAlertInfo({ show: true, message: "Judul tugas wajib diisi!", type: 'error' });
      return;
    }

    // validasi sumber tugas sesuai kontrak backend: wajib file ATAU link (tidak keduanya)
    if (attachmentMode === 'link') {
      const link = formData.link.trim();
      if (!link) {
        setAlertInfo({ show: true, message: "Wajib upload file atau isi link tugas!", type: 'error' });
        return;
      }
      try {
        const u = new URL(link);
        if (u.protocol !== "http:" && u.protocol !== "https:") throw new Error();
      } catch {
        setAlertInfo({ show: true, message: "Link tidak valid, gunakan format URL http/https", type: 'error' });
        return;
      }
    } else if (!formData.file) {
      setAlertInfo({ show: true, message: "Wajib upload file atau isi link tugas!", type: 'error' });
      return;
    }

    const MAX_FILE_SIZE = 100 * 1024 * 1024;
    if (attachmentMode === 'file' && formData.file.size > MAX_FILE_SIZE) {
      setAlertInfo({ show: true, message: "File terlalu besar. Maksimum 100 MB.", type: 'error' });
      return;
    }

    if (formData.date) {
      const selectedDate = new Date(`${formData.date}T${formData.time}`);
      const now = new Date();
      if (selectedDate < now) {
        setAlertInfo({ show: true, message: "Waktu deadline tidak boleh di masa lalu!", type: 'error' });
        return;
      }
    }

    try {
      setIsLoading(true);
      const data = new FormData();
      data.append("assignment_title", formData.title);
      data.append("description", formData.description);
      data.append("id_class", id_class);

      // hanya kirim SALAH SATU — backend menolak kalau file & link dikirim bersamaan
      if (attachmentMode === 'link') {
        data.append("assignment_link", formData.link.trim());
      } else {
        data.append("file", formData.file);
      }
      
      if (formData.date) {
        const deadlineString = new Date(`${formData.date}T${formData.time}`).toISOString();
        data.append("deadline", deadlineString);
      }

      const response = await fetch(`/api/teachers/mapel/${id_class}/assignments`, {
        method: "POST",
        credentials: "include",
        body: data,
      });

      const contentType = response.headers.get("content-type") || "";
      let result = null;
      let textResponse = null;
      if (contentType.includes("application/json")) {
        result = await response.json().catch(() => null);
      } else {
        textResponse = await response.text().catch(() => null);
      }

      if (response.ok) {
        setAlertInfo({ show: true, message: "Tugas berhasil dibuat!", type: 'success' });
        setTimeout(() => {
          navigate(`/teacher/assignments/${id_class}`);
        }, 1000);
      } else {
        const message = result?.message || result?.error || textResponse || `Gagal mengunggah tugas. (HTTP ${response.status})`;
        setAlertInfo({ show: true, message: message, type: 'error' });
      }
    } catch (error) {
      console.error("Upload error:", error);
      setAlertInfo({ show: true, message: "Gagal menghubungi server.", type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  // Helper Kalender Custom
  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const generateCalendarDays = () => {
    const year = currentCalendarDate.getFullYear();
    const month = currentCalendarDate.getMonth();
    const totalDays = getDaysInMonth(year, month);
    const startDay = getFirstDayOfMonth(year, month);
    
    const days = [];
    for (let i = 0; i < startDay; i++) {
      days.push(null);
    }
    for (let d = 1; d <= totalDays; d++) {
      days.push(new Date(year, month, d));
    }
    return days;
  };

  const handleSelectCalendarDate = (dateObj) => {
    if (!dateObj) return;
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    const formatted = `${year}-${month}-${day}`;
    setFormData({ ...formData, date: formatted });
    setShowDatePicker(false);
  };

  const isToday = (dateObj) => {
    if (!dateObj) return false;
    const today = new Date();
    return dateObj.toDateString() === today.toDateString();
  };

  const isSelectedDate = (dateObj) => {
    if (!dateObj || !formData.date) return false;
    const [y, m, d] = formData.date.split('-').map(Number);
    return dateObj.getFullYear() === y && dateObj.getMonth() === m - 1 && dateObj.getDate() === d;
  };

  const isPastDate = (dateObj) => {
    if (!dateObj) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return dateObj < today;
  };

  // Format tanggal untuk tampilan UI
  const formatDisplayDate = (dateStr) => {
    if (!dateStr) return "Pilih Tanggal";
    const [y, m, d] = dateStr.split('-');
    const date = new Date(y, m - 1, d);
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const timePresets = [
    { label: "08:00 WIB (Pagi)", value: "08:00" },
    { label: "12:00 WIB (Siang)", value: "12:00" },
    { label: "15:00 WIB (Sore)", value: "15:00" },
    { label: "17:00 WIB (Petang)", value: "17:00" },
    { label: "21:00 WIB (Malam)", value: "21:00" },
    { label: "23:59 WIB (Tenggat Akhir)", value: "23:59" },
  ];

  return (
    <MainLayoutTeacher>
      {alertInfo.show && (
        <CustomAlert 
          message={alertInfo.message} 
          type={alertInfo.type} 
          onClose={() => setAlertInfo({ ...alertInfo, show: false })} 
        />
      )}

      <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-8 animate-fade-in-up">
        
        <div className="flex flex-col gap-4">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Buat Tugas Baru</h1>
          <div>
            <p className="text-slate-500 text-lg font-medium">Isi detail tugas baru untuk kelas ini.</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <form onSubmit={handleSubmit} className="p-6 md:p-10 space-y-8">
            
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">
                Judul Tugas
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder="Contoh: Kuis Matematika Bab 1"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 text-base font-bold text-slate-800 focus:bg-white focus:border-[#0d264f] focus:ring-2 focus:ring-[#0d264f]/10 outline-none transition-all placeholder:text-slate-400"
              />
            </div>      

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">
                Deskripsi / Instruksi
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Apa yang harus dilakukan siswa?"
                rows="5"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 text-base font-medium text-slate-800 focus:bg-white focus:border-[#0d264f] focus:ring-2 focus:ring-[#0d264f]/10 outline-none transition-all placeholder:text-slate-400 resize-none"
              />
            </div>

            {/* SECTION DEADLINE CUSTOM */}
            <div className="space-y-4 bg-slate-50/70 p-5 rounded-2xl border border-slate-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">
                    Tenggat Waktu Pengumpulkan
                  </label>
                  <span className="text-[10px] text-slate-400 bg-slate-200/60 px-2 py-0.5 rounded-full font-medium">Opsional</span>
                </div>

                {formData.date && (
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, date: '' })}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200/60 transition-all cursor-pointer active:scale-95 shadow-2xs"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    Hapus Tenggat
                  </button>
                )}
              </div>

              {/* Preset Tanggal */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-xs text-slate-400 font-medium mr-1">Pilihan Cepat:</span>
                <button
                  type="button"
                  onClick={() => setQuickDate(0)}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 bg-white hover:border-[#0d264f] hover:text-[#0d264f] transition-all cursor-pointer shadow-2xs"
                >
                  Hari Ini
                </button>
                <button
                  type="button"
                  onClick={() => setQuickDate(1)}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 bg-white hover:border-[#0d264f] hover:text-[#0d264f] transition-all cursor-pointer shadow-2xs"
                >
                  Besok
                </button>
                <button
                  type="button"
                  onClick={() => setQuickDate(3)}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 bg-white hover:border-[#0d264f] hover:text-[#0d264f] transition-all cursor-pointer shadow-2xs"
                >
                  3 Hari Lagi
                </button>
                <button
                  type="button"
                  onClick={() => setQuickDate(7)}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 bg-white hover:border-[#0d264f] hover:text-[#0d264f] transition-all cursor-pointer shadow-2xs"
                >
                  1 Minggu
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                {/* Custom Date Picker Modal Trigger */}
                <div className="relative" ref={datePickerRef}>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Pilih Tanggal</label>
                  <button
                    type="button"
                    onClick={() => setShowDatePicker(!showDatePicker)}
                    className="w-full flex items-center justify-between bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-800 hover:border-[#0d264f] focus:border-[#0d264f] focus:ring-2 focus:ring-[#0d264f]/10 outline-none transition-all cursor-pointer shadow-2xs"
                  >
                    <span className={formData.date ? "text-slate-800 font-bold" : "text-slate-400 font-normal"}>
                      {formatDisplayDate(formData.date)}
                    </span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </button>

                  {/* Dropdown Kalender Custom */}
                  {showDatePicker && (
                    <div className="absolute top-full left-0 mt-2 z-50 w-72 bg-white border border-slate-200 rounded-2xl shadow-xl p-4 animate-fade-in-up">
                      <div className="flex items-center justify-between mb-4">
                        <button
                          type="button"
                          onClick={() => setCurrentCalendarDate(new Date(currentCalendarDate.getFullYear(), currentCalendarDate.getMonth() - 1, 1))}
                          className="p-1 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                        </button>
                        <span className="text-sm font-bold text-slate-800">
                          {currentCalendarDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
                        </span>
                        <button
                          type="button"
                          onClick={() => setCurrentCalendarDate(new Date(currentCalendarDate.getFullYear(), currentCalendarDate.getMonth() + 1, 1))}
                          className="p-1 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                        </button>
                      </div>

                      <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-slate-400 mb-2">
                        <span>Min</span><span>Sen</span><span>Sel</span><span>Rab</span><span>Kam</span><span>Jum</span><span>Sab</span>
                      </div>

                      <div className="grid grid-cols-7 gap-1 text-center">
                        {generateCalendarDays().map((dateObj, idx) => {
                          if (!dateObj) return <div key={idx} />;
                          const selected = isSelectedDate(dateObj);
                          const today = isToday(dateObj);
                          const disabled = isPastDate(dateObj);

                          return (
                            <button
                              key={idx}
                              type="button"
                              disabled={disabled}
                              onClick={() => handleSelectCalendarDate(dateObj)}
                              className={`h-8 rounded-lg text-xs font-semibold transition-all flex items-center justify-center
                                ${selected ? 'bg-[#0d264f] text-white shadow-md font-bold' : ''}
                                ${!selected && today ? 'border border-[#0d264f] text-[#0d264f]' : ''}
                                ${!selected && !today && !disabled ? 'hover:bg-slate-100 text-slate-700' : ''}
                                ${disabled ? 'text-slate-300 cursor-not-allowed opacity-40' : 'cursor-pointer'}
                              `}
                            >
                              {dateObj.getDate()}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Custom Time Picker Modal Trigger */}
                <div className="relative" ref={timePickerRef}>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Pilih Jam Batas (WIB)</label>
                  <button
                    type="button"
                    onClick={() => setShowTimePicker(!showTimePicker)}
                    className="w-full flex items-center justify-between bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-800 hover:border-[#0d264f] focus:border-[#0d264f] focus:ring-2 focus:ring-[#0d264f]/10 outline-none transition-all cursor-pointer shadow-2xs"
                  >
                    <span className="text-slate-800 font-bold">{formData.time} WIB</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </button>

                  {/* Dropdown Jam Custom */}
                  {showTimePicker && (
                    <div className="absolute top-full right-0 mt-2 z-50 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl p-3 animate-fade-in-up">
                      <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-2">
                        Pilihan Jam Populer
                      </div>
                      <div className="space-y-1">
                        {timePresets.map((preset) => (
                          <button
                            key={preset.value}
                            type="button"
                            onClick={() => {
                              setFormData({ ...formData, time: preset.value });
                              setShowTimePicker(false);
                            }}
                            className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-between ${
                              formData.time === preset.value
                                ? 'bg-blue-50 text-[#0d264f] font-bold'
                                : 'hover:bg-slate-50 text-slate-700'
                            }`}
                          >
                            <span>{preset.label}</span>
                            {formData.time === preset.value && (
                              <svg className="w-4 h-4 text-[#0d264f]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                              </svg>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Status Info Box */}
              <div className="bg-white border border-slate-200/80 rounded-xl p-3 flex items-center gap-3 shadow-xs">
                <div className={`p-2 rounded-lg ${formData.date ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-400'}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="text-xs">
                  {formData.date ? (
                    <p className="text-slate-700 font-medium">
                      Tugas dikumpulkan paling lambat <span className="font-bold text-[#0d264f]">{formData.date}</span> pukul <span className="font-bold text-[#0d264f]">{formData.time} WIB</span>.
                    </p>
                  ) : (
                    <p className="text-slate-400">
                      Belum ada tanggal dipilih (siswa dapat mengumpulkan tugas kapan saja).
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between ml-1">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Sumber Tugas
                </label>
                <span className="text-[10px] text-slate-400 bg-slate-200/60 px-2 py-0.5 rounded-full font-medium">Pilih salah satu</span>
              </div>

              {/* Toggle File / Link */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
                <button
                  type="button"
                  onClick={() => setAttachmentMode('file')}
                  className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold transition-all cursor-pointer ${
                    attachmentMode === 'file'
                      ? 'bg-white text-[#0d264f] shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                  </svg>
                  Upload File
                </button>
                <button
                  type="button"
                  onClick={() => setAttachmentMode('link')}
                  className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold transition-all cursor-pointer ${
                    attachmentMode === 'link'
                      ? 'bg-white text-[#0d264f] shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                  </svg>
                  Kirim Link
                </button>
              </div>

              {attachmentMode === 'file' ? (
              <div
                className={`relative border-2 border-dashed rounded-2xl p-8 md:p-12 text-center transition-all duration-300 cursor-pointer group
                  ${isDragging ? 'border-[#0d264f] bg-blue-50 scale-[1.01]' : 'border-slate-200 hover:bg-slate-50'}
                  ${formData.file ? 'border-green-500 bg-green-50' : ''}
                `}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  if (e.dataTransfer.files[0]) setFormData({...formData, file: e.dataTransfer.files[0]});
                }}
              >
                <input
                  type="file"
                  accept="application/pdf,image/*,video/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className="flex flex-col items-center gap-4 relative z-0">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110
                    ${formData.file ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200 group-hover:text-[#0d264f]'}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-slate-700 font-semibold text-base">
                      {formData.file ? (
                        <span className="text-green-700 truncate max-w-xs block">{formData.file.name}</span>
                      ) : (
                        <>
                          <span className="text-[#0d264f]">Klik untuk mengunggah</span> atau drag & drop
                        </>
                      )}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">PDF, Gambar, atau Video (Maks. 100MB)</p>
                  </div>
                </div>
              </div>
              ) : (
              <div className="space-y-2">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                    </svg>
                  </div>
                  <input
                    type="url"
                    value={formData.link}
                    onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                    placeholder="https://drive.google.com/..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-5 py-4 text-base font-medium text-slate-800 focus:bg-white focus:border-[#0d264f] focus:ring-2 focus:ring-[#0d264f]/10 outline-none transition-all placeholder:text-slate-400"
                  />
                </div>
                <p className="text-xs text-slate-400 ml-1">
                  Tempelkan tautan tugas (Google Drive, YouTube, dsb). Harus diawali http:// atau https://
                </p>
              </div>
              )}
            </div>

            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-6 border-t border-slate-100">
              <button 
                type="button"
                onClick={() => navigate(-1)}
                className="w-full sm:w-auto px-6 py-3 rounded-xl text-slate-600 font-bold hover:bg-slate-100 transition-all"
              >
                Batal
              </button>
              <button 
                type="submit"
                disabled={isLoading}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl text-white bg-[#0d264f] hover:bg-blue-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl font-bold flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Mengunggah...
                  </>
                ) : "Buat Tugas"}
              </button>
            </div>

          </form>
        </div>
      </div>

      <style>{`
        @keyframes slideIn {
          from { opacity:0; transform: translateX(100%); }
          to { opacity: 1; transform: translateX(0); }
        }
        .animate-slideIn {
          animation: slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </MainLayoutTeacher>
  );
}