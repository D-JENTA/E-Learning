import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import MainLayoutTeacher from "../../components/Teacher/MainLayout";
import MainLayoutAdmin from "../../components/Admin/MainLayout";

const IconX = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
);

const IconRefresh = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
  </svg>
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

const FilePreview = ({ fileUrl }) => {
  if (!fileUrl) return <p className="text-slate-400 italic text-sm">Tidak ada file.</p>;

  const ext = fileUrl.split('?')[0].split('.').pop().toLowerCase();

  if (['pdf', 'doc', 'docx', 'ppt', 'pptx'].includes(ext)) {
    const googleDocsUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(fileUrl)}&embedded=true`;
    return (
      <div className="flex flex-col gap-3 w-full h-full">
        <div className="w-full h-[500px] rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
          <iframe
            src={googleDocsUrl}
            width="100%"
            height="100%"
            title="Document Viewer"
            className="w-full h-full"
          />
        </div>
        <div className="flex items-center justify-center gap-3 py-3 bg-amber-50 border border-amber-100 rounded-xl">
          <span className="text-amber-700 text-xs font-bold">Pratinjau tidak muncul?</span>
          <a
            href={fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-amber-500 text-white px-4 py-2 rounded-lg font-bold text-xs hover:bg-amber-600 transition-all shadow-sm"
          >
            Download / Buka Langsung
          </a>
        </div>
      </div>
    );
  }

  if (['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext)) {
    return (
      <div className="flex justify-center bg-slate-50 rounded-xl p-2 border border-slate-200">
        <img
          src={fileUrl}
          alt="Preview"
          className="max-h-[70vh] rounded-lg object-contain shadow-sm"
        />
      </div>
    );
  }

  if (['mp4', 'mov', 'webm'].includes(ext)) {
    return (
      <div className="w-full rounded-xl overflow-hidden bg-black shadow-lg">
        <video controls className="w-full max-h-[70vh]">
          <source src={fileUrl} type="video/mp4" />
          <source src={fileUrl} type={`video/${ext}`} />
          Browser Anda tidak mendukung pemutaran video.
        </video>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 py-12">
      <div className="p-4 bg-slate-100 rounded-full text-slate-400">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
      <p className="text-slate-500 text-sm">Tipe file <strong>.{ext}</strong> tidak bisa dipratinjau.</p>
      <a
        href={fileUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-blue-700 transition-all shadow-md hover:shadow-lg"
      >
        Download File
      </a>
    </div>
  );
};

const PreviewModal = ({ fileUrl, onClose }) => {
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-scale-up">
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <span className="font-bold text-slate-700 text-sm uppercase tracking-wide">Pratinjau File Siswa</span>
          <div className="flex items-center gap-4">
            <a
              href={fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              Buka di Tab Baru 
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-slate-200 text-slate-500 transition-colors"
            >
              <IconX />
            </button>
          </div>
        </div>
        <div className="p-4 overflow-y-auto custom-scrollbar flex-1 bg-slate-50">
          <div className="bg-white rounded-xl p-2 shadow-sm min-h-[300px] flex items-center justify-center">
            <FilePreview fileUrl={fileUrl} />
          </div>
        </div>
      </div>
    </div>
  );
};

const GradeModal = ({ isOpen, submission, onClose, onSave }) => {
  const [score, setScore] = useState(submission?.score ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    setScore(submission?.score ?? "");
    setErrorMessage("");
  }, [submission]);

  if (!isOpen || !submission) return null;

  const submitScore = async () => {
    const id_submission = submission.id || submission.id_assignmentStudent;
    const numScore = parseInt(score);

    if (isNaN(numScore) || numScore < 0 || numScore > 100) {
      return setErrorMessage("Masukkan nilai antara 0 - 100!");
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const response = await fetch(`/api/assignment/${id_submission}/score`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({ score: numScore }),
        credentials: "include",
      });

      const result = await response.json().catch(() => null);

      if (!response.ok) throw new Error(result?.message || `Gagal menyimpan (Status: ${response.status})`);

      onSave(id_submission, numScore);
      onClose();
    } catch (err) {
      console.error("DEBUG GRADE SUBMIT:", err);
      setErrorMessage(err.message || "Gagal menyimpan nilai.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <div className="text-center mb-4">
          <h3 className="text-lg font-bold">Input Nilai Siswa</h3>
        </div>

        <div className="mb-4">
          <label className="block text-[11px] font-black uppercase text-slate-400 mb-2">Skor Akhir (0-100)</label>
          <input
            type="number"
            min="0"
            max="100"
            value={score}
            onChange={(e) => { setScore(e.target.value); setErrorMessage(""); }}
            placeholder="0"
            className="w-full bg-slate-50 border-slate-100 rounded-xl px-4 py-3 text-2xl font-bold text-center"
          />
        </div>

        {errorMessage && (
          <p className="text-red-500 text-sm font-bold mb-3">{errorMessage}</p>
        )}

        <div className="flex gap-3">
          <button
            onClick={submitScore}
            disabled={isSubmitting}
            className={`flex-1 py-3 rounded-xl font-bold ${isSubmitting ? 'bg-slate-100 text-slate-300' : 'bg-[#0D264F] text-white hover:bg-blue-900'}`}>
            {isSubmitting ? 'Menyimpan...' : 'Simpan Nilai'}
          </button>
          <button onClick={onClose} className="flex-0 px-4 py-3 rounded-xl font-bold text-slate-500 bg-slate-50">Batal</button>
        </div>
      </div>
    </div>
  );
};

const getFileBadge = (fileUrl) => {
  if (!fileUrl) return null;
  const ext = fileUrl.split('?')[0].split('.').pop().toLowerCase();

  let icon = <IconFileGeneric />;
  let label = "Lihat File";

  if (['jpg','jpeg','png','webp','gif'].includes(ext)) {
    icon = <IconImage />; label = "Lihat Gambar";
  } else if (['mp4','mov','webm'].includes(ext)) {
    icon = <IconVideo />; label = "Lihat Video";
  } else if (ext === 'pdf') {
    icon = <IconPdf />; label = "Lihat PDF";
  } else if (['doc','docx','ppt','pptx'].includes(ext)) {
    icon = <IconFileGeneric />; label = "Lihat Dokumen";
  }

  return { icon, label };
};

const getStudentName = (item) => {
  return (
    item.Student?.username ||
    item.student?.username ||
    item.User?.username ||
    item.user?.username ||
    item.Student?.name ||
    item.student?.name ||
    item.User?.name ||
    item.user?.name ||
    item.username ||
    item.name ||
    "Siswa"
  );
};

export default function StudentSubmissions({ user }) {
  const { id_assignment } = useParams();

  const isAdmin = user?.role === "superAdmin";
  const Layout = isAdmin ? MainLayoutAdmin : MainLayoutTeacher;

  const [submissions, setSubmissions] = useState([]);
  const [taskTitle, setTaskTitle] = useState("Memuat Judul..."); 
  const [isLoading, setIsLoading] = useState(true);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [gradeModalOpen, setGradeModalOpen] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);

  const ITEMS_PER_PAGE_DESKTOP = 6;
  const ITEMS_PER_PAGE_MOBILE = 3;

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(window.innerWidth >= 768 ? ITEMS_PER_PAGE_DESKTOP : ITEMS_PER_PAGE_MOBILE);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  useEffect(() => {
    const handleResize = () => {
      setItemsPerPage(window.innerWidth >= 768 ? ITEMS_PER_PAGE_DESKTOP : ITEMS_PER_PAGE_MOBILE);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const loadTaskTitleFromStorage = useCallback(() => {
    try {
      const storageKey = `task_title_${id_assignment}`;
      const savedTitle = localStorage.getItem(storageKey);

      if (savedTitle) {
        setTaskTitle(savedTitle);
      } else {
        setTaskTitle(`Tugas #${id_assignment}`);
      }
    } catch (error) {
      console.error("Gagal akses localStorage:", error);
      setTaskTitle(`Tugas #${id_assignment}`);
    }
  }, [id_assignment]);

  const fetchSubmissions = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/teachers/assignments/${id_assignment}`, {
        method: "GET",
        credentials: "include",
        headers: { "ngrok-skip-browser-warning": "69420" },
      });

      const result = await response.json();
      setSubmissions(result.data || []);
    } catch (err) {
      console.error("Gagal fetch:", err);
    } finally {
      setIsLoading(false);
    }
  }, [id_assignment]);

  useEffect(() => {
    if (id_assignment) {
      loadTaskTitleFromStorage(); 
      fetchSubmissions();
    }
  }, [id_assignment, loadTaskTitleFromStorage, fetchSubmissions]);

  const totalPages = Math.ceil(submissions.length / itemsPerPage);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentSubmissions = submissions.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openGradeModal = (submission) => {
    if (isAdmin) return;
    setSelectedSubmission(submission);
    setGradeModalOpen(true);
  };

  const closeGradeModal = () => {
    setSelectedSubmission(null);
    setGradeModalOpen(false);
  };

  const handleSaveScore = (submissionId, newScore) => {
    setSubmissions((prev) => prev.map((s) => {
      const sid = s.id || s.id_assignmentStudent;
      if (sid === submissionId) return { ...s, score: newScore };
      return s;
    }));
  };

  return (
    <Layout>
      <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 animate-fade-in-up">

        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">Pengumpulan Tugas</h1>
            {isAdmin && (
              <span className="ml-1 text-[10px] font-bold uppercase tracking-wide text-amber-700 bg-amber-100 px-2 py-1 rounded-md">
                Mode Admin • Lihat Saja
              </span>
            )}
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
             <p className="text-slate-500 text-base font-medium">
               {isAdmin ? "Lihat pengumpulan tugas siswa untuk tugas ini." : "Lihat dan beri nilai untuk tugas ini."}
             </p>
             <button 
                onClick={fetchSubmissions}
                className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 hover:text-[#0d264f] hover:border-slate-300 transition-all w-full md:w-auto"
              >
                <IconRefresh />
                Refresh
              </button>
          </div>
        </div>

        <div className="bg-gradient-to-r from-[#0d264f] to-blue-800 rounded-2xl p-6 md:p-8 shadow-lg text-white">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="max-w-full md:max-w-[70%]">
                    <span className="text-xs font-bold uppercase tracking-widest text-blue-200 mb-1 block">Judul Tugas</span>
                    <h2 className="text-xl md:text-3xl font-bold leading-tight break-words">{taskTitle}</h2>
                </div>
                <div className="bg-white/10 px-4 py-2 rounded-lg border border-white/20 backdrop-blur-sm flex-shrink-0">
                    <span className="text-sm font-medium">Total Pengumpulan: <span className="font-bold text-white">{submissions.length}</span> Siswa</span>
                </div>
            </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto md:overflow-visible">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 border-b border-slate-100 text-slate-400 text-xs font-bold uppercase tracking-wider hidden md:table-header-group">
                  <tr>
                    <th className="px-6 py-4 text-center w-16">No</th>
                    <th className="px-6 py-4">Nama Siswa</th>
                    <th className="px-6 py-4">File Tugas</th>
                    <th className="px-6 py-4 text-center">Skor</th>
                    {!isAdmin && <th className="px-6 py-4 text-center">Aksi</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-sm">
                  {isLoading ? (
                    <tr>
                      <td colSpan={isAdmin ? 4 : 5} className="py-24 text-center text-slate-400">
                        <div className="flex flex-col items-center gap-3">
                          <div className="w-8 h-8 border-4 border-slate-100 border-t-[#0d264f] rounded-full animate-spin"></div>
                          <span>Memuat data pengumpulan...</span>
                        </div>
                      </td>
                    </tr>
                  ) : submissions.length === 0 ? (
                    <tr>
                      <td colSpan={isAdmin ? 4 : 5} className="py-24 text-center text-slate-400">
                        <div className="flex flex-col items-center gap-3">
                          <div className="p-3 bg-slate-50 rounded-full text-slate-300">
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6l2 2zm2 2h.01" />
                             </svg>
                          </div>
                          <span>Belum ada siswa yang mengumpulkan tugas.</span>
                        </div>
                      </td>
                    </tr>
                  ) : currentSubmissions.map((item, index) => {
                    const fileUrl = item.fileUrl || item.file_url;
                    const finalLink = fileUrl?.startsWith('http')
                      ? fileUrl
                      : `${API_URL}/${fileUrl}`;
                    const badge = getFileBadge(fileUrl);
                    const targetID = item.id || item.id_assignmentStudent;
                    const realIndex = index + 1 + indexOfFirstItem;
                    const studentName = getStudentName(item);

                    return (
                      <tr key={targetID || index} className="hover:bg-slate-50/50 transition-colors group border-b border-slate-100 last:border-0">

                        {/* MOBILE VIEW */}
                        <td className="p-4 md:hidden block w-full">
                            <div className="flex items-center justify-between mb-2">
                                <span className="font-bold text-slate-900 text-base">#{realIndex}</span>
                                {badge ? (
                                  <button
                                    onClick={() => setPreviewUrl(finalLink)}
                                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg font-bold text-xs bg-blue-50 text-blue-600 border border-blue-100"
                                  >
                                    {badge.icon} {badge.label}
                                  </button>
                                ) : <span className="text-slate-300 text-xs">Tidak ada file</span>}
                            </div>
                            <div className="mb-3">
                                <span className="text-xs font-bold text-slate-400 uppercase">Nama Siswa</span>
                                <p className="font-bold text-slate-800 mt-1">{studentName}</p>
                            </div>
                            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                                <div className="flex flex-col">
                                    <span className="text-xs font-bold text-slate-400 uppercase">Skor</span>
                                    <span className={`text-lg font-bold ${item.score ? 'text-slate-800' : 'text-slate-300'}`}>
                                      {item.score ?? "-"} <span className="text-xs text-slate-400 font-normal">/ 100</span>
                                    </span>
                                </div>
                                {!isAdmin && (
                                  <button
                                    onClick={() => openGradeModal(item)}
                                    className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl font-bold text-xs bg-[#0d264f] text-white hover:bg-blue-900 transition-all shadow-sm"
                                  >
                                    {item.score ? "Edit Nilai" : "Beri Nilai"}
                                  </button>
                                )}
                            </div>
                        </td>

                        {/* DESKTOP VIEW */}
                        <td className="px-6 py-4 text-center text-slate-400 font-medium hidden md:table-cell">{realIndex}</td>

                        <td className="px-6 py-4 hidden md:table-cell">
                          <div className="flex items-center gap-3">
                              <span className="font-bold text-slate-800">{studentName}</span>
                          </div>
                        </td>

                        <td className="px-6 py-4 hidden md:table-cell">
                          {badge ? (
                            <button
                              onClick={() => setPreviewUrl(finalLink)}
                              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors border border-blue-100"
                            >
                              {badge.icon}
                              <span>{badge.label}</span>
                            </button>
                          ) : (
                            <span className="text-slate-300 italic text-xs">Kosong</span>
                          )}
                        </td>

                        <td className="px-6 py-4 text-center hidden md:table-cell">
                          <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-50 border border-slate-200">
                              <span className={`text-lg font-bold ${item.score ? 'text-slate-800' : 'text-slate-300'}`}>
                                {item.score ?? "-"}
                              </span>
                              <span className="text-xs text-slate-400 font-medium">/ 100</span>
                          </div>
                        </td>

                        {!isAdmin && (
                          <td className="px-6 py-4 text-center hidden md:table-cell">
                            <button
                              onClick={() => openGradeModal(item)}
                              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs bg-[#0d264f] text-white hover:bg-blue-900 transition-all shadow-sm hover:shadow-md"
                            >
                              {item.score ? "Edit Nilai" : "Beri Nilai"}
                            </button>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
        </div>

        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-8 pb-4">
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

      </div>

      {previewUrl && (
        <PreviewModal fileUrl={previewUrl} onClose={() => setPreviewUrl(null)} />
      )}

      {!isAdmin && gradeModalOpen && (
        <GradeModal
          isOpen={gradeModalOpen}
          submission={selectedSubmission}
          onClose={closeGradeModal}
          onSave={handleSaveScore}
        />
      )}
    </Layout>
  );
}