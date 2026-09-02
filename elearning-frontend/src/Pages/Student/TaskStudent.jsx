import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import MainLayoutStudent from "../../components/Student/MainLayout";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const CustomAlert = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  if (!message) return null;

  const iconBg = type === 'error' ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600';
  
  const Icon = type === 'error' 
    ? <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
    : <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>;

  return (
    <div className="fixed top-5 right-5 z-[100] flex items-center w-full max-w-xs p-4 space-x-3 text-gray-500 bg-white rounded-xl shadow-2xl border-l-4 transition-all duration-300 transform animate-slideIn">
      <div className={`inline-flex items-center justify-center flex-shrink-0 w-8 h-8 rounded-lg ${iconBg}`}>
        {Icon}
      </div>
      <div className="flex-1 text-sm font-medium text-gray-800 break-words">
        {message}
      </div>
      <button 
        type="button" 
        onClick={onClose} 
        aria-label="Tutup notifikasi"
        className="ml-auto -mx-1.5 -my-1.5 bg-white text-gray-400 hover:text-gray-900 rounded-lg p-1.5 hover:bg-gray-100 inline-flex h-8 w-8 items-center justify-center transition-colors"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
      </button>
    </div>
  );
};

const IconX = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
);

const IconFileGeneric = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-500 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
);

const IconImage = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-500 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
);

const IconVideo = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-500 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
);

const IconPdf = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-500 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
);

const IconUpload = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
);

const IconTrash = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-500 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
);

const IconClock = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
);

const IconChevronLeft = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
);

const IconChevronRight = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
);

const IconCheck = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
);

const IconPaperclip = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-500 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
);

const IconEye = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
);

const IconAward = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>
);

const isDeadlinePassed = (deadline) => {
  if (!deadline) return false;
  return new Date().getTime() > new Date(deadline).getTime();
};

