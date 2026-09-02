import React, { useEffect, useState } from "react";
import MainLayout from "../../components/Admin/MainLayout";
import CustomSelect from "../../components/Admin/CustomSelect";

// --- KOMPONEN NOTIFIKASI TOAST (Custom Alert) ---
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
// ---------------------------------------------------

const IconSearch = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
);

const IconTrash = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
);

const IconEdit = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
);

const IconPlus = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
);

const EMPTY_TEACHER_FORM = { username: "", email: "", nip: "", id_mapel: "" };

const ERROR_MESSAGES = {
  "all fields must be filled in": "Semua kolom wajib diisi",
  "mapel not found": "Mata pelajaran tidak ditemukan",
  "This mapel already has a teacher assigned": "Mapel ini sudah memiliki guru",
  "NIP is already used": "NIP sudah terdaftar",
  "email is registered, please log in": "Email sudah terdaftar, silakan login",
  "server error": "Terjadi kesalahan server",
};

const translateError = (message) => ERROR_MESSAGES[message] || message;

const FormField = ({ label, name, value, onChange, error, placeholder, maxLength, type = "text", hint }) => (
  <div>
    <label htmlFor={name} className="block text-sm font-semibold text-slate-700 mb-1.5">
      {label}
    </label>
    <input
      id={name}
      name={name}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      maxLength={maxLength}
      className={`w-full px-4 py-3 rounded-lg bg-slate-50 border outline-none transition-all text-slate-700 focus:bg-white focus:ring-2 ${
        error
          ? "border-red-300 focus:border-red-500 focus:ring-red-100"
          : "border-transparent focus:border-blue-500 focus:ring-blue-100"
      }`}
    />
    {error ? (
      <p className="mt-1 text-xs font-medium text-red-500">{error}</p>
    ) : hint ? (
      <p className="mt-1 text-xs text-slate-400">{hint}</p>
    ) : null}
  </div>
);

