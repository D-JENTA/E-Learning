import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import MainLayoutTeacher from "../../components/Teacher/MainLayout";


// --- KOMPONEN NOTIFIKASI TOAST (Universal & Bisa di-close) ---
const CustomAlert = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
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
// -----------------------------------------------------------


const IconArrowLeft = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
);

const IconX = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
);

const IconEye = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
);

const IconTrash = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
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

const API_URL = import.meta.env.VITE_API_URL;

const getFileExtension = (fileUrl = "") => {
  const cleanUrl = String(fileUrl).split("#")[0].split("?")[0];
  const fileName = cleanUrl.substring(cleanUrl.lastIndexOf("/") + 1);
  return fileName.includes(".") ? fileName.split(".").pop().toLowerCase() : "";
};

const safeEncodeUrl = (url = "") => {
  try {
    return encodeURI(decodeURI(url));
  } catch {
    return url;
  }
};

const buildFileUrl = (filePath) => {
  if (!filePath) return "";
  let value = String(filePath).trim().replace(/\\/g, "/");
  if (value.startsWith("http://res.cloudinary.com")) {
    value = value.replace("http://res.cloudinary.com", "https://res.cloudinary.com");
  }
  if (/^(https?:)?\/\//i.test(value) || value.startsWith("blob:") || value.startsWith("data:")) {
    return safeEncodeUrl(value);
  }
  const baseUrl = String(API_URL || "").replace(/\/+$/, "");
  const cleanPath = value.replace(/^\/+/, "");
  return safeEncodeUrl(baseUrl ? `${baseUrl}/${cleanPath}` : `/${cleanPath}`);
};

const getMimeType = (ext) => ({
  mp4: "video/mp4",
  mov: "video/quicktime",
  webm: "video/webm",
}[ext] || "video/mp4");

