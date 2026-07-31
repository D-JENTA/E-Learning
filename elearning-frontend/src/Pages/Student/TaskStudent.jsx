import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MainLayoutStudent from "../../components/Student/MainLayout";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// --- KOMPONEN NOTIFIKASI TOAST (Universal & Bisa di-close) ---
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
// -----------------------------------------------------------

const IconArrowLeft = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
);

const IconX = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
);

const IconFileGeneric = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
);

const IconImage = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
);

const IconVideo = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
);

const IconPdf = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
);

const IconUpload = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
);

const IconTrash = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-400 hover:text-red-500 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
);

const IconClock = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
);

// ─── Helper: cek apakah deadline sudah lewat ───────────────────────────────
const isDeadlinePassed = (deadline) => {
  if (!deadline) return false;
  return new Date().getTime() > new Date(deadline).getTime();
};

// ─── Helper: format deadline ke Bahasa Indonesia ───────────────────────────
const formatDeadline = (deadline) => {
  if (!deadline) return null;
  const date = new Date(deadline);
  return date.toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};

// ─── Helper: cek apakah submission sudah dinilai ───────────────────────────
const isSubmissionGraded = (task) => {
  const grade =
    task.submission_grade ??
    task.submission_nilai ??
    task.submission_score ??
    task.submission_graded_at ??
    null;
  return grade !== null && grade !== undefined && grade !== "";
};