export default function TeacherAdmin() {
  const [teachers, setTeachers] = useState([]);
  const [mapels, setMapels] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [alertInfo, setAlertInfo] = useState({ show: false, message: '', type: 'success' });

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newTeacher, setNewTeacher] = useState(EMPTY_TEACHER_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({ username: "", email: "" });
  const [isEditSubmitting, setIsEditSubmitting] = useState(false);

  const BASE_URL = "/api/auth/users";

  const fetchTeachers = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(BASE_URL);
      const result = await response.json();

      const teacherList = result.filter((u) => u.role === "teacher");
      setTeachers(teacherList);
      enrichSubjects();
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const enrichSubjects = async () => {
    try {
      const classesRes = await fetch("/api/classes", { credentials: "include" });
      const classesJson = classesRes.ok ? await classesRes.json() : [];
      const classArr = Array.isArray(classesJson) ? classesJson : (classesJson.data ?? []);

      const mapelLists = await Promise.all(
        classArr.map((c) =>
          fetch(`/api/classes/${c.id_class ?? c.id}/mapels`, { credentials: "include" })
            .then((r) => (r.ok ? r.json() : []))
            .then((d) => {
              if (Array.isArray(d)) return d;
              if (Array.isArray(d?.data)) return d.data;
              if (d && typeof d === "object") return Object.values(d).flat();
              return [];
            })
            .catch(() => [])
        )
      );

      const byTeacherName = {};
      mapelLists.flat().forEach((m) => {
        if (!m?.teacher_name || !m.mapel_name) return;
        const key = m.teacher_name.trim().toLowerCase();
        (byTeacherName[key] ||= new Set()).add(m.mapel_name);
      });

      setTeachers((prev) =>
        prev.map((t) => {
          const key = (t.username || "").trim().toLowerCase();
          const names = byTeacherName[key];
          return names && names.size ? { ...t, subject: [...names].join(", ") } : t;
        })
      );
    } catch (err) {
      console.error("Enrich subjects error:", err);
    }
  };

  const fetchMapels = async () => {
    try {
      let res = await fetch("/api/auth/mapels", { credentials: "include" });
      if (!res.ok) res = await fetch("/api/mapels", { credentials: "include" });
      if (!res.ok) return;
      const data = await res.json();
      const list = Array.isArray(data) ? data : (data?.data ?? []);
      setMapels(list.filter((m) => m && m.id_mapel != null));
    } catch (err) {
      console.error("Fetch mapels error:", err);
    }
  };

  useEffect(() => {
    fetchTeachers();
    fetchMapels();
  }, []);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setNewTeacher((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleMapelChange = (value) => {
    setNewTeacher((prev) => ({ ...prev, id_mapel: value }));
    if (formErrors.id_mapel) {
      setFormErrors((prev) => ({ ...prev, id_mapel: undefined }));
    }
  };

  const closeCreateModal = () => {
    if (isSubmitting) return;
    setIsCreateOpen(false);
    setNewTeacher(EMPTY_TEACHER_FORM);
    setFormErrors({});
  };

  const validateTeacherForm = () => {
    const errs = {};
    if (!newTeacher.username.trim()) errs.username = "Nama wajib diisi";
    if (!newTeacher.email.trim()) {
      errs.email = "Email wajib diisi";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newTeacher.email.trim())) {
      errs.email = "Format email salah";
    }
    if (!newTeacher.nip.trim()) errs.nip = "NIP wajib diisi";
    if (!newTeacher.id_mapel) errs.id_mapel = "Mata pelajaran wajib dipilih";
    return errs;
  };

  const handleCreateTeacher = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    const errs = validateTeacherForm();
    if (Object.keys(errs).length > 0) {
      setFormErrors(errs);
      return;
    }

    setIsSubmitting(true);
    const email = newTeacher.email.trim();
    const username = newTeacher.username.trim();

    try {
      const response = await fetch("/api/auth/registerTeacher", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          username,
          email,
          nip: newTeacher.nip.trim(),
          id_mapel: newTeacher.id_mapel
        })
      });

      const result = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(translateError(result?.message) || "Gagal membuat akun guru.");
      }

      const mapelName = mapels.find(
        (m) => String(m.id_mapel) === String(newTeacher.id_mapel)
      )?.mapel_name;

      setIsCreateOpen(false);
      setNewTeacher(EMPTY_TEACHER_FORM);
      setFormErrors({});
      setAlertInfo({
        show: true,
        message: `Akun ${username} dibuat${mapelName ? ` untuk mapel ${mapelName}` : ""}. Password sementara dikirim ke ${email}.`,
        type: 'success'
      });

      fetchTeachers();
    } catch (err) {
      setAlertInfo({ show: true, message: err.message, type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditClick = (teacher) => {
    setEditingUser(teacher);
    setEditForm({ username: teacher.username || "", email: teacher.email || "" });
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
      setAlertInfo({ show: true, message: "ID Guru tidak ditemukan", type: 'error' });
      return;
    }

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
          message: "Data guru berhasil diperbarui.",
          type: 'success'
        });
        setEditingUser(null);
        fetchTeachers();
      } else {
        const msg = result?.message || "Gagal memperbarui data guru.";
        setAlertInfo({ show: true, message: translateError(msg), type: 'error' });
      }
    } catch (err) {
      console.error("Network Error:", err);
      setAlertInfo({ show: true, message: "Tidak bisa terhubung ke server.", type: 'error' });
    } finally {
      setIsEditSubmitting(false);
    }
  };

  const handleDelete = async (teacher) => {
    const userId = teacher.id_user || teacher.id;
    if (!userId) {
      setAlertInfo({ show: true, message: "ID Guru tidak ditemukan", type: 'error' });
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
        setTeachers((prev) => prev.filter((t) => (t.id_user || t.id) !== userId));
        setAlertInfo({ 
          show: true, 
          message: `Akun guru ${teacher.username} berhasil dihapus.`, 
          type: 'success' 
        });
      } else {
        let errorMsg = "Gagal menghapus data pengajar.";
        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json();
          errorMsg = errorData.message || errorMsg;
        }
        setAlertInfo({ show: true, message: errorMsg, type: 'error' });
      }
    } catch (err) {
      console.error("Network Error:", err);
      setAlertInfo({ show: true, message: "Tidak bisa terhubung ke server.", type: 'error' });
    }
  };

  const filteredTeachers = teachers.filter((t) =>
    t.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderSubjectInfo = (teacher) => {
    const subject = teacher.subject || teacher.subject_name || teacher.mapel;

    if (subject) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
          {subject}
        </span>
      );
    }

    return (
      <span className="inline-flex items-center px-3 py-1 rounded-lg bg-slate-100 text-slate-400 text-xs font-medium border border-slate-200">
        Belum Ada Mapel
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
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Manajemen Guru</h1>
            <p className="text-slate-500 text-lg mt-1">Kelola data seluruh pengajar di sekolah.</p>
          </div>

          <button
            type="button"
            onClick={() => setIsCreateOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#0d264f] text-white font-semibold shadow-sm hover:bg-[#0d203f] hover:shadow-md active:scale-[0.98] transition-all"
          >
            <IconPlus />
            Tambah Guru
          </button>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 max-w-md">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
              <IconSearch />
            </div>
            <input
              type="text"
              placeholder="Cari nama pengajar..."
              className="w-full pl-12 pr-4 py-3 rounded-lg bg-slate-50 border border-transparent focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-slate-700"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-4 md:hidden border-b border-slate-100 bg-slate-50 flex justify-between items-center">
            <span className="text-sm font-bold text-slate-500">Daftar Guru ({filteredTeachers.length})</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Guru</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Mata Pelajaran</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <tr>
                    <td colSpan="3" className="px-6 py-20 text-center text-slate-400">
                      Memuat data pengajar...
                    </td>
                  </tr>
                ) : filteredTeachers.length > 0 ? (
                  filteredTeachers.map((t) => (
                    <tr key={t.id_user || t.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-bold text-slate-800 text-lg">{t.username}</p>
                          <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide">Pengajar</p>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        {renderSubjectInfo(t)}
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEditClick(t)}
                            className="p-2 text-slate-400 hover:text-[#0d264f] hover:bg-slate-100 rounded-lg transition-colors"
                            title="Edit Guru"
                          >
                            <IconEdit />
                          </button>
                          <button
                            onClick={() => handleDelete(t)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Hapus Guru"
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
                      Tidak ada data pengajar ditemukan.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* MODAL TAMBAH GURU */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm">
          <div className="w-full max-w-md max-h-[90vh] overflow-y-auto no-scrollbar bg-white rounded-2xl shadow-2xl border border-slate-100">
            <div className="sticky top-0 bg-white z-10 flex items-start justify-between gap-4 px-6 pt-6 pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-xl font-extrabold text-slate-800">Tambah Guru</h2>
                <p className="text-sm text-slate-500 mt-0.5">
                  Password sementara dibuat otomatis dan dikirim ke email guru.
                </p>
              </div>
            </div>

            <form onSubmit={handleCreateTeacher} className="px-6 py-5 space-y-4">
              <FormField
                label="Nama Lengkap"
                name="username"
                value={newTeacher.username}
                onChange={handleFormChange}
                placeholder="Budi Santoso"
                error={formErrors.username}
              />

              <FormField
                label="Alamat Email"
                name="email"
                type="email"
                value={newTeacher.email}
                onChange={handleFormChange}
                placeholder="budi@sekolah.sch.id"
                error={formErrors.email}
                hint="Password sementara dikirim ke alamat ini."
              />

              <FormField
                label="NIP (Nomor Induk Pegawai)"
                name="nip"
                value={newTeacher.nip}
                onChange={handleFormChange}
                placeholder="Maks. 18 angka"
                error={formErrors.nip}
                maxLength={18}
                hint="Boleh diisi 1–18 karakter"
              />

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Mata Pelajaran
                </label>
                <CustomSelect
                  value={newTeacher.id_mapel}
                  onChange={handleMapelChange}
                  options={mapels.map((m) => ({
                    value: m.id_mapel,
                    label: m.mapel_name,
                  }))}
                  placeholder="Pilih mapel..."
                />
                {formErrors.id_mapel ? (
                  <p className="mt-1 text-xs font-medium text-red-500">{formErrors.id_mapel}</p>
                ) : (
                  <p className="mt-1 text-xs text-slate-400">
                    Guru hanya bisa dibuat untuk mapel yang belum memiliki guru.
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeCreateModal}
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
                  {isSubmitting ? "Menyimpan..." : "Buat Akun"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL EDIT GURU */}
      {editingUser && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm">
          <div className="w-full max-w-md max-h-[90vh] overflow-y-auto no-scrollbar bg-white rounded-2xl shadow-2xl border border-slate-100">
            <div className="sticky top-0 bg-white z-10 flex items-start justify-between gap-4 px-6 pt-6 pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-xl font-extrabold text-slate-800">Edit Guru</h2>
                <p className="text-sm text-slate-500 mt-0.5">
                  Ubah nama atau email akun guru ini.
                </p>
              </div>
            </div>

            <form onSubmit={handleEditSubmit} className="px-6 py-5 space-y-4">
              <FormField
                label="Nama Lengkap"
                name="username"
                value={editForm.username}
                onChange={handleEditChange}
                placeholder="Budi Santoso"
                hint="Biarkan sama jika tidak ingin mengubah."
              />

              <FormField
                label="Alamat Email"
                name="email"
                type="email"
                value={editForm.email}
                onChange={handleEditChange}
                placeholder="budi@sekolah.sch.id"
                hint="Email harus belum dipakai akun lain."
              />

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeEditModal}
                  disabled={isEditSubmitting}
                  className="px-5 py-3 rounded-xl font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  disabled={isEditSubmitting}
                  className="px-5 py-3 rounded-xl bg-[#0d264f] text-white font-semibold shadow-sm hover:bg-[#0d203f] disabled:opacity-70 disabled:cursor-not-allowed active:scale-[0.98] transition-all"
                >
                  {isEditSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideIn {
          from { opacity:0; transform: translateX(100%); }
          to { opacity: 1; transform: translateX(0); }
        }
        .animate-slideIn {
          animation: slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        /* Utility Class Menghilangkan Scrollbar */
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </MainLayout>
  );
}