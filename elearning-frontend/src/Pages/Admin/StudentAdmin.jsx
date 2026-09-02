import React, { useEffect, useState } from "react";
import MainLayout from "../../components/Admin/MainLayout";

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

const IconSearch = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
);

const IconTrash = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
);

const IconEdit = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
);

const IconX = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
);

// Modal edit user — kontrak BE: PUT /api/auth/user/update/:id
// Body { username?, email? }, hanya field non-kosong yang di-update.
// Error: 400 tidak ada field valid, 404 user tidak ditemukan, 409 email sudah dipakai.
const EditUserModal = ({ form, onChange, onSubmit, onClose, isSubmitting }) => (
  <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm">
    <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">
      <div className="flex items-start justify-between gap-4 px-6 pt-6 pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800">Edit Siswa</h2>
          <p className="text-sm text-slate-500 mt-0.5">Ubah nama atau email akun siswa ini.</p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="p-2 -mr-2 -mt-1 shrink-0 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          aria-label="Tutup"
        >
          <IconX />
        </button>
      </div>

      <form onSubmit={onSubmit} className="px-6 py-5 space-y-4">
        <div>
          <label htmlFor="edit-username" className="block text-sm font-semibold text-slate-700 mb-1.5">
            Nama Lengkap
          </label>
          <input
            id="edit-username"
            name="username"
            type="text"
            value={form.username}
            onChange={onChange}
            placeholder="Nama siswa"
            className="w-full px-4 py-3 rounded-lg bg-slate-50 border border-transparent outline-none transition-all text-slate-700 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
          <p className="mt-1 text-xs text-slate-400">Biarkan sama jika tidak ingin mengubah.</p>
        </div>

        <div>
          <label htmlFor="edit-email" className="block text-sm font-semibold text-slate-700 mb-1.5">
            Alamat Email
          </label>
          <input
            id="edit-email"
            name="email"
            type="email"
            value={form.email}
            onChange={onChange}
            placeholder="siswa@sekolah.sch.id"
            className="w-full px-4 py-3 rounded-lg bg-slate-50 border border-transparent outline-none transition-all text-slate-700 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
          <p className="mt-1 text-xs text-slate-400">Email harus belum dipakai akun lain.</p>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-5 py-3 rounded-xl font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Batal
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-3 rounded-xl bg-[#0d264f] text-white font-semibold shadow-sm hover:bg-[#0d203f] disabled:opacity-70 disabled:cursor-not-allowed active:scale-[0.98] transition-all"
          >
            {isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
        </div>
      </form>
    </div>
  </div>
);

export default function StudentAdmin() {
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [alertInfo, setAlertInfo] = useState({ show: false, message: '', type: 'success' });

  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({ username: "", email: "" });
  const [isEditSubmitting, setIsEditSubmitting] = useState(false);

  const BASE_URL = "/api/auth/users";

  const fetchStudents = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(BASE_URL);
      const result = await response.json();
      const studentList = result.filter((u) => u.role === "student");
      setStudents(studentList);
      enrichClasses();
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const enrichClasses = async () => {
    try {
      const classesRes = await fetch("/api/classes", { credentials: "include" });
      const classesJson = classesRes.ok ? await classesRes.json() : [];
      const classArr = Array.isArray(classesJson) ? classesJson : (classesJson.data ?? []);

      const pairLists = await Promise.all(
        classArr.map((c) => {
          const cname = c.class_name ?? c.name;
          return fetch(`/api/auth/users/${c.id_class ?? c.id}/students`, { credentials: "include" })
            .then((r) => (r.ok ? r.json() : []))
            .then((d) => {
              const list = Array.isArray(d) ? d : (d.data ?? []);
              const studs = list[0]?.Students ?? list;
              return (Array.isArray(studs) ? studs : []).map((s) => [s.id_student ?? s.id_user ?? s.id, cname]);
            })
            .catch(() => []);
        })
      );

      const byStudent = Object.fromEntries(pairLists.flat());
      setStudents((prev) =>
        prev.map((s) => {
          const cname = byStudent[s.id_user ?? s.id];
          return cname ? { ...s, class_name: cname } : s;
        })
      );
    } catch (err) {
      console.error("Enrich classes error:", err);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleEditClick = (student) => {
    setEditingUser(student);
    setEditForm({ username: student.username || "", email: student.email || "" });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const closeEditModal = () => {
    if (isEditSubmitting) return;
    setEditingUser(null);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingUser || isEditSubmitting) return;

    const userId = editingUser.id_user || editingUser.id;
    if (!userId) {
      setAlertInfo({ show: true, message: "ID Siswa tidak ditemukan", type: 'error' });
      return;
    }

    // Kontrak BE: field kosong/whitespace diabaikan; kalau tidak ada field
    // valid sama sekali, backend menolak dengan 400.
    const body = {};
    if (editForm.username.trim() !== "") body.username = editForm.username.trim();
    if (editForm.email.trim() !== "") body.email = editForm.email.trim();

    if (Object.keys(body).length === 0) {
      setAlertInfo({ show: true, message: "Isi minimal satu field (nama atau email).", type: 'error' });
      return;
    }

    setIsEditSubmitting(true);
    try {
      const response = await fetch(`/api/auth/user/update/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(body)
      });

      const result = await response.json().catch(() => null);

      if (response.ok) {
        setAlertInfo({
          show: true,
          message: "Data siswa berhasil diperbarui.",
          type: 'success'
        });
        setEditingUser(null);
        fetchStudents();
      } else {
        // 404 user tidak ditemukan, 409 email sudah dipakai, 400 tidak ada field valid
        const msg = result?.message || "Gagal memperbarui data siswa.";
        setAlertInfo({ show: true, message: msg, type: 'error' });
      }
    } catch (err) {
      console.error("Network Error:", err);
      setAlertInfo({ show: true, message: "Tidak bisa terhubung ke server.", type: 'error' });
    } finally {
      setIsEditSubmitting(false);
    }
  };

  // --- PERUBAHAN DI SINI: alert konfirmasi browser dihapus & notifikasi disesuaikan ---
  const handleDelete = async (student) => {
    const userId = student.id_user || student.id;
    if (!userId) {
      setAlertInfo({ show: true, message: "ID Siswa tidak ditemukan", type: 'error' });
      return;
    }

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
        headers: {
          "Accept": "application/json"
        }
      });

      const contentType = response.headers.get("content-type");

      if (response.ok) {
        setStudents((prev) => prev.filter((s) => (s.id_user || s.id) !== userId));
        setAlertInfo({ 
          show: true, 
          message: `Akun siswa ${student.username} berhasil dihapus.`, 
          type: 'success' 
        });
      } else {
        let errorMsg = "Gagal menghapus siswa.";
        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json();
          errorMsg = errorData.message || errorMsg;
        } else {
          console.error("Isi error dari server (Bukan JSON):", await response.text());
        }
        setAlertInfo({ show: true, message: errorMsg, type: 'error' });
      }
    } catch (err) {
      console.error("Network Error:", err);
      setAlertInfo({ show: true, message: "Tidak bisa terhubung ke server.", type: 'error' });
    }
  };

  const filteredStudents = students.filter((s) =>
    s.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderClassInfo = (student) => {
    const className = student.class_name || student.className || student.class?.class_name;
    const classes = student.classes || student.enrolled_classes;

    if (Array.isArray(classes) && classes.length > 0) {
      return (
        <div className="flex flex-wrap gap-1.5">
          {classes.map((cls, idx) => (
            <span key={idx} className="inline-flex items-center px-3 py-1 rounded-lg bg-sky-50 text-sky-700 text-xs font-semibold border border-sky-200">
              {typeof cls === 'string' ? cls : cls.class_name || cls.name}
            </span>
          ))}
        </div>
      );
    }

    if (className) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-lg bg-sky-50 text-sky-700 text-xs font-semibold border border-sky-200">
          {className}
        </span>
      );
    }

    return (
      <span className="inline-flex items-center px-3 py-1 rounded-lg bg-slate-100 text-slate-400 text-xs font-medium border border-slate-200">
        Belum Ada Kelas
      </span>
    );
  };

  return (
    <MainLayout>
      {alertInfo.show && (
        <CustomAlert 
          message={alertInfo.message} 
          type={alertInfo.type} 
          onClose={() => setAlertInfo({ ...alertInfo, show: false })} 
        />
      )}

      <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Manajemen Siswa</h1>
            <p className="text-slate-500 text-lg mt-1">Kelola data seluruh siswa terdaftar.</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 max-w-md">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
              <IconSearch />
            </div>
            <input
              type="text"
              placeholder="Cari nama siswa..."
              className="w-full pl-12 pr-4 py-3 rounded-lg bg-slate-50 border border-transparent focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-slate-700"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-4 md:hidden border-b border-slate-100 bg-slate-50 flex justify-between items-center">
            <span className="text-sm font-bold text-slate-500">Daftar Siswa ({filteredStudents.length})</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Siswa</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Kelas yang Diikuti</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <tr>
                    <td colSpan="3" className="px-6 py-20 text-center text-slate-400">
                      Memuat data siswa...
                    </td>
                  </tr>
                ) : filteredStudents.length > 0 ? (
                  filteredStudents.map((s) => (
                    <tr key={s.id_user || s.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-bold text-slate-800 text-lg">{s.username}</p>
                          <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide">Siswa Terdaftar</p>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        {renderClassInfo(s)}
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEditClick(s)}
                            className="p-2 text-slate-400 hover:text-[#0d264f] hover:bg-slate-100 rounded-lg transition-colors"
                            title="Edit Siswa"
                          >
                            <IconEdit />
                          </button>
                          <button
                            onClick={() => handleDelete(s)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Hapus Siswa"
                          >
                            <IconTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="px-6 py-12 text-center text-slate-400">
                      Tidak ada data siswa ditemukan.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      {editingUser && (
        <EditUserModal
          form={editForm}
          onChange={handleEditChange}
          onSubmit={handleEditSubmit}
          onClose={closeEditModal}
          isSubmitting={isEditSubmitting}
        />
      )}

      <style>{`
        @keyframes slideIn {
          from { opacity:0; transform: translateX(100%); }
          to { opacity: 1; transform: translateX(0); }
        }
        .animate-slideIn {
          animation: slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </MainLayout>
  );
}