// Tugas berupa link (guru mengisi assignment_link, bukan upload file).
// file_url-nya menunjuk situs luar (G Drive, dll), bukan URL Cloudinary.
const isExternalLink = (url) => {
  if (!url) return false;
  if (/^https?:\/\/res\.cloudinary\.com\//i.test(url)) return false;
  return /^https?:\/\//i.test(url);
};

// Batas yang sama dengan backend (multer limits.fileSize)
const MAX_FILE_SIZE = 100 * 1024 * 1024;

// Tipe file yang diterima backend (cloudinary.js -> sharedFileFilter),
// dipakai untuk filter file picker biar siswa tidak memilih file yang pasti ditolak
const ACCEPTED_FILE_TYPES =
  "application/pdf,application/msword," +
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document," +
  "application/vnd.ms-powerpoint," +
  "application/vnd.openxmlformats-officedocument.presentationml.presentation," +
  "video/mp4,video/quicktime,video/webm," +
  "image/jpeg,image/png,image/webp,image/gif";

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

const isSubmissionGraded = (task) => {
  const grade =
    task.submission_grade ??
    task.submission_nilai ??
    task.submission_score ??
    task.submission_graded_at ??
    null;
  return grade !== null && grade !== undefined && grade !== "";
};

// Ambil nilai numerik untuk ditampilkan (score 0-100 dari guru).
// null jika belum ada nilai atau nilainya bukan angka (mis. hanya timestamp graded_at).
const getDisplayGrade = (task) => {
  const raw =
    task.submission_grade ??
    task.submission_nilai ??
    task.submission_score ??
    null;
  if (raw === null || raw === undefined || raw === "") return null;
  const num = Number(raw);
  return Number.isFinite(num) ? num : null;
};

const FilePreview = ({ fileUrl }) => {
  if (!fileUrl) return <p className="text-slate-400 italic text-sm">Tidak ada file.</p>;
  // Materi berupa link eksternal (bukan file di Cloudinary) -> tidak bisa dipratinjau, arahkan langsung
  if (isExternalLink(fileUrl)) {
    return (
      <div className="flex flex-col items-center gap-4 py-12 px-4 text-center">
        <p className="text-slate-500 text-sm break-all">Materi ini berupa tautan:<br /><strong className="text-slate-700 break-all">{fileUrl}</strong></p>
        <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-blue-700 transition-all shadow-md">Buka Link Tugas</a>
      </div>
    );
  }
  const ext = fileUrl.split('?')[0].split('.').pop().toLowerCase();
  if (['pdf', 'doc', 'docx', 'ppt', 'pptx'].includes(ext)) {
    const googleDocsUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(fileUrl)}&embedded=true`;
    return (
      <div className="flex flex-col gap-3 w-full h-full">
        <div className="w-full h-[350px] sm:h-[450px] md:h-[500px] rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
          <iframe src={googleDocsUrl} width="100%" height="100%" title="Document Viewer" className="w-full h-full"></iframe>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-amber-50 border border-amber-100 rounded-xl text-xs">
          <span className="text-amber-700 font-bold">Pratinjau tidak muncul?</span>
          <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="bg-amber-500 text-white px-3 py-1.5 rounded-lg font-bold hover:bg-amber-600 transition-all shadow-sm">Download / Buka Langsung</a>
        </div>
      </div>
    );
  }
  if (['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext)) {
    return <div className="flex justify-center bg-slate-50 rounded-xl p-2 border border-slate-200"><img src={fileUrl} alt="Preview" className="max-h-[50vh] sm:max-h-[65vh] rounded-lg object-contain shadow-sm" /></div>;
  }
  if (['mp4', 'mov', 'webm'].includes(ext)) {
    return <div className="w-full rounded-xl overflow-hidden bg-black shadow-lg"><video controls className="w-full max-h-[50vh] sm:max-h-[65vh]"><source src={fileUrl} type="video/mp4" /><source src={fileUrl} type={`video/${ext}`} />Browser Anda tidak mendukung pemutaran video.</video></div>;
  }
  return <div className="flex flex-col items-center gap-4 py-12"><p className="text-slate-500 text-sm">Tipe file <strong>.{ext}</strong> tidak bisa dipratinjau.</p><a href={fileUrl} target="_blank" rel="noopener noreferrer" className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-blue-700 transition-all shadow-md">Download File</a></div>;
};

const PreviewModal = ({ fileUrl, title, onClose }) => {
  const handleBackdropClick = (e) => { if (e.target === e.currentTarget) onClose(); };
  useEffect(() => { const handleKey = (e) => { if (e.key === 'Escape') onClose(); }; window.addEventListener('keydown', handleKey); return () => window.removeEventListener('keydown', handleKey); }, [onClose]);
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 md:p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in" onClick={handleBackdropClick}>
      <div className="bg-white rounded-2xl md:rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex justify-between items-center px-4 md:px-6 py-3 md:py-4 border-b border-slate-100 bg-slate-50">
          <span className="font-bold text-slate-700 text-xs md:text-sm uppercase tracking-wide truncate pr-2">{title || "Pratinjau File"}</span>
          <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
            <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-blue-600 hover:text-blue-800 whitespace-nowrap">Buka Tab Baru</a>
            <button onClick={onClose} aria-label="Tutup pratinjau" className="p-1.5 md:p-2 rounded-full hover:bg-slate-200 text-slate-500 transition-colors"><IconX /></button>
          </div>
        </div>
        <div className="p-3 md:p-4 overflow-y-auto flex-1 bg-slate-50">
          <div className="bg-white rounded-xl p-2 shadow-sm min-h-[250px] flex items-center justify-center">
            <FilePreview fileUrl={fileUrl} />
          </div>
        </div>
      </div>
    </div>
  );
};

const DeadlineBadge = ({ deadline }) => {
  if (!deadline) return <span className="text-slate-400 italic text-xs">Tanpa deadline</span>;

  const passed = isDeadlinePassed(deadline);
  const formatted = formatDeadline(deadline);

  const diff = new Date(deadline).getTime() - new Date().getTime();
  const isNearDeadline = !passed && diff > 0 && diff < 24 * 60 * 60 * 1000;

  if (passed) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md bg-red-50 text-red-600 border border-red-200 text-[11px] sm:text-xs font-semibold whitespace-nowrap">
        <IconClock /> {formatted}
      </span>
    );
  }

  if (isNearDeadline) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md bg-amber-50 text-amber-700 border border-amber-200 text-[11px] sm:text-xs font-semibold whitespace-nowrap">
        <IconClock /> {formatted}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md bg-slate-100 text-slate-600 border border-slate-200 text-[11px] sm:text-xs font-medium whitespace-nowrap">
      <IconClock /> {formatted}
    </span>
  );
};

export default function TaskStudent() {
  const { id_class } = useParams();
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

  // Sumber pengumpulan: "file" atau "link" (submission_link) —
  // backend menolak kalau keduanya dikirim bersamaan
  const [attachmentMode, setAttachmentMode] = useState('file');
  const [submissionLink, setSubmissionLink] = useState("");

  const ITEMS_PER_PAGE = 6;
  const [currentPage, setCurrentPage] = useState(1);

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      "ngrok-skip-browser-warning": "69420",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  };

  const resolveAssignmentsEndpoint = async (mapelId) => {
    const cacheKey = "assignments_endpoint_pattern";
    const cachedPattern = localStorage.getItem(cacheKey);

    const candidates = [
      cachedPattern ? cachedPattern.replace(":id", mapelId) : null,
      `/api/students/mapel/${mapelId}/assignments`,
      `/api/me/mapel/${mapelId}/assignmentsTeacher`,
      `/api/students/${mapelId}/assignmentsTeacher`,
      `/api/teachers/mapel/${mapelId}/assignments`,
      `/api/me/class/${mapelId}/assignmentsTeacher`,
    ].filter(Boolean);

    for (const url of candidates) {
      try {
        const res = await fetch(url, {
          method: "GET",
          headers: getAuthHeaders(),
          credentials: "include",
        });
        const contentType = res.headers.get("content-type");
        const isJson = contentType && contentType.includes("application/json");

        if (res.ok && isJson) {
          const pattern = url.replace(String(mapelId), ":id");
          localStorage.setItem(cacheKey, pattern);
          const data = await res.json();
          return { ok: true, data, url };
        }
      } catch (e) {
        continue;
      }
    }

    return { ok: false, data: null, url: null };
  };

  const fetchTasks = async () => {
    const id_mapel = id_class;
    if (!id_mapel) return;

    try {
      setIsLoading(true);

      const { ok: teacherOk, data: teacherData } =
        await resolveAssignmentsEndpoint(id_mapel);

      let mySubmissions = [];
      try {
        const resStudent = await fetch(`/api/students/assignments`, {
          method: "GET",
          headers: getAuthHeaders(),
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

      if (teacherOk) {
        const teacherTasks = teacherData.data || [];
        const fetchedClassName =
          getPossibleClassName(teacherData) ||
          getPossibleClassName(teacherTasks[0]) ||
          "";
        if (fetchedClassName) {
          setClassTitle(fetchedClassName);
          localStorage.setItem(`classTitle_${id_mapel}`, fetchedClassName);
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
          const actualFileUrl = sub ? sub.file_url || sub.fileUrl || sub.file : null;

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
      } else {
        setAlertInfo({
          show: true,
          message: "Endpoint daftar tugas tidak ditemukan.",
          type: 'error',
        });
      }
    } catch (error) {
      setAlertInfo({ show: true, message: "Terjadi kesalahan jaringan.", type: 'error' });
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
    setAttachmentMode('file');
    setSubmissionLink("");
    setIsModalOpen(true);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleFileChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) {
      setDisplayFileName("");
      return;
    }
    // cek di sisi klien biar tidak sia-sia upload (backend juga menolak >100MB)
    if (file.size > MAX_FILE_SIZE) {
      e.target.value = "";
      setDisplayFileName("");
      setAlertInfo({ show: true, message: "File terlalu besar. Maksimum 100 MB.", type: 'error' });
      return;
    }
    setDisplayFileName(file.name);
  };

  const handleUpload = async () => {
    if (isDeadlinePassed(selectedTask?.deadline)) {
      setAlertInfo({ show: true, message: "Deadline sudah lewat.", type: 'error' });
      return;
    }

    // validasi sumber pengumpulan sesuai kontrak backend: wajib file ATAU link
    if (attachmentMode === 'link') {
      const link = submissionLink.trim();
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
    } else {
      const fileToUpload = fileInputRef.current?.files[0];
      if (!fileToUpload) {
        setAlertInfo({ show: true, message: "Wajib upload file atau isi link tugas!", type: 'error' });
        return;
      }
      if (fileToUpload.size > MAX_FILE_SIZE) {
        setAlertInfo({ show: true, message: "File terlalu besar. Maksimum 100 MB.", type: 'error' });
        return;
      }
    }

    try {
      setUploadLoading(true);
      const formdata = new FormData();
      formdata.append("title", selectedTask.title);
      formdata.append("id_mapel", id_class);

      // hanya kirim SALAH SATU — backend menolak kalau file & link dikirim bersamaan
      if (attachmentMode === 'link') {
        formdata.append("submission_link", submissionLink.trim());
      } else {
        formdata.append("file", fileInputRef.current.files[0]);
      }

      const response = await fetch(
        `/api/students/${selectedTask.id}/assignments`,
        {
          method: "POST",
          headers: getAuthHeaders(),
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
        setSubmissionLink("");
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

    if (isSubmissionGraded(task)) {
      setAlertInfo({ show: true, message: "Tugas sudah dinilai guru.", type: 'error' });
      return;
    }

    if (isDeadlinePassed(task.deadline)) {
      setAlertInfo({ show: true, message: "Deadline sudah lewat.", type: 'error' });
      return;
    }

    try {
      setDeleteLoadingId(task.submission_id);
      const response = await fetch(
        `/api/students/assignments/${task.submission_id}`,
        {
          method: "DELETE",
          headers: getAuthHeaders(),
          credentials: "include",
        }
      );

      if (response.ok) {
        setAlertInfo({ show: true, message: "Pengumpulan berhasil dibatalkan.", type: 'success' });
        fetchTasks();
      } else {
        const result = await response.json().catch(() => ({}));
        setAlertInfo({ show: true, message: result.message || "Gagal membatalkan.", type: 'error' });
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
    return "";
  }

  const totalPages = Math.ceil(tasks.length / ITEMS_PER_PAGE);
  const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
  const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
  const currentTasks = tasks.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleModalBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      setIsModalOpen(false);
    }
  };

  return (
    <MainLayoutStudent>
      {alertInfo.show && (
        <CustomAlert 
          message={alertInfo.message} 
          type={alertInfo.type} 
          onClose={() => setAlertInfo({ ...alertInfo, show: false })} 
        />
      )}

      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="min-w-0">
          <h1 className="text-lg sm:text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight truncate">
            Daftar Tugas {classTitle && `- ${classTitle}`}
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5 truncate">
            Selesaikan tugasmu tepat waktu sebelum batas pengumpulan berakhir.
          </p>
        </div>

        {/* Dynamic Card Grid */}
        {isLoading ? (
          <div className="py-24 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-4 border-slate-200 border-t-[#0d264f] rounded-full animate-spin"></div>
              <span className="text-xs font-semibold">Memuat daftar tugas...</span>
            </div>
          </div>
        ) : tasks.length === 0 ? (
          <div className="py-20 text-center bg-white rounded-2xl border border-slate-200 p-6">
            <p className="text-slate-500 text-sm font-medium">Belum ada tugas yang tersedia di kelas ini.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {currentTasks.map((task, index) => {
              const materiUrl = task.fileUrl?.startsWith('http')
                ? task.fileUrl
                : task.fileUrl
                ? `${API_URL}/${task.fileUrl}`
                : null;

              const studentSubmissionUrl = task.submission_file?.startsWith('http')
                ? task.submission_file
                : task.submission_file
                ? `${API_URL}/${task.submission_file}`
                : null;

              const targetID = task.id || task.id_assignment;
              const realIndex = index + 1 + indexOfFirstItem;

              const deadlinePassed = isDeadlinePassed(task.deadline);
              const graded = isSubmissionGraded(task);
              const displayGrade = getDisplayGrade(task);
              const isDeleting = deleteLoadingId === task.submission_id;

              return (
                <div
                  key={targetID || index}
                  className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between h-full space-y-4"
                >
                  {/* Top Section */}
                  <div className="space-y-3 min-w-0">
                    <div className="flex items-center justify-between gap-2 flex-wrap sm:flex-nowrap">
                      <span className="inline-flex items-center justify-center min-w-[28px] h-7 px-2 rounded-lg bg-slate-100 text-slate-700 font-bold text-xs flex-shrink-0">
                        #{realIndex}
                      </span>
                      {graded ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-200 truncate">
                          <IconAward /> Sudah Dinilai
                        </span>
                      ) : task.submission_id ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200 truncate">
                          <IconCheck /> Sudah Dikumpul
                        </span>
                      ) : deadlinePassed ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-50 text-red-600 text-xs font-bold border border-red-200 truncate">
                          Terlambat
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200 truncate">
                          Belum Dikerjakan
                        </span>
                      )}
                    </div>

                    {/* Title & Description */}
                    <div className="min-w-0">
                      <h3 className="font-extrabold text-slate-900 text-sm sm:text-base line-clamp-2 leading-snug break-words">
                        {task.title}
                      </h3>
                      <p className="text-slate-500 text-xs mt-1.5 line-clamp-3 leading-relaxed break-words">
                        {task.description || "Tidak ada deskripsi tambahan."}
                      </p>
                    </div>
                  </div>

                  {/* Bottom Section */}
                  <div className="pt-3 border-t border-slate-100 space-y-3 mt-auto">
                    <div className="flex flex-wrap items-center justify-between gap-1.5">
                      <span className="text-xs font-semibold text-slate-400">Deadline:</span>
                      <DeadlineBadge deadline={task.deadline} />
                    </div>

                    {graded && (
                      <div className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-indigo-50 border border-indigo-100">
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-700">
                          Nilai dari Guru :
                        </span>
                        {displayGrade !== null ? (
                          <span className="text-base font-extrabold text-indigo-800 leading-none">
                            {displayGrade}
                          </span>
                        ) : (
                          <span className="text-xs font-bold text-indigo-700">Selesai dinilai</span>
                        )}
                      </div>
                    )}

                    {materiUrl && isExternalLink(materiUrl) && (
                      <a
                        href={materiUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold border border-slate-200 transition-colors truncate"
                        title={materiUrl}
                      >
                        <IconPaperclip />
                        <span className="truncate">Buka Link Tugas</span>
                      </a>
                    )}

                    {materiUrl && !isExternalLink(materiUrl) && (
                      <button
                        onClick={() => setPreviewData({ url: materiUrl, title: "Materi Tugas" })}
                        className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold border border-slate-200 transition-colors truncate"
                      >
                        {getFileIcon(materiUrl)}
                        <span className="truncate">Lihat Materi Tugas</span>
                      </button>
                    )}

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 pt-1 min-w-0 flex-wrap sm:flex-nowrap">
                      {task.submission_id && isExternalLink(studentSubmissionUrl) && (
                        <a
                          href={studentSubmissionUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 py-2.5 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs rounded-xl border border-emerald-200 transition-colors flex items-center justify-center gap-1.5 truncate"
                          title={studentSubmissionUrl}
                        >
                          <IconPaperclip />
                          <span className="truncate">Buka Jawaban Saya</span>
                        </a>
                      )}

                      {task.submission_id && !isExternalLink(studentSubmissionUrl) && (
                        <button
                          onClick={() => setPreviewData({ url: studentSubmissionUrl, title: `Tugas Saya: ${task.title}` })}
                          disabled={!studentSubmissionUrl}
                          className="flex-1 py-2.5 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs rounded-xl border border-emerald-200 transition-colors flex items-center justify-center gap-1.5 truncate disabled:opacity-50"
                          title="Lihat file tugas yang telah dikumpulkan"
                        >
                          <IconEye />
                          <span className="truncate">Lihat Tugas Saya</span>
                        </button>
                      )}

                      {task.submission_id && !graded && !deadlinePassed && (
                        <button
                          onClick={() => handleDeleteSubmission(task)}
                          disabled={isDeleting}
                          className="p-2.5 rounded-xl border border-red-200 hover:bg-red-50 text-red-600 transition-colors disabled:opacity-50 flex-shrink-0"
                          aria-label="Batalkan Pengumpulan"
                          title="Batalkan Pengumpulan"
                        >
                          {isDeleting ? (
                            <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <IconTrash />
                          )}
                        </button>
                      )}

                      {!task.submission_id && !deadlinePassed && (
                        <button
                          onClick={() => handleOpenUploadModal(task)}
                          className="w-full py-2.5 bg-[#0d264f] hover:bg-blue-900 text-white font-bold text-xs rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 truncate"
                        >
                          <IconUpload />
                          <span className="truncate">Kumpulkan Tugas</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="px-4 sm:px-6 py-4 bg-white rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 font-medium shadow-sm">
            <div>
              Halaman <span className="font-bold text-slate-800">{currentPage}</span> dari <span className="font-bold text-slate-800">{totalPages}</span>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 disabled:opacity-40 font-bold transition-all inline-flex items-center gap-1 shadow-sm"
              >
                <IconChevronLeft /> Kembali
              </button>
              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 disabled:opacity-40 font-bold transition-all inline-flex items-center gap-1 shadow-sm"
              >
                Lanjut <IconChevronRight />
              </button>
            </div>
          </div>
        )}

      </div>

      {/* Modal Upload Tugas */}
      {isModalOpen && selectedTask && (
        <div
          onClick={handleModalBackdropClick}
          className="fixed inset-0 z-[9990] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh] cursor-default"
          >
            <div className="px-5 sm:px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="font-bold text-slate-800 text-base">Kumpulkan Tugas</h3>
            </div>

            <div className="p-5 sm:p-6 space-y-4 overflow-y-auto">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Judul Tugas
                </label>
                <p className="text-sm font-semibold text-slate-800 leading-snug break-words">{selectedTask.title}</p>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Sumber Jawaban
                </label>

                {/* Toggle File / Link */}
                <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl mb-3">
                  <button
                    type="button"
                    onClick={() => setAttachmentMode('file')}
                    className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
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
                    className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
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
                <>
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-slate-200 border-dashed rounded-xl cursor-pointer bg-slate-50/50 hover:bg-slate-100/60 hover:border-slate-300 transition-all group">
                    <div className="flex flex-col items-center justify-center p-4 text-center">
                      <div className="p-2.5 rounded-full bg-slate-100 group-hover:bg-slate-200/80 text-slate-600 transition-colors mb-2">
                        <IconUpload />
                      </div>
                      <p className="text-xs text-slate-600 font-medium">
                        <span className="font-bold text-blue-600 hover:underline">Klik untuk unggah</span> atau seret file ke sini
                      </p>
                      <p className="text-[10px] text-slate-400 mt-1">PDF, DOC/DOCX, PPT/PPTX, Video (MP4/MOV/WEBM), JPG, PNG, WEBP, GIF • maks 100 MB</p>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      className="hidden"
                      accept={ACCEPTED_FILE_TYPES}
                      onChange={handleFileChange}
                    />
                  </label>
                </div>
                {displayFileName && (
                  <div className="mt-3 flex items-center gap-2 bg-slate-100 p-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 min-w-0">
                    <IconPaperclip />
                    <span className="truncate flex-1">{displayFileName}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setDisplayFileName("");
                        if (fileInputRef.current) fileInputRef.current.value = "";
                      }}
                      className="text-slate-400 hover:text-red-500 transition-colors p-0.5 flex-shrink-0"
                      aria-label="Hapus file terpilih"
                    >
                      <IconX />
                    </button>
                  </div>
                )}
                </>
                ) : (
                <div className="space-y-2">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                      <IconPaperclip />
                    </div>
                    <input
                      type="url"
                      value={submissionLink}
                      onChange={(e) => setSubmissionLink(e.target.value)}
                      placeholder="https://drive.google.com/..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3.5 text-sm font-medium text-slate-800 focus:bg-white focus:border-[#0d264f] focus:ring-2 focus:ring-[#0d264f]/10 outline-none transition-all placeholder:text-slate-400"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400">
                    Tempelkan tautan jawaban tugas (Google Drive, YouTube, dsb). Harus diawali http:// atau https://
                  </p>
                </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 px-5 sm:px-6 py-4 bg-slate-50 border-t border-slate-100 mt-auto">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-200/60 rounded-xl transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleUpload}
                disabled={uploadLoading}
                className="px-6 py-2.5 bg-[#0d264f] hover:bg-blue-900 text-white font-bold text-sm rounded-xl transition-all shadow-sm flex items-center gap-2 disabled:opacity-50"
              >
                {uploadLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Mengunggah...</span>
                  </>
                ) : (
                  "Kirim"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Preview Berkas */}
      {previewData && (
        <PreviewModal
          fileUrl={previewData.url}
          title={previewData.title}
          onClose={() => setPreviewData(null)}
        />
      )}
    </MainLayoutStudent>
  );
}