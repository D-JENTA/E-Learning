import React, { useState, useEffect } from "react";
import MainLayout from "../../components/Admin/MainLayout";
import Toast from "../../components/Toast";

export default function MapelAdmin() {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [mapels, setMapels] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [editingMapel, setEditingMapel] = useState(null);
  const [isLoadingClasses, setIsLoadingClasses] = useState(true);
  const [isLoadingMapels, setIsLoadingMapels] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const [alertInfo, setAlertInfo] = useState({ show: false, message: '', type: 'success' });

  // Load daftar guru untuk pilihan "Atur Guru"
  useEffect(() => {
    const loadTeachers = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("/api/admin/users/teachers", {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
        if (!response.ok) return;
        const data = await response.json();
        const raw = data.data ?? data;
        setTeachers(Array.isArray(raw) ? raw : []);
      } catch (error) {
        console.error("Load teachers error:", error);
      }
    };
    loadTeachers();
  }, []);

  // Load daftar kelas untuk dropdown
  useEffect(() => {
    const loadClasses = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("/api/classes", {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        if (!response.ok) {
          throw new Error("Gagal memuat daftar kelas.");
        }

        const result = await response.json();
        const rawClasses = result.data ?? result;
        const loadedClasses = Array.isArray(rawClasses) ? rawClasses : [];

        setClasses(loadedClasses);

        // Pilih kelas pertama secara otomatis
        if (loadedClasses.length > 0) {
          const firstId = loadedClasses[0].id_class ?? loadedClasses[0].id;
          setSelectedClass(String(firstId));
        }
      } catch (error) {
        console.error("Load classes error:", error);
        setFetchError(error.message || "Tidak dapat memuat kelas.");
      } finally {
        setIsLoadingClasses(false);
      }
    };

    loadClasses();
  }, []);

  // Load mapel setiap kali kelas yang dipilih berubah
  useEffect(() => {
    if (!selectedClass) {
      setMapels([]);
      return;
    }

    const loadMapels = async () => {
      setFetchError(null);
      setIsLoadingMapels(true);

      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`/api/classes/${selectedClass}/mapels`, {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          throw new Error(errorData?.message || "Gagal memuat daftar mapel.");
        }

        const result = await response.json();
        const rawMapels = result.data ?? result;
        const loadedMapels = Array.isArray(rawMapels)
          ? rawMapels.map((item, index) => ({
              id: item.id_mapel ?? item.id ?? index,
              mapelName: item.mapel_name ?? item.name ?? "Tanpa Nama",
              teacher: item.teacher_tb?.username ?? "Belum ada guru",
            }))
          : [];

        setMapels(loadedMapels);
      } catch (error) {
        console.error("Load mapels error:", error);
        setFetchError(error.message || "Tidak dapat memuat mapel.");
        setMapels([]);
      } finally {
        setIsLoadingMapels(false);
      }
    };

    loadMapels();
  }, [selectedClass]);

  // Ambil nama kelas yang sedang dipilih
  const selectedClassName = classes.find(
    (c) => String(c.id_class ?? c.id) === String(selectedClass)
  )?.class_name ?? classes.find(
    (c) => String(c.id_class ?? c.id) === String(selectedClass)
  )?.name ?? "";

  const handleDelete = async (item) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/mapels", {
        method: "DELETE",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ id_mapel: item.id }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || "Gagal menghapus mapel.");
      }

      setMapels((prev) => prev.filter((m) => m.id !== item.id));
      setAlertInfo({ show: true, message: `Mapel "${item.mapelName}" berhasil dihapus.`, type: 'success' });
    } catch (error) {
      console.error("Delete mapel error:", error);
      setAlertInfo({ show: true, message: error.message || "Mapel tidak dapat dihapus.", type: 'error' });
    }
  };

  const handleEditMapel = async ({ mapel_name, id_teacher }) => {
    if (!mapel_name.trim()) {
      setAlertInfo({ show: true, message: "Nama mapel wajib diisi.", type: 'error' });
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/admin/mapels/${editingMapel.id}`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          mapel_name,
          ...(id_teacher ? { id_teacher } : {}),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || "Gagal mengubah mapel.");
      }

      const teacherName = id_teacher
        ? teachers.find(
            (t) => String(t.id_teacher ?? t.id) === String(id_teacher)
          )?.username ?? "Guru"
        : editingMapel.teacher;

      setMapels((prev) =>
        prev.map((m) =>
          m.id === editingMapel.id
            ? { ...m, mapelName: mapel_name, teacher: teacherName }
            : m
        )
      );
      setEditingMapel(null);
      setAlertInfo({ show: true, message: "Mapel berhasil diperbarui.", type: 'success' });
    } catch (error) {
      console.error("Edit mapel error:", error);
      setAlertInfo({ show: true, message: error.message || "Mapel tidak dapat diubah.", type: 'error' });
    }
  };

  return (
    <MainLayout>
      {alertInfo.show && (
        <Toast message={alertInfo.message} type={alertInfo.type} onClose={() => setAlertInfo({ ...alertInfo, show: false })} />
      )}
      <div className="animate-fade-in-up">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-800">Daftar Mapel</h2>
            <p className="text-gray-500 mt-1">
              Lihat mapel yang telah dibuat berdasarkan kelas.
            </p>
          </div>

          <div className="mt-4 md:mt-0">
            <div className="relative">
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                disabled={isLoadingClasses}
                className="w-full md:w-64 rounded-xl border border-gray-300 bg-white px-4 py-2.5 pr-10 text-gray-700 shadow-sm transition appearance-none focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200 disabled:cursor-not-allowed disabled:bg-gray-100"
              >
                <option value="">
                  {isLoadingClasses ? "Memuat kelas..." : "Pilih kelas"}
                </option>
                {classes.map((kelas) => {
                  const id = kelas.id_class ?? kelas.id;
                  return (
                    <option key={id} value={id}>
                      {kelas.class_name ?? kelas.name ?? `Kelas ${id}`}
                    </option>
                  );
                })}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-gray-400">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6 8L10 12L14 8" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            {isLoadingMapels ? (
              <div className="p-8 text-center text-gray-500">Memuat mapel...</div>
            ) : fetchError ? (
              <div className="p-8 text-center text-red-500">{fetchError}</div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-gray-500 text-xs font-bold uppercase tracking-wider border-b border-gray-200">
                    <th className="px-6 py-4 w-[80px]">No</th>
                    <th className="px-6 py-4">Kelas</th>
                    <th className="px-6 py-4">Nama Mapel</th>
                    <th className="px-6 py-4">Guru</th>
                    <th className="px-6 py-4 text-center w-[180px]">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {mapels.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-8 text-center text-gray-400">
                        Belum ada mapel untuk kelas ini.
                      </td>
                    </tr>
                  ) : (
                    mapels.map((item, i) => (
                      <tr key={item.id} className="hover:bg-gray-50 transition-colors duration-150 group">
                        <td className="px-6 py-4 text-sm font-medium text-gray-500">{i + 1}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{selectedClassName}</td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-bold text-gray-800">{item.mapelName}</span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{item.teacher}</td>
                        <td className="px-6 py-4">
                          <div className="flex justify-center gap-2">
                            <button
                              className="px-3 py-1.5 rounded-lg text-xs font-bold text-sky-600 bg-sky-50 hover:bg-sky-100 transition-colors"
                              title="Edit Mapel"
                              onClick={() => setEditingMapel(item)}
                            >
                              Edit
                            </button>
                            <button
                              className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                              title="Hapus"
                              onClick={() => handleDelete(item)}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {editingMapel && (
        <EditMapelModal
          mapel={editingMapel}
          teachers={teachers}
          onClose={() => setEditingMapel(null)}
          onSave={handleEditMapel}
        />
      )}
    </MainLayout>
  );
}

function EditMapelModal({ mapel, teachers, onClose, onSave }) {
  const [mapelName, setMapelName] = useState(mapel.mapelName === "Tanpa Nama" ? "" : mapel.mapelName);
  const [selectedTeacher, setSelectedTeacher] = useState("");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative z-10 animate-fade-in-up overflow-hidden">
        <div className="bg-gradient-to-r from-[#0d264f] to-[#1a3a75] p-6 text-white">
          <h3 className="text-xl font-bold">Edit Mapel</h3>
          <p className="text-blue-200 text-sm mt-1">Ubah nama mapel dan gurunya.</p>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Mapel</label>
            <input
              type="text"
              value={mapelName}
              onChange={(e) => setMapelName(e.target.value)}
              placeholder="Contoh: B.indo"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Guru <span className="text-gray-400 font-normal">(kosongkan jika tidak diubah)</span>
            </label>
            <div className="relative">
              <select
                value={selectedTeacher}
                onChange={(e) => setSelectedTeacher(e.target.value)}
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 pr-10 text-gray-700 appearance-none focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
              >
                <option value="">
                  {mapel.teacher && mapel.teacher !== "Belum ada guru"
                    ? `Guru saat ini: ${mapel.teacher}`
                    : "Pilih guru"}
                </option>
                {teachers.map((teacher) => {
                  const id = teacher.id_teacher ?? teacher.id;
                  return (
                    <option key={id} value={id}>
                      {teacher.username}
                    </option>
                  );
                })}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-gray-400">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6 8L10 12L14 8" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
          </div>
        </div>
        <div className="p-6 pt-0 flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-semibold hover:bg-gray-50">Batal</button>
          <button
            onClick={() => onSave({ mapel_name: mapelName, id_teacher: selectedTeacher })}
            className="flex-1 py-3 rounded-xl bg-[#0d264f] text-white font-bold hover:bg-[#1a3a75] shadow-lg"
          >
            Simpan
          </button>
        </div>
      </div>
    </div>
  );
}
