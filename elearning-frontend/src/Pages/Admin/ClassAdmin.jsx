  import React, { useState, useEffect } from "react";
import MainLayout from "../../components/Admin/MainLayout";
import Toast from "../../components/Toast";

export default function ClassAdmin() {
  const [classes, setClasses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [alertInfo, setAlertInfo] = useState({ show: false, message: '', type: 'success' });

  const loadClasses = async () => {
    setFetchError(null);
    setIsLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/classes', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || 'Failed to load classes.');
      }

      const result = await response.json();
      const rawClasses = result.data ?? result;
      const loadedClasses = Array.isArray(rawClasses)
        ? rawClasses.map((item) => ({
            id: item.id || item.id_class || Date.now(),
            className: item.class_name || item.name || 'Unnamed Class',
            active: item.active ?? true,
          }))
        : [];

      setClasses(loadedClasses);
    } catch (error) {
      console.error('Load classes error:', error);
      setFetchError(error.message || 'Unable to load classes.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadClasses();
  }, []);
  const [openModal, setOpenModal] = useState(false);
  const [editingClass, setEditingClass] = useState(null);

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/classes', {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ id_class: id }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || 'Failed to delete class.');
      }

      setClasses((prev) => prev.filter((item) => item.id !== id));
      setAlertInfo({ show: true, message: 'Kelas berhasil dihapus.', type: 'success' });
    } catch (error) {
      console.error('Delete class error:', error);
      setAlertInfo({ show: true, message: error.message || 'Kelas tidak dapat dihapus saat ini.', type: 'error' });
    }
  };

  const handleUpdateClass = async (updatedData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/classes/${editingClass.id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ class_name: updatedData.className }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || 'Failed to update class.');
      }

      setClasses((prev) =>
        prev.map((item) =>
          item.id === editingClass.id ? { ...item, className: updatedData.className } : item
        )
      );
      setEditingClass(null);
      setAlertInfo({ show: true, message: 'Kelas berhasil diperbarui.', type: 'success' });
    } catch (error) {
      console.error('Update class error:', error);
      setAlertInfo({ show: true, message: error.message || 'Kelas tidak dapat diperbarui saat ini.', type: 'error' });
    }
  };


  const handleAddClass = async (newClassData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/me/classes', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          class_name: newClassData.className,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || 'Failed to create class.');
      }

      const result = await response.json();
      const createdClass = result.data || result || {};
      const classItem = {
        id: createdClass.id || createdClass.id_class || Date.now(),
        className: createdClass.class_name || createdClass.name || newClassData.className,
        active: createdClass.active ?? true,
      };

      setClasses((prev) => [...prev, classItem]);
      setOpenModal(false);
      setAlertInfo({ show: true, message: 'Kelas berhasil dibuat.', type: 'success' });
    } catch (error) {
      console.error('Create class error:', error);
      setAlertInfo({ show: true, message: error.message || 'Kelas tidak dapat dibuat saat ini.', type: 'error' });
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
            <h2 className="text-3xl font-bold text-gray-800">Class Management</h2>
            <p className="text-gray-500 mt-1">Manage active classes.</p>
          </div>

          <div className="flex gap-3 mt-4 md:mt-0">
            <button 
              onClick={() => setOpenModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white bg-gradient-to-r from-[#0d264f] to-[#1a3a75] hover:shadow-lg hover:scale-[1.02] transition-all duration-300 font-bold shadow-md"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Class
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="p-8 text-center text-gray-500">Loading classes...</div>
            ) : fetchError ? (
              <div className="p-8 text-center text-red-500">{fetchError}</div>
            ) : (
              <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs font-bold uppercase tracking-wider border-b border-gray-200">
                  <th className="px-6 py-4 w-[80px]">No</th>
                  <th className="px-6 py-4">Class Name</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-center w-[150px]">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {classes.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-8 text-center text-gray-400">No classes found.</td>
                  </tr>
                ) : (
                  classes.map((item, i) => (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors duration-150 group">
                      <td className="px-6 py-4 text-sm font-medium text-gray-500">{i + 1}</td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-bold text-gray-800">{item.className}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                          item.active
                            ? "bg-green-50 text-green-700 border-green-100"
                            : "bg-red-50 text-red-700 border-red-100"
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                             item.active ? "bg-green-500" : "bg-red-500"
                          }`}></span>
                          {item.active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center gap-2">
                          <button className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors" title="Edit" onClick={() => setEditingClass(item)}>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors" title="Delete" onClick={() => handleDelete(item.id)}>
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

      {openModal && <AddClassModal onClose={() => setOpenModal(false)} onSave={handleAddClass} onNotify={(msg, type = 'error') => setAlertInfo({ show: true, message: msg, type })} />}
      {editingClass && (
        <AddClassModal
          initialData={editingClass}
          onClose={() => setEditingClass(null)}
          onSave={handleUpdateClass}
          onNotify={(msg, type = 'error') => setAlertInfo({ show: true, message: msg, type })}
        />
      )}
    </MainLayout>
  );
}

function AddClassModal({ onClose, onSave, initialData, onNotify }) {
  const isEdit = Boolean(initialData);
  const [formData, setFormData] = useState({
    className: initialData?.className || "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.className) {
      onNotify?.("Nama kelas wajib diisi.", 'error');
      return;
    }
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative z-10 animate-fade-in-up overflow-hidden">
        <div className="bg-gradient-to-r from-[#0d264f] to-[#1a3a75] p-6 text-white">
          <h3 className="text-xl font-bold">{isEdit ? "Edit Class" : "Add New Class"}</h3>
          <p className="text-blue-200 text-sm mt-1">{isEdit ? "Update class name below." : "Enter class name below."}</p>
        </div>
        <div className="p-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">Class Name</label>
          <input
            type="text"
            value={formData.className}
            onChange={(e) => setFormData({...formData, className: e.target.value})}
            placeholder="e.g., XI PPLG 2"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#0d264f] focus:ring-2 focus:ring-blue-100 outline-none transition-all"
          />
        </div>
        <div className="p-6 pt-0 flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-semibold hover:bg-gray-50">Cancel</button>
          <button onClick={handleSubmit} className="flex-1 py-3 rounded-xl bg-[#0d264f] text-white font-bold hover:bg-[#1a3a75] shadow-lg">{isEdit ? "Update Class" : "Save Class"}</button>
        </div>
      </div>
    </div>
  );
}