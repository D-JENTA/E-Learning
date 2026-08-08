import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../components/Admin/MainLayout";

// --- KOMPONEN NOTIFIKASI TOAST (Custom Alert) ---
const CustomAlert = ({ message, type, onClose }) => {
  const [timer, setTimer] = useState(null);

  React.useEffect(() => {
    const t = setTimeout(() => {
      onClose();
    }, 3000);
    setTimer(t);
    return () => clearTimeout(t);
  }, [onClose]);

  if (!message) return null;

  const iconBg = type === 'error' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600';
  
  const Icon = type === 'error' 
    ? <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12 a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
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

const IconArrowLeft = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
);

const IconTrash = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
);

const IconSwitch = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 7h12m0 0-4-4m4 4-4 4"/><path d="M16 17H4m0 0 4 4m-4-4 4-4"/></svg>
);

export default function SuperAdminManageUsers() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // State untuk Custom Alert
  const [alertInfo, setAlertInfo] = useState({ show: false, message: '', type: 'success' });

  const [isChangingRole, setIsChangingRole] = useState(false);
  const [roleModal, setRoleModal] = useState({
    isOpen: false,
    user: null,
    targetRole: "",
    newNISORNIP: "",
  });

  const fetchAllUsers = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/users");
      const result = await response.json();
      setUsers(result);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllUsers();
  }, []);

  const handleDelete = async (user) => {
    if (user.role === "superAdmin") {
      setAlertInfo({ show: true, message: "Akun ini dilindungi!", type: 'error' });
      return;
    }
    // HAPUS: window.confirm
    // Langsung hapus tanpa konfirmasi bawaan chrome

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/admin/users/${user.id_user || user.id}`, {
        method: "DELETE",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (response.ok) {
        setAlertInfo({ show: true, message: "Pengguna berhasil dihapus.", type: 'success' });
        fetchAllUsers();
      } else {
        setAlertInfo({ show: true, message: "Gagal menghapus pengguna.", type: 'error' });
      }
    } catch (err) {
      setAlertInfo({ show: true, message: "Terjadi kesalahan saat menghapus data.", type: 'error' });
    }
  };

  const openRoleModal = (user) => {
    if (user.role === "superAdmin" || user.role === "admin") {
      setAlertInfo({ show: true, message: "Role admin tidak bisa diubah dari fitur ini.", type: 'error' });
      return;
    }

    if (user.role !== "student" && user.role !== "teacher") {
      setAlertInfo({ show: true, message: "Role ini belum bisa diubah.", type: 'error' });
      return;
    }

    setRoleModal({
      isOpen: true,
      user,
      targetRole: user.role === "student" ? "teacher" : "student",
      newNISORNIP: "",
    });
  };

  const closeRoleModal = () => {
    if (isChangingRole) return;

    setRoleModal({
      isOpen: false,
      user: null,
      targetRole: "",
      newNISORNIP: "",
    });
  };

  const handleChangeRole = async () => {
    if (!roleModal.user) return;

    const id = roleModal.user.id_user || roleModal.user.id;
    const targetRole = roleModal.targetRole;
    const newNISORNIP = roleModal.newNISORNIP.trim();

    if (!id) {
      setAlertInfo({ show: true, message: "ID pengguna tidak ditemukan.", type: 'error' });
      return;
    }

    if (!targetRole) {
      setAlertInfo({ show: true, message: "Target role wajib dipilih.", type: 'error' });
      return;
    }

    if (!newNISORNIP) {
      setAlertInfo({ show: true, message: targetRole === "teacher" ? "NIP baru wajib diisi." : "NIS baru wajib diisi.", type: 'error' });
      return;
    }

    try {
      setIsChangingRole(true);
      const token = localStorage.getItem("admin_token");

      const response = await fetch("/api/auth/users/role", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "69420",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: "include",
        body: JSON.stringify({
          id,
          targetRole,
          newNISORNIP,
        }),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        setAlertInfo({ show: true, message: result.message || "Gagal mengubah role pengguna.", type: 'error' });
        return;
      }

      setAlertInfo({ show: true, message: result.message || "Role pengguna berhasil diubah.", type: 'success' });
      closeRoleModal();
      fetchAllUsers();
    } catch (err) {
      console.error(err);
      setAlertInfo({ show: true, message: "Terjadi kesalahan saat mengubah role.", type: 'error' });
    } finally {
      setIsChangingRole(false);
    }
  };

  const filteredUsers = users.filter((u) =>
    u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderRoleBadge = (role) => {
    if (role === "superAdmin") {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-800 text-white border border-slate-700">
          <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
          Admin
        </span>
      );
    }

    if (role === "admin") {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-200">
          Admin
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
        {role}
      </span>
    );
  };

  return (
    <MainLayout>
      {/* Render Custom Alert */}
      {alertInfo.show && (
        <CustomAlert 
          message={alertInfo.message} 
          type={alertInfo.type} 
          onClose={() => setAlertInfo({ ...alertInfo, show: false })} 
        />
      )}

      <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-full bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-[#0d264f] hover:border-slate-300 transition-all shadow-sm"
              title="Kembali"
            >
              <IconArrowLeft />
            </button>

            <div>
              <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Kelola Pengguna</h1>
              <p className="text-slate-500 text-lg mt-1">Pantau dan atur akses seluruh pengguna sistem.</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Pengguna</p>
            <p className="text-3xl font-black text-slate-800 mt-1">{users.length}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 border-l-4 border-l-red-500">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Admin Aktif</p>
            <p className="text-3xl font-black text-red-600 mt-1">{users.filter(u => u.role === "admin").length}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hidden lg:block opacity-0"></div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hidden lg:block opacity-0"></div>
        </div>

        <div className="bg-white p-2 rounded-xl shadow-sm border border-slate-100 max-w-md">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <IconSearch />
            </div>
            <input
              type="text"
              placeholder="Cari nama, email, atau role..."
              className="w-full pl-10 pr-4 py-3 bg-transparent border-none outline-none text-slate-700 font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Identitas</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Hak Akses</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {isLoading ? (
                  <tr><td colSpan="3" className="px-6 py-20 text-center text-slate-400">Memuat data...</td></tr>
                ) : filteredUsers.length > 0 ? (
                  filteredUsers.map((u) => (
                    <tr key={u.id_user || u.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-bold text-slate-800">{u.username}</p>
                          <p className="text-sm text-slate-400">{u.email}</p>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        {renderRoleBadge(u.role)}
                      </td>

                      <td className="px-6 py-4 text-right">
                        {u.role !== "superAdmin" ? (
                          <div className="flex items-center justify-end gap-2">
                            {(u.role === "student" || u.role === "teacher") && (
                              <button
                                onClick={() => openRoleModal(u)}
                                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Ubah Role"
                              >
                                <IconSwitch />
                              </button>
                            )}

                            <button
                              onClick={() => handleDelete(u)}
                              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Hapus Pengguna"
                            >
                              <IconTrash />
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-300 italic">Proteksi</span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="px-6 py-12 text-center text-slate-400">
                      Tidak ada pengguna ditemukan.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {roleModal.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-100">
                <h2 className="text-lg font-black text-slate-800">Ubah Role Pengguna</h2>
                <p className="text-sm text-slate-500 mt-1">
                  Pastikan data NIS/NIP sudah benar.
                </p>
              </div>

              <div className="p-6 space-y-5">
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pengguna</p>
                  <p className="font-bold text-slate-800 mt-1">{roleModal.user?.username}</p>
                  <p className="text-sm text-slate-400">{roleModal.user?.email}</p>
                  <div className="mt-2">{renderRoleBadge(roleModal.user?.role)}</div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Role Baru
                  </label>
                  <select
                    value={roleModal.targetRole}
                    onChange={(e) => setRoleModal({ ...roleModal, targetRole: e.target.value, newNISORNIP: "" })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-bold outline-none focus:border-[#0d264f]"
                  >
                    {roleModal.user?.role === "student" && <option value="teacher">Teacher</option>}
                    {roleModal.user?.role === "teacher" && <option value="student">Student</option>}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    {roleModal.targetRole === "teacher" ? "NIP Baru" : "NIS Baru"}
                  </label>
                  <input
                    type="text"
                    value={roleModal.newNISORNIP}
                    onChange={(e) => setRoleModal({ ...roleModal, newNISORNIP: e.target.value })}
                    placeholder={roleModal.targetRole === "teacher" ? "Masukkan NIP baru" : "Masukkan NIS baru"}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium outline-none focus:border-[#0d264f]"
                  />
                </div>
              </div>

              <div className="px-6 py-4 border-t border-slate-100 flex flex-col-reverse sm:flex-row justify-end gap-3">
                <button
                  type="button"
                  onClick={closeRoleModal}
                  disabled={isChangingRole}
                  className="px-5 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-colors disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleChangeRole}
                  disabled={isChangingRole}
                  className="px-5 py-2.5 rounded-xl font-bold text-white bg-[#0d264f] hover:bg-blue-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isChangingRole ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
              </div>
            </div>
          </div>
        )}

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
    </MainLayout>
  );
}