const FilePreview = ({ fileUrl }) => {
  if (!fileUrl) return <p className="text-slate-400 italic text-sm">Tidak ada file.</p>;
  const ext = fileUrl.split('?')[0].split('.').pop().toLowerCase();
  if (['pdf', 'doc', 'docx', 'ppt', 'pptx'].includes(ext)) {
    const googleDocsUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(fileUrl)}&embedded=true`;
    return (
      <div className="flex flex-col gap-3 w-full h-full">
        <div className="w-full h-[500px] rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
          <iframe src={googleDocsUrl} width="100%" height="100%" title="Document Viewer" className="w-full h-full"></iframe>
        </div>
        <div className="flex items-center justify-center gap-3 py-3 bg-amber-50 border border-amber-100 rounded-xl">
          <span className="text-amber-700 text-xs font-bold">Pratinjau tidak muncul?</span>
          <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="bg-amber-500 text-white px-4 py-2 rounded-lg font-bold text-xs hover:bg-amber-600 transition-all shadow-sm">Download / Buka Langsung</a>
        </div>
      </div>
    );
  }
  if (['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext)) {
    return <div className="flex justify-center bg-slate-50 rounded-xl p-2 border border-slate-200"><img src={fileUrl} alt="Preview" className="max-h-[70vh] rounded-lg object-contain shadow-sm" /></div>;
  }
  if (['mp4', 'mov', 'webm'].includes(ext)) {
    return <div className="w-full rounded-xl overflow-hidden bg-black shadow-lg"><video controls className="w-full max-h-[70vh]"><source src={fileUrl} type="video/mp4" /><source src={fileUrl} type={`video/${ext}`} />Browser Anda tidak mendukung pemutaran video.</video></div>;
  }
  return <div className="flex flex-col items-center gap-4 py-12"><p className="text-slate-500 text-sm">Tipe file <strong>.{ext}</strong> tidak bisa dipratinjau.</p><a href={fileUrl} target="_blank" rel="noopener noreferrer" className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-blue-700 transition-all shadow-md hover:shadow-lg">Download File</a></div>;
};

const PreviewModal = ({ fileUrl, title, onClose }) => {
  const handleBackdropClick = (e) => { if (e.target === e.currentTarget) onClose(); };
  useEffect(() => { const handleKey = (e) => { if (e.key === 'Escape') onClose(); }; window.addEventListener('keydown', handleKey); return () => window.removeEventListener('keydown', handleKey); }, [onClose]);
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in" onClick={handleBackdropClick}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-scale-up">
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <span className="font-bold text-slate-700 text-sm uppercase tracking-wide">{title || "Pratinjau File"}</span>
          <div className="flex items-center gap-4"><a href={fileUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1">Buka di Tab Baru</a><button onClick={onClose} className="p-2 rounded-full hover:bg-slate-200 text-slate-500 transition-colors"><IconX /></button></div>
        </div>
        <div className="p-4 overflow-y-auto custom-scrollbar flex-1 bg-slate-50"><div className="bg-white rounded-xl p-2 shadow-sm min-h-[300px] flex items-center justify-center"><FilePreview fileUrl={fileUrl} /></div></div>
      </div>
    </div>
  );
};

const DescriptionText = ({ text }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  if (!text || text.length <= 100) return <p className="text-slate-500 text-xs leading-relaxed">{text || "Tidak ada deskripsi"}</p>;
  return (
    <div className="text-xs">
      <div className={`p-2 rounded-lg border border-slate-200 bg-slate-50 transition-all ${isExpanded ? 'max-h-[300px] overflow-y-auto' : 'max-h-[60px] overflow-hidden'}`}>
        <p className={`text-slate-500 leading-relaxed ${!isExpanded ? 'line-clamp-2' : ''}`}>{text}</p>
      </div>
      <button onClick={() => setIsExpanded(!isExpanded)} className="mt-1 text-blue-600 font-bold text-[10px] hover:underline focus:outline-none uppercase tracking-wide">{isExpanded ? "Tutup" : "Baca Selengkapnya"}</button>
    </div>
  );
};

// ─── Komponen badge deadline ───────────────────────────────────────────────
const DeadlineBadge = ({ deadline }) => {
  if (!deadline) return <span className="text-slate-300 italic text-xs">Tanpa deadline</span>;

  const passed = isDeadlinePassed(deadline);
  const formatted = formatDeadline(deadline);

  // Hitung sisa waktu untuk warning (< 24 jam)
  const diff = new Date(deadline).getTime() - new Date().getTime();
  const isNearDeadline = !passed && diff > 0 && diff < 24 * 60 * 60 * 1000;

  if (passed) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-50 text-red-600 border border-red-200 text-[10px] font-bold">
        <IconClock />
        Terlambat · {formatted}
      </span>
    );
  }

  if (isNearDeadline) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold">
        <IconClock />
        Segera · {formatted}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-50 text-slate-500 border border-slate-200 text-[10px] font-medium">
      <IconClock />
      {formatted}
    </span>
  );
};

export default function TaskStudent() {
  const { id_class } = useParams();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [classTitle, setClassTitle] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [alertInfo, setAlertInfo] = useState({ show: false, message: '', type: 'success' });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [deleteLoadingId, setDeleteLoadingId] = useState(null);

  const fileInputRef = useRef(null);
  const [displayFileName, setDisplayFileName] = useState("");
  const [previewData, setPreviewData] = useState(null);

  const ITEMS_PER_PAGE_DESKTOP = 6;
  const ITEMS_PER_PAGE_MOBILE = 3;
  const [currentPage, setCurrentPage] = useState(1);

  const commonHeaders = { "ngrok-skip-browser-warning": "69420" };

  const fetchTasks = async () => {
    if (!id_class) return;
    try {
      setIsLoading(true);
      const resTeacher = await fetch(`/api/me/class/${id_class}/assignmentsTeacher`, {
        method: "GET",
        headers: commonHeaders,
        credentials: "include",
      });
      const teacherData = await resTeacher.json();

      let mySubmissions = [];
      try {
        const resStudent = await fetch(`/api/students/assignments`, {
          method: "GET",
          headers: commonHeaders,
          credentials: "include",
        });
        const contentType = resStudent.headers.get("content-type");
        if (resStudent.ok && contentType && contentType.includes("application/json")) {
          const studentData = await resStudent.json();
          mySubmissions = studentData.data || [];
        }
      } catch (e) {
        console.warn("API list pengumpulan bermasalah:", e);
      }

      if (resTeacher.ok) {
        const teacherTasks = teacherData.data || [];
        const fetchedClassName =
          getPossibleClassName(teacherData) ||
          getPossibleClassName(teacherTasks[0]) ||
          "";
        if (fetchedClassName) {
          setClassTitle(fetchedClassName);
          localStorage.setItem(`classTitle_${id_class}`, fetchedClassName);
        }

        const localLocks = JSON.parse(
          localStorage.getItem("submission_ids_cache") || "{}"
        );

        const merged = teacherTasks.map((t) => {
          const sub = mySubmissions.find(
            (s) => Number(s.id_assignment) === Number(t.id)
          );
          const actualSubId = sub
            ? sub.id_assignmentStudent || sub.id
            : localLocks[t.id];
          const actualFileUrl = sub ? sub.file_url || sub.fileUrl : null;

          // Ambil nilai dari semua kemungkinan nama field
          const gradeValue =
            sub?.grade ??
            sub?.nilai ??
            sub?.score ??
            sub?.graded_at ??
            null;

          return {
            ...t,
            submission_id: actualSubId || null,
            submission_file: actualFileUrl || null,
            submission_grade: gradeValue,
          };
        });

        setTasks(merged);
      }
    } catch (error) {
      console.error("Gagal memuat data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!id_class) return;
    const storedClassTitle = localStorage.getItem(`classTitle_${id_class}`);
    if (storedClassTitle) setClassTitle(storedClassTitle);
    fetchTasks();
  }, [id_class]);

  const handleOpenUploadModal = (task) => {
    setSelectedTask(task);
    setDisplayFileName("");
    setIsModalOpen(true);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setDisplayFileName(e.target.files[0].name);
    } else {
      setDisplayFileName("");
    }
  };

  const handleUpload = async () => {
    const fileToUpload = fileInputRef.current?.files[0];
    if (!fileToUpload) {
      setAlertInfo({ show: true, message: "Pilih file terlebih dahulu!", type: 'error' });
      return;
    }

    // Guard deadline di FE sebelum kirim ke BE
    if (isDeadlinePassed(selectedTask?.deadline)) {
      setAlertInfo({ show: true, message: "Deadline sudah lewat. Kamu tidak dapat mengumpulkan tugas ini.", type: 'error' });
      return;
    }

    try {
      setUploadLoading(true);
      const formdata = new FormData();
      formdata.append("title", selectedTask.title);
      formdata.append("id_class", id_class);
      formdata.append("file", fileToUpload);

      const response = await fetch(
        `/api/students/${selectedTask.id}/assignments`,
        {
          method: "POST",
          headers: { "ngrok-skip-browser-warning": "69420" },
          body: formdata,
          credentials: "include",
        }
      );
      const result = await response.json();

      if (response.ok) {
        setAlertInfo({ show: true, message: "Tugas berhasil dikumpulkan!", type: 'success' });
        fetchTasks();
        setIsModalOpen(false);
        setDisplayFileName("");
        if (fileInputRef.current) fileInputRef.current.value = "";
      } else {
        setAlertInfo({ show: true, message: result.message || "Gagal mengunggah.", type: 'error' });
      }
    } catch (error) {
      setAlertInfo({ show: true, message: "Terjadi kesalahan jaringan.", type: 'error' });
    } finally {
      setUploadLoading(false);
    }
  };

  const handleDeleteSubmission = async (task) => {
    if (!task.submission_id) return;

    // Jika sudah dinilai, tidak boleh dibatalkan
    if (isSubmissionGraded(task)) {
      setAlertInfo({ show: true, message: "Pengumpulan tidak dapat dibatalkan karena sudah diberi nilai oleh guru.", type: 'error' });
      return;
    }

    // DIHAPUS: window.confirm("Yakin ingin membatalkan pengumpulan tugas ini?")
    // Langsung hapus tanpa konfirmasi bawaan chrome sesuai permintaan
    
    try {
      setDeleteLoadingId(task.submission_id);
      const response = await fetch(
        `/api/students/assignments/${task.submission_id}`,
        {
          method: "DELETE",
          headers: commonHeaders,
          credentials: "include",
        }
      );
      const result = await response.json();

      if (response.ok) {
        setAlertInfo({ show: true, message: "Pengumpulan berhasil dibatalkan.", type: 'success' });
        fetchTasks();
      } else {
        setAlertInfo({ show: true, message: result.message || "Gagal membatalkan pengumpulan.", type: 'error' });
      }
    } catch (error) {
      setAlertInfo({ show: true, message: "Terjadi kesalahan jaringan.", type: 'error' });
    } finally {
      setDeleteLoadingId(null);
    }
  };

  const getFileIcon = (fileUrl) => {
    if (!fileUrl) return <IconFileGeneric />;
    const ext = fileUrl.split('?')[0].split('.').pop().toLowerCase();
    if (['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext)) return <IconImage />;
    if (['mp4', 'mov', 'webm'].includes(ext)) return <IconVideo />;
    if (ext === 'pdf') return <IconPdf />;
    return <IconFileGeneric />;
  };

  function getPossibleClassName(source, allowTopLevelName = false) {
    if (!source || typeof source !== 'object') return "";
    const topKeys = ['class_name', 'className'];
    for (const key of topKeys) {
      const value = source[key];
      if (typeof value === 'string' && value.trim()) return value.trim();
    }
    const nestedKeys = ['Class', 'class', 'data', 'attributes', 'meta'];
    for (const key of nestedKeys) {
      const nested = source[key];
      if (nested && typeof nested === 'object') {
        const nestedResult = getPossibleClassName(nested, true);
        if (nestedResult) return nestedResult;
      }
    }
    if (allowTopLevelName) {
      const candidates = ['class_name', 'className', 'name', 'kelas', 'nama'];
      for (const key of candidates) {
        const value = source[key];
        if (typeof value === 'string' && value.trim()) return value.trim();
      }
    }
    if (Array.isArray(source)) {
      for (const item of source) {
        const r = getPossibleClassName(item, allowTopLevelName);
        if (r) return r;
      }
    }
    for (const value of Object.values(source)) {
      if (value && typeof value === 'object') {
        const r = getPossibleClassName(value, allowTopLevelName);
        if (r) return r;
      }
    }
    return "";
  }

  const itemsPerPage =
    window.innerWidth >= 768 ? ITEMS_PER_PAGE_DESKTOP : ITEMS_PER_PAGE_MOBILE;
  const totalPages = Math.ceil(tasks.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTasks = tasks.slice(indexOfFirstItem, indexOfLastItem);
  const activeTask = currentTasks.length > 0 ? currentTasks[0] : null;

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <MainLayoutStudent>
      {/* Custom Alert */}
      {alertInfo.show && (
        <CustomAlert 
          message={alertInfo.message} 
          type={alertInfo.type} 
          onClose={() => setAlertInfo({ ...alertInfo, show: false })} 
        />
      )}

      <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 animate-fade-in-up">

        {/* ── Header ── */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-full bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-[#0d264f] hover:border-slate-300 transition-all shadow-sm"
            >
              <IconArrowLeft />
            </button>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
              Daftar Tugas
            </h1>
          </div>
          <div className="pl-11">
            <p className="text-slate-500 text-base font-medium">
              Akses materi dan selesaikan tugasmu.
            </p>
          </div>
        </div>

        {/* ── Banner ── */}
        <div className="bg-gradient-to-r from-[#0d264f] to-blue-800 rounded-2xl p-6 md:p-8 shadow-lg text-white">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="max-w-full md:max-w-[70%]">
              {activeTask && (
                <div className="flex flex-col gap-1">
                  <span className="text-[15px] font-bold uppercase tracking-widest text-blue-200">
                    Tugas Saat Ini
                  </span>
                </div>
              )}
            </div>
            <div className="bg-white/10 px-4 py-2 rounded-lg border border-white/20 backdrop-blur-sm flex-shrink-0">
              <span className="text-sm font-medium">
                Total Tugas:{" "}
                <span className="font-bold text-white">{tasks.length}</span>
              </span>
            </div>
          </div>
        </div>

        {/* ── Tabel ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto md:overflow-visible">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-400 text-xs font-bold uppercase tracking-wider hidden md:table-header-group">
                <tr>
                  <th className="px-6 py-4 text-center w-16">No</th>
                  <th className="px-6 py-4">Informasi Tugas</th>
                  <th className="px-6 py-4 text-center">Deadline</th>
                  <th className="px-6 py-4 text-center">Materi</th>
                  <th className="px-6 py-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-sm">
                {isLoading ? (
                  <tr>
                    <td colSpan="5" className="py-24 text-center text-slate-400">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-8 h-8 border-4 border-slate-100 border-t-[#0d264f] rounded-full animate-spin"></div>
                        <span>Memuat daftar tugas...</span>
                      </div>
                    </td>
                  </tr>
                ) : tasks.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-24 text-center text-slate-400">
                      <span>Belum ada tugas di kelas ini.</span>
                    </td>
                  </tr>
                ) : (
                  currentTasks.map((task, index) => {
                    const materiUrl = task.fileUrl?.startsWith('http')
                      ? task.fileUrl
                      : task.fileUrl
                      ? `${API_URL}/${task.fileUrl}`
                      : null;
                    const jawabanUrl = task.submission_file?.startsWith('http')
                      ? task.submission_file
                      : task.submission_file
                      ? `${API_URL}/${task.submission_file}`
                      : null;
                    const targetID = task.id || task.id_assignment;
                    const realIndex = index + 1 + indexOfFirstItem;

                    const deadlinePassed = isDeadlinePassed(task.deadline);
                    const graded = isSubmissionGraded(task);
                    const isDeleting = deleteLoadingId === task.submission_id;

                    return (
                      <tr
                        key={targetID || index}
                        className="hover:bg-slate-50/50 transition-colors group border-b border-slate-100 last:border-0"
                      >
                        {/* ── Mobile Layout ── */}
                        <td className="p-4 md:hidden block w-full">
                          <div className="flex items-center justify-between mb-3">
                            <span className="font-bold text-slate-900 text-base">
                              #{realIndex}
                            </span>
                            <div className="w-1/2 text-right">
                              {materiUrl ? (
                                <button
                                  onClick={() => setPreviewData({ url: materiUrl, title: "Materi Tugas" })}
                                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg font-bold text-xs bg-slate-50 text-slate-600 border border-slate-200 w-full justify-center"
                                >
                                  {getFileIcon(materiUrl)} Lihat Materi
                                </button>
                              ) : (
                                <span className="text-slate-300 text-xs text-right">Tanpa Materi</span>
                              )}
                            </div>
                          </div>

                          <div className="mb-2">
                            <h3 className="font-bold text-slate-800 text-base mb-1">
                              {task.title}
                            </h3>
                            <DescriptionText text={task.description} />
                          </div>

                          {/* Deadline mobile */}
                          <div className="mb-3">
                            <DeadlineBadge deadline={task.deadline} />
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-slate-100 gap-2">
                            <div className="flex items-center gap-2">
                              {task.submission_id && (
                                <button
                                  onClick={() => setPreviewData({ url: jawabanUrl, title: "Jawaban Saya" })}
                                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg font-bold text-xs bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100"
                                >
                                  <IconUpload /> Lihat Jawaban
                                </button>
                              )}
                              {/* Tombol batalkan: sembunyikan jika sudah dinilai */}
                              {task.submission_id && !graded && (
                                <button
                                  onClick={() => handleDeleteSubmission(task)}
                                  disabled={isDeleting}
                                  className="p-1.5 text-slate-400 hover:text-red-500 disabled:opacity-50"
                                  title="Batalkan pengumpulan"
                                >
                                  {isDeleting ? (
                                    <svg className="animate-spin h-4 w-4 text-red-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/></svg>
                                  ) : (
                                    <IconTrash />
                                  )}
                                </button>
                              )}
                            </div>

                            {!task.submission_id && (
                              deadlinePassed ? (
                                <div className="flex-1 py-2.5 rounded-xl bg-red-50 text-red-400 font-bold text-xs text-center border border-red-200 cursor-not-allowed select-none">
                                  Deadline Lewat
                                </div>
                              ) : (
                                <button
                                  onClick={() => handleOpenUploadModal(task)}
                                  className="flex-1 py-2.5 rounded-xl bg-[#0d264f] text-white font-bold text-xs hover:bg-blue-900 transition-all shadow-md active:scale-95"
                                >
                                  Kumpulkan
                                </button>
                              )
                            )}
                          </div>
                        </td>

                        {/* ── Desktop Layout ── */}
                        <td className="px-6 py-4 text-center text-slate-400 font-medium hidden md:table-cell">
                          {realIndex}
                        </td>

                        <td className="px-6 py-4 hidden md:table-cell">
                          <div className="flex flex-col gap-1 max-w-md">
                            <span className="font-bold text-slate-800 text-sm">
                              {task.title}
                            </span>
                            <DescriptionText text={task.description} />
                          </div>
                        </td>

                        {/* Kolom deadline desktop */}
                        <td className="px-6 py-4 text-center hidden md:table-cell">
                          <DeadlineBadge deadline={task.deadline} />
                        </td>

                        <td className="px-6 py-4 text-center hidden md:table-cell">
                          {materiUrl ? (
                            <button
                              onClick={() => setPreviewData({ url: materiUrl, title: "Materi Tugas" })}
                              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-xs bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100 transition-colors"
                            >
                              {getFileIcon(materiUrl)} Lihat Materi
                            </button>
                          ) : (
                            <span className="text-slate-300 italic text-xs">Tanpa Materi</span>
                          )}
                        </td>

                        <td className="px-6 py-4 text-center hidden md:table-cell">
                          {task.submission_id ? (
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => setPreviewData({ url: jawabanUrl, title: "Jawaban Saya" })}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-xs bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100 transition-colors"
                              >
                                <IconUpload /> Lihat Jawaban
                              </button>

                              {/* Tombol batalkan: hilang jika sudah dinilai */}
                              {!graded && (
                                <button
                                  onClick={() => handleDeleteSubmission(task)}
                                  disabled={isDeleting}
                                  className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg transition-colors disabled:opacity-50"
                                  title="Batalkan pengumpulan"
                                >
                                  {isDeleting ? (
                                    <svg className="animate-spin h-4 w-4 text-red-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/></svg>
                                  ) : (
                                    <IconTrash />
                                  )}
                                </button>
                              )}

                              {/* Badge sudah dinilai */}
                              {graded && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-200 text-[10px] font-bold">
                                  Sudah Dinilai
                                </span>
                              )}
                            </div>
                          ) : deadlinePassed ? (
                            // Deadline lewat, belum dikumpulkan
                            <div className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-red-50 text-red-400 font-bold text-xs border border-red-200 cursor-not-allowed select-none">
                              Deadline Lewat
                            </div>
                          ) : (
                            <button
                              onClick={() => handleOpenUploadModal(task)}
                              className="px-6 py-2.5 rounded-2xl bg-[#0d264f] text-white font-bold text-xs hover:bg-blue-900 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 active:scale-95"
                            >
                              Kumpulkan
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Pagination ── */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-8 pb-4">
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-100 hover:text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
            {[...Array(totalPages).keys()].map((page) => {
              const pageNumber = page + 1;
              const isActive = currentPage === pageNumber;
              return (
                <button
                  key={pageNumber}
                  onClick={() => paginate(pageNumber)}
                  className={`w-10 h-10 rounded-xl font-bold text-sm transition-all shadow-sm duration-300 transform hover:scale-105 ${isActive ? 'bg-[#0d264f] text-white shadow-lg' : 'text-slate-500 hover:bg-white hover:text-[#0d264f]'}`}
                >
                  {pageNumber}
                </button>
              );
            })}
            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-100 hover:text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>
        )}
      </div>

      {/* ── Modal Upload ── */}
      {isModalOpen && selectedTask && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md relative z-10 p-8 overflow-hidden animate-scale-up">
            <div className="mb-6 flex justify-between items-start">
              <div>
                <h3 className="text-2xl font-extrabold text-slate-900">Upload Jawaban</h3>
                <p className="text-slate-500 text-sm">
                  Tugas:{" "}
                  <span className="font-bold text-slate-700">{selectedTask.title}</span>
                </p>
                {/* Tampil deadline di modal */}
                {selectedTask.deadline && (
                  <div className="mt-2">
                    <DeadlineBadge deadline={selectedTask.deadline} />
                  </div>
                )}
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors"
              >
                <IconX />
              </button>
            </div>

            {/* Guard: jika deadline sudah lewat saat modal dibuka */}
            {isDeadlinePassed(selectedTask?.deadline) ? (
              <div className="py-8 text-center">
                <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
                  <IconClock />
                </div>
                <p className="text-red-600 font-bold text-base mb-1">Deadline Sudah Lewat</p>
                <p className="text-slate-500 text-sm">
                  Tugas ini sudah tidak bisa dikumpulkan.
                </p>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="mt-6 px-8 py-3 rounded-2xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 transition-colors"
                >
                  Tutup
                </button>
              </div>
            ) : (
              <form
                onSubmit={(e) => { e.preventDefault(); handleUpload(); }}
                className="space-y-6"
              >
                <div
                  className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all cursor-pointer relative group ${displayFileName ? 'border-green-400 bg-green-50' : 'border-slate-200 hover:bg-slate-50'}`}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    onChange={handleFileChange}
                  />
                  <div className="flex flex-col items-center gap-3 relative z-0">
                    <div
                      className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110 ${displayFileName ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200 group-hover:text-[#0d264f]'}`}
                    >
                      <IconUpload />
                    </div>
                    <p className="text-slate-600 font-semibold">
                      {displayFileName ? (
                        <span className="text-green-700 truncate max-w-[200px] block">{displayFileName}</span>
                      ) : (
                        <> <span className="text-[#0d264f]">Klik untuk upload</span> atau drag & drop </>
                      )}
                    </p>
                    <p className="text-xs text-slate-400">PDF, Gambar, atau Video (Maks. 10MB)</p>
                  </div>
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    disabled={uploadLoading}
                    className="flex-1 py-3 rounded-2xl text-slate-600 font-bold hover:bg-slate-100 transition-colors disabled:opacity-50"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={uploadLoading}
                    className="flex-1 py-3 rounded-2xl bg-[#0d264f] text-white font-bold hover:bg-blue-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2"
                  >
                    {uploadLoading ? (
                      <>
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/></svg>
                        Mengirim...
                      </>
                    ) : (
                      "Kirim Jawaban"
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ── Preview Modal ── */}
      {previewData && (
        <PreviewModal
          fileUrl={previewData.url}
          title={previewData.title}
          onClose={() => setPreviewData(null)}
        />
      )}
      
      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(100%); }
          to { opacity: 1; transform: translateX(0); }
        }
        .animate-slideIn {
          animation: slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </MainLayoutStudent>
  );
}