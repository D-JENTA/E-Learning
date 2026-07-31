import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import MainLayout from "../../components/Admin/MainLayout";

const API_URL = import.meta.env.VITE_API_URL || "";

const IconArrowLeft = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
);

const IconX = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
);

const buildFileUrl = (fileUrl) => {
  if (!fileUrl) return "";
  const value = String(fileUrl).trim().replace(/\\/g, "/");

  if (/^https?:\/\//i.test(value) || value.startsWith("blob:") || value.startsWith("data:")) {
    return value;
  }

  const baseUrl = String(API_URL || "").replace(/\/+$/, "");
  const cleanPath = value.replace(/^\/+/, "");

  return baseUrl ? `${baseUrl}/${cleanPath}` : `/${cleanPath}`;
};

const getFileExtension = (fileUrl = "") => {
  const cleanUrl = String(fileUrl).split("#")[0].split("?")[0];
  const fileName = cleanUrl.substring(cleanUrl.lastIndexOf("/") + 1);
  return fileName.includes(".") ? fileName.split(".").pop().toLowerCase() : "";
};

const FilePreview = ({ fileUrl }) => {
  if (!fileUrl) return <p className="text-slate-400 italic text-sm">Tidak ada file.</p>;

  const ext = getFileExtension(fileUrl);

  if (["pdf", "doc", "docx", "ppt", "pptx", "xls", "xlsx"].includes(ext)) {
    const googleDocsUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(fileUrl)}&embedded=true`;

    return (
      <div className="flex flex-col gap-3 w-full">
        <div className="w-full h-[500px] rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
          <iframe src={googleDocsUrl} width="100%" height="100%" title="Document Viewer" className="w-full h-full" />
        </div>
        <div className="flex items-center justify-center gap-3 py-3 bg-amber-50 border border-amber-100 rounded-xl">
          <span className="text-amber-700 text-xs font-bold">Pratinjau tidak muncul?</span>
          <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="bg-amber-500 text-white px-4 py-2 rounded-lg font-bold text-xs hover:bg-amber-600 transition-all shadow-sm">
            Download / Buka Langsung
          </a>
        </div>
      </div>
    );
  }

  if (["jpg", "jpeg", "png", "webp", "gif"].includes(ext)) {
    return (
      <div className="flex justify-center bg-slate-50 rounded-xl p-2 border border-slate-200">
        <img src={fileUrl} alt="Preview" className="max-h-[70vh] rounded-lg object-contain shadow-sm" />
      </div>
    );
  }

  if (["mp4", "mov", "webm"].includes(ext)) {
    return (
      <div className="w-full rounded-xl overflow-hidden bg-black shadow-lg">
        <video controls className="w-full max-h-[70vh]">
          <source src={fileUrl} type={ext === "mov" ? "video/quicktime" : `video/${ext}`} />
          Browser Anda tidak mendukung pemutaran video.
        </video>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 py-12">
      <p className="text-slate-500 text-sm">Tipe file <strong>.{ext}</strong> tidak bisa dipratinjau.</p>
      <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-blue-700 transition-all shadow-md hover:shadow-lg">
        Download File
      </a>
    </div>
  );
};

const PreviewModal = ({ fileUrl, title, onClose }) => {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <span className="font-bold text-slate-700 text-sm uppercase tracking-wide">{title || "Pratinjau File"}</span>
          <div className="flex items-center gap-4">
            <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-blue-600 hover:text-blue-800">
              Buka di Tab Baru
            </a>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-200 text-slate-500 transition-colors">
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

export default function AdminStudentClassTasks() {
  const { id_user, id_class } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [studentInfo] = useState(location.state?.student || null);
  const [classData] = useState(location.state?.classData || null);
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [previewData, setPreviewData] = useState(null);

  const commonHeaders = {
    "ngrok-skip-browser-warning": "69420",
  };

  const fetchSubmissionForTask = async (assignmentId) => {
    try {
      const response = await fetch(`/api/students/${assignmentId}/assignments`, {
        method: "GET",
        headers: commonHeaders,
        credentials: "include",
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) return null;

      const submissions = result.data || result || [];
      const list = Array.isArray(submissions) ? submissions : [];

      return list.find((item) => Number(item.id_student) === Number(id_user)) || null;
    } catch {
      return null;
    }
  };

  const fetchTasks = async () => {
    try {
      setIsLoading(true);

      const response = await fetch(`/api/me/class/${id_class}/assignmentsTeacher`, {
        method: "GET",
        headers: commonHeaders,
        credentials: "include",
      });

      const result = await response.json();

      if (!response.ok) {
        alert(result.message || "Gagal mengambil tugas kelas.");
        return;
      }

      const teacherTasks = result.data || [];

      const mergedTasks = await Promise.all(
        teacherTasks.map(async (task) => {
          const assignmentId = task.id || task.id_assignment;
          const submission = await fetchSubmissionForTask(assignmentId);

          return {
            ...task,
            assignmentId,
            submission_id: submission?.id_assignmentStudent || submission?.id || null,
            submission_file: submission?.file_url || submission?.fileUrl || null,
            score: submission?.score ?? null,
            submittedAt: submission?.createdAt || null,
          };
        })
      );

      setTasks(mergedTasks);
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan saat mengambil tugas siswa.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [id_class, id_user]);

  return (
    <MainLayout>
      <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-full bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-[#0d264f] hover:border-slate-300 transition-all shadow-sm"
            title="Kembali"
          >
            <IconArrowLeft />
          </button>

          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Tugas Siswa</h1>
            <p className="text-slate-500 text-lg mt-1">
              {studentInfo?.username || `Siswa #${id_user}`} - {classData?.class_name || `Kelas #${id_class}`}
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-r from-[#0d264f] to-blue-800 rounded-2xl p-6 md:p-8 shadow-lg text-white">
          <span className="text-sm font-medium">Total Tugas: <span className="font-bold text-white">{tasks.length}</span></span>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[900px]">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-400 text-xs font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4 text-center w-16">No</th>
                  <th className="px-6 py-4">Informasi Tugas</th>
                  <th className="px-6 py-4 text-center">Materi</th>
                  <th className="px-6 py-4 text-center">Jawaban Siswa</th>
                  <th className="px-6 py-4 text-center">Nilai</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-50 text-sm">
                {isLoading ? (
                  <tr>
                    <td colSpan="5" className="py-24 text-center text-slate-400">Memuat tugas siswa...</td>
                  </tr>
                ) : tasks.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-24 text-center text-slate-400">Belum ada tugas di kelas ini.</td>
                  </tr>
                ) : (
                  tasks.map((task, index) => {
                    const materiUrl = buildFileUrl(task.fileUrl || task.file_url);
                    const jawabanUrl = buildFileUrl(task.submission_file);

                    return (
                      <tr key={task.assignmentId || index} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 text-center text-slate-400 font-medium">{index + 1}</td>

                        <td className="px-6 py-4">
                          <p className="font-bold text-slate-800">{task.title || task.assignment_title}</p>
                          <p className="text-xs text-slate-500 mt-1 max-w-md line-clamp-2">
                            {task.description || "Tidak ada deskripsi"}
                          </p>
                        </td>

                        <td className="px-6 py-4 text-center">
                          {materiUrl ? (
                            <button
                              onClick={() => setPreviewData({ url: materiUrl, title: "Materi Tugas" })}
                              className="px-4 py-2 rounded-lg font-bold text-xs bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100 transition-colors"
                            >
                              Lihat Materi
                            </button>
                          ) : (
                            <span className="text-slate-300 italic text-xs">Tanpa Materi</span>
                          )}
                        </td>

                        <td className="px-6 py-4 text-center">
                          {jawabanUrl ? (
                            <button
                              onClick={() => setPreviewData({ url: jawabanUrl, title: "Jawaban Siswa" })}
                              className="px-4 py-2 rounded-lg font-bold text-xs bg-blue-50 text-blue-600 border border-blue-100 hover:bg-blue-100 transition-colors"
                            >
                              Lihat Jawaban
                            </button>
                          ) : (
                            <span className="text-slate-400 text-xs font-semibold">Belum Mengumpulkan</span>
                          )}
                        </td>

                        <td className="px-6 py-4 text-center">
                          {task.score !== null && task.score !== undefined ? (
                            <span className="inline-flex px-3 py-1 rounded-lg bg-green-50 text-green-700 border border-green-100 text-xs font-bold">
                              {task.score}
                            </span>
                          ) : (
                            <span className="text-slate-300 italic text-xs">Belum Dinilai</span>
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
      </div>

      {previewData && (
        <PreviewModal
          fileUrl={previewData.url}
          title={previewData.title}
          onClose={() => setPreviewData(null)}
        />
      )}
    </MainLayout>
  );
}