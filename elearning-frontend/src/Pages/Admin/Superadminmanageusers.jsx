import React, { useEffect, useState } from "react";
import MainLayout from "../../components/Admin/MainLayout";

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

const IconSearch = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
);

const IconTrash = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
);

export default function SuperAdminManageUsers() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [alertInfo, setAlertInfo] = useState({ show: false, message: '', type: 'success' });

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

    try {
      const token = localStorage.getItem("admin_token");
      const response = await fetch(`/api/auth/admin/users/${user.id_user || user.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
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
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Kelola User</h1>
            <p className="text-slate-500 text-lg mt-1">Pantau dan atur akses seluruh pengguna sistem.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total User      .</p>
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
                        {(u.role === "student" || u.role === "teacher") ? (
                          <button
                            onClick={() => handleDelete(u)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Hapus Pengguna"
                          >
                            <IconTrash />
                          </button>
                        ) : (
                          <span className="text-xs text-slate-300 italic"></span>
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