const PreviewModal = ({ fileUrl, onClose }) => {
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  useEffect(() => {
    const handleKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  if (!fileUrl) return null;

  const ext = getFileExtension(fileUrl);
  const isPdf = ext === "pdf";
  const isImage = ["jpg", "jpeg", "png", "webp", "gif"].includes(ext);
  const isVideo = ["mp4", "mov", "webm"].includes(ext);
  const isDocument = ["doc", "docx", "ppt", "pptx", "xls", "xlsx"].includes(ext);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in" onClick={handleBackdropClick}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-scale-up">
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <span className="font-bold text-slate-700 text-sm uppercase tracking-wide">Pratinjau File</span>
          <div className="flex items-center gap-4">
            <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1">
              Buka di Tab Baru
            </a>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-200 text-slate-500 transition-colors">
              <IconX />
            </button>
          </div>
        </div>
        <div className="p-4 overflow-y-auto custom-scrollbar flex-1 bg-slate-50">
          <div className="bg-white rounded-xl p-2 shadow-sm min-h-[300px] flex items-center justify-center">
            {isPdf || isDocument ? (
              <div className="flex flex-col gap-3 w-full h-full">
                <iframe 
                  src={`https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(fileUrl)}`} 
                  className="w-full h-[500px] rounded-lg border border-slate-200"
                  title="Document Viewer"
                />
                <div className="flex items-center justify-center gap-3 py-3 bg-amber-50 border border-amber-100 rounded-xl">
                  <span className="text-amber-700 text-xs font-bold">Pratinjau tidak muncul?</span>
                  <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="bg-amber-500 text-white px-4 py-2 rounded-lg font-bold text-xs hover:bg-amber-600 transition-all shadow-sm">
                    Download / Buka Langsung
                  </a>
                </div>
              </div>
            ) : isImage ? (
              <img 
                src={fileUrl} 
                alt="Preview" 
                className="max-h-[70vh] rounded-lg object-contain shadow-sm animate-fade-in" 
              />
            ) : isVideo ? (
              <video controls className="w-full max-h-[70vh] rounded-lg bg-black">
                <source src={fileUrl} type={getMimeType(ext)} />
                Browser Anda tidak mendukung pemutaran video.
              </video>
            ) : (
              <div className="flex flex-col items-center gap-4 py-12">
                <p className="text-slate-500 text-sm">Tipe file <strong>.{ext || "tidak diketahui"}</strong> tidak bisa dipratinjau.</p>
                <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-blue-700 transition-all shadow-md hover:shadow-lg">
                  Download File
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const DescriptionText = ({ text }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const description = text || "Tidak ada deskripsi";

  if (!text || text.length <= 150) {
    return (
      <div className="border border-slate-200 rounded-2xl bg-slate-50 p-4 text-sm leading-relaxed text-slate-500 break-words whitespace-pre-wrap">
        {description}
      </div>
    );
  }

  return (
    <div className="space-y-3 text-sm">
      <div className={`border border-slate-200 rounded-2xl bg-slate-50 p-4 transition-all duration-300 overflow-hidden ${!isExpanded ? 'max-h-24' : ''}`}>
        <p className="text-slate-500 leading-relaxed break-words whitespace-pre-wrap">
          {description}
        </p>
      </div>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="text-blue-600 font-bold text-xs hover:underline focus:outline-none"
      >
        {isExpanded ? "Lebih Sedikit" : "Lebih Banyak"}
      </button>
    </div>
  );
};

export default function TeacherAssignments() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [alertInfo, setAlertInfo] = useState({ show: false, message: '', type: 'success' });
  const [previewUrl, setPreviewUrl] = useState(null);

  const ITEMS_PER_PAGE_DESKTOP = 6;
  const ITEMS_PER_PAGE_MOBILE = 3;
  
  const [currentPage, setCurrentPage] = useState(1);

  const fetchAssignments = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/me/class/${id}/assignmentsTeacher`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "69420",
        },
        credentials: "include",
      });

      const result = await response.json();
      console.log("ASSIGNMENTS API RESULT:", result);

      if (response.ok) {
        setAssignments(result.data || []);
      } else {
        setError(result.message || "Gagal mengambil data tugas.");
      }
    } catch (err) {
      console.error("Fetch Error:", err);
      setError("Koneksi ke server gagal.");
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) fetchAssignments();
  }, [id, fetchAssignments]);

  const itemsPerPage = window.innerWidth >= 768 ? ITEMS_PER_PAGE_DESKTOP : ITEMS_PER_PAGE_MOBILE;
  const totalPages = Math.ceil(assignments.length / itemsPerPage);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentAssignments = assignments.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFileAction = (e, url) => {
    e.preventDefault();
    e.stopPropagation();
    setPreviewUrl(url);
  };

  const handleDelete = async (id_assignment) => {
    if (!id_assignment) {
      setAlertInfo({ show: true, message: "ID tugas tidak ditemukan!", type: 'error' });
      return;
    }
    
    // DIHAPUS: window.confirm("Apakah Anda yakin ingin menghapus tugas ini?")
    // Langsung hapus tanpa konfirmasi bawaan chrome

    try {
      const response = await fetch(`/api/teachers/assignments/${id_assignment}`, {
        method: "DELETE",
        headers: { "ngrok-skip-browser-warning": "69420" },
        credentials: "include",
      });

      if (response.ok) {
        setAlertInfo({ show: true, message: "Tugas berhasil dihapus.", type: 'success' });
        fetchAssignments(); 
      } else {
        const result = await response.json().catch(() => ({}));
        setAlertInfo({ show: true, message: result.message || "Terjadi kesalahan server.", type: 'error' });
      }
    } catch (err) {
      setAlertInfo({ show: true, message: "Terjadi kesalahan jaringan.", type: 'error' });
    }
  };

  const getFileIcon = (ext) => {
    if (["jpg", "jpeg", "png", "webp", "gif"].includes(ext)) return <IconImage />;
    if (["mp4", "mov", "webm"].includes(ext)) return <IconVideo />;
    if (ext === "pdf") return <IconPdf />;
    return <IconFileGeneric />;
  };

  return (
    <MainLayoutTeacher>
      {/* Custom Alert */}
      {alertInfo.show && (
        <CustomAlert 
          message={alertInfo.message} 
          type={alertInfo.type} 
          onClose={() => setAlertInfo({ ...alertInfo, show: false })} 
        />
      )}

      <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 animate-fade-in-up">
        
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="p-2 rounded-full bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-[#0d264f] hover:border-slate-300 transition-all shadow-sm" title="Kembali">
              <IconArrowLeft />
            </button>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">Daftar Tugas Kelas</h1>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pl-11 md:pl-11">
            <p className="text-slate-500 text-base font-medium">Kelola tugas dan materi untuk kelas ini.</p>
            <Link to={`/teacher/upload-task/${id}`} className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-white bg-[#0d264f] hover:bg-blue-900 shadow-md hover:shadow-lg transition-all font-bold w-full md:w-auto">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              Buat Tugas Baru
            </Link>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-r-xl font-medium">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center items-center py-20 text-slate-400">
            <p>Memuat data tugas...</p>
          </div>
        ) : assignments.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-12 text-center text-slate-400">
            Belum ada tugas dibuat di kelas ini.
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
              {currentAssignments.map((task, index) => {
                const targetID = task.id || task.id_assignment;
                const originalFileUrl = task.fileUrl || task.file_url;
                const fileLink = buildFileUrl(originalFileUrl);
                const ext = getFileExtension(originalFileUrl);
                
                let fileLabel = "Lihat File";
                if (["jpg", "jpeg", "png", "webp", "gif"].includes(ext)) fileLabel = "Lihat Gambar";
                else if (["mp4", "mov", "webm"].includes(ext)) fileLabel = "Lihat Video";
                else if (ext === "pdf") fileLabel = "Lihat PDF";
                else if (["doc", "docx", "ppt", "pptx", "xls", "xlsx"].includes(ext)) fileLabel = "Lihat Dokumen";

                return (
                  <article key={targetID || index} className="group bg-white rounded-2xl border border-slate-200 hover:border-blue-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden relative">
                    <div className="p-5 border-b border-slate-100 flex justify-between items-start gap-3 bg-slate-50/50 group-hover:bg-white transition-colors">
                      <h3 className="text-xl font-bold text-slate-900 leading-tight line-clamp-2">
                        {task.title}
                      </h3>
                      <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-md whitespace-nowrap group-hover:text-slate-500 transition-colors">
                        #{index + 1 + indexOfFirstItem}
                      </span>
                    </div>
                    <div className="p-5 flex-1 flex flex-col gap-4">
                      <div className="min-h-[60px]">
                        <DescriptionText text={task.description} />
                      </div>

                      <div className="bg-slate-50 border border-dashed border-slate-200 rounded-xl p-4 flex flex-col items-center justify-center text-center group-hover:border-blue-200 group-hover:bg-blue-50/30 transition-colors">
                        {originalFileUrl ? (
                          <button 
                            onClick={(e) => handleFileAction(e, fileLink)}
                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg font-bold text-xs bg-white text-slate-700 hover:text-blue-600 hover:bg-blue-50 transition-all border border-slate-200 hover:border-blue-200 w-full justify-center shadow-sm"
                          >
                            {getFileIcon(ext)}
                            <span>{fileLabel}</span>
                          </button>
                        ) : (
                          <span className="text-slate-300 italic text-xs">Tanpa File</span>
                        )}
                      </div>
                    </div>
                    <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex flex-col sm:flex-row gap-3 items-center justify-between">
                      

                    <Link 
                        to={`/teacher/submissions/${id}/${targetID}`} 
                          onClick={() => {
                          const storageKey = `task_title_${targetID}`;
                          localStorage.setItem(storageKey, task.title);
                          }}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-bold text-xs bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all border border-indigo-100 hover:border-indigo-600"
                      >
                      <IconEye /> Lihat Pengumpulan
                    </Link>

                      <button 
                        onClick={() => handleDelete(targetID)} 
                        className="p-2.5 rounded-lg text-red-500 bg-red-50 hover:bg-red-600 hover:text-white hover:shadow-md hover:shadow-red-200 transition-all duration-300 border border-red-100"
                        title="Hapus Tugas"
                      >
                        <IconTrash />
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-10 pb-4">
                <button 
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-100 hover:text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
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
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {previewUrl && (
        <PreviewModal fileUrl={previewUrl} onClose={() => setPreviewUrl(null)} />
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
    </MainLayoutTeacher>
  );
}