import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import MainLayout from "../../components/Admin/MainLayout";

const IconArrowLeft = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
);

const IconBook = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
);

export default function AdminStudentClasses() {
  const { id_user } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const studentFromState = location.state?.student || null;

  const [studentInfo, setStudentInfo] = useState({
    id_user,
    username: studentFromState?.username || "Siswa",
    email: studentFromState?.email || "",
  });

  const [classes, setClasses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchStudentClasses = async () => {
    try {
      setIsLoading(true);
      setError("");

      const token = localStorage.getItem("admin_token") || localStorage.getItem("token");

      const headers = {
        Accept: "application/json",
        "ngrok-skip-browser-warning": "69420",
      };

      if (token) headers.Authorization = `Bearer ${token}`;

      const response = await fetch(`/api/users/${id_user}/class-details`, {
        method: "GET",
        headers,
        credentials: "include",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Gagal mengambil kelas siswa.");
      }

      const data = result.data || {};
      const classList = data.classes || data.Classes || [];

      setStudentInfo({
        id_user: data.id_user || id_user,
        username: data.name || data.username || studentFromState?.username || "Siswa",
        email: data.email || studentFromState?.email || "",
      });

      setClasses(Array.isArray(classList) ? classList : []);
    } catch (err) {
      console.error("Fetch kelas siswa error:", err);
      setError(err.message || "Terjadi kesalahan saat mengambil kelas siswa.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (id_user) fetchStudentClasses();
  }, [id_user]);

  const handleOpenClass = (classData) => {
    const idClass = classData.id_class || classData.id || classData.classId;

    if (!idClass) {
      alert("ID kelas tidak ditemukan.");
      return;
    }

    navigate(`/admin/admin-classes/${id_user}/${idClass}/tasks`, {
      state: {
        student: studentInfo,
        classData,
      },
    });
  };

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
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Kelas Siswa</h1>
            <p className="text-slate-500 text-lg mt-1">
              Kelas yang diikuti oleh {studentInfo.username}.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 max-w-xl">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Identitas Siswa</p>
          <p className="font-extrabold text-slate-800 text-lg">{studentInfo.username}</p>
          <p className="text-sm text-slate-400">{studentInfo.email || `ID Siswa: #${studentInfo.id_user}`}</p>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-r-xl font-medium">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-100 border-t-[#0d264f] mb-4"></div>
            <p className="text-slate-400 font-medium">Memuat kelas siswa...</p>
          </div>
        ) : classes.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-100">
            <div className="mx-auto w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 text-slate-300">
              <IconBook />
            </div>
            <p className="text-slate-400 font-medium">Siswa ini belum mengikuti kelas apa pun.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {classes.map((item) => {
              const idClass = item.id_class || item.id || item.classId;
              const className = item.class_name || item.className || item.name || "Tanpa Nama Kelas";
              const classCode = item.classCode || item.class_code || "N/A";

              return (
                <div
                  key={idClass}
                  onClick={() => handleOpenClass(item)}
                  className="group relative bg-white rounded-3xl shadow-sm border border-slate-100 p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden"
                >
                  <div className="absolute inset-0 bg-blue-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0"></div>

                  <div className="relative z-10">
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 group-hover:bg-white group-hover:shadow-sm flex items-center justify-center transition-all duration-300">
                        <IconBook />
                      </div>
                      <span className="text-[10px] font-bold text-blue-600 bg-blue-50 border border-blue-100 px-3 py-1 rounded-full">
                        Diikuti
                      </span>
                    </div>

                    <div className="mb-4">
                      <h3 className="text-xl font-bold text-slate-800 group-hover:text-blue-900 transition-colors truncate">
                        {className}
                      </h3>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">Kode:</span>
                        <span className="text-xs font-mono font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded border border-blue-200">
                          {classCode}
                        </span>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-xs text-slate-400 font-medium">Klik untuk lihat tugas</span>
                      <div className="text-blue-600 font-bold text-sm opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                        Buka
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </MainLayout>
  );
}