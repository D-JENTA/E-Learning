import React, { useState, useEffect } from "react";
import MainLayout from "../../components/Admin/MainLayout";

const CustomAlert = ({ message, type, onClose }) => {
  React.useEffect(() => {
    const timer = setTimeout(() => onClose(), 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  if (!message) return null;

  const iconBg = type === 'error' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600';
  const icon = type === 'error'
    ? 'M'
    : 'I';

  return (
    <div className="fixed top-5 right-5 z-[100] flex items-center w-full max-w-xs p-4 space-x-3 text-gray-500 bg-white rounded-lg shadow-2xl border-l-4 transition-all duration-300">
      <div className={`inline-flex items-center justify-center flex-shrink-0 w-8 h-8 rounded-lg ${iconBg}`}>
        {icon}
      </div>
      <div className="flex-1 text-sm font-medium text-gray-800">{message}</div>
      <button onClick={onClose} className="text-gray-400 hover:text-gray-900">×</button>
    </div>
  );
};

export default function CreateMapelAdmin() {
  const [formData, setFormData] = useState({ mapel_name: '', id_teacher: '', id_class: '', day: '', jp: '' });
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingOptions, setIsLoadingOptions] = useState(true);
  const [alertInfo, setAlertInfo] = useState({ show: false, message: '', type: 'success' });

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [classesRes, teachersRes] = await Promise.all([
          fetch('/api/classes', { method: 'GET', credentials: 'include' }),
          fetch('/api/admin/users/teachers', { method: 'GET', credentials: 'include' })
        ]);

        if (!classesRes.ok) {
          throw new Error('Gagal memuat daftar kelas');
        }
        if (!teachersRes.ok) {
          throw new Error('Gagal memuat daftar guru');
        }

        const classesData = await classesRes.json();
        const teachersData = await teachersRes.json();

        setClasses(Array.isArray(classesData) ? classesData : []);
        setTeachers(Array.isArray(teachersData) ? teachersData : []);
      } catch (err) {
        console.error(err);
        setAlertInfo({ show: true, message: err.message || 'Gagal memuat opsi kelas atau guru', type: 'error' });
      } finally {
        setIsLoadingOptions(false);
      }
    };

    fetchOptions();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.mapel_name.trim() || !formData.id_class.trim() || !formData.day.trim() || !formData.jp.trim()) {
      setAlertInfo({ show: true, message: 'Nama mapel, kelas, hari, dan JP wajib diisi.', type: 'error' });
      return;
    }

    setIsLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/me/mapels', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || 'Gagal membuat mapel.');
      }

      setAlertInfo({ show: true, message: 'Mapel berhasil dibuat.', type: 'success' });
      setFormData({ mapel_name: '', id_teacher: '', id_class: '', day: '', jp: '' });
    } catch (err) {
      setAlertInfo({ show: true, message: err.message || 'Server error.', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MainLayout>
      {alertInfo.show && (
        <CustomAlert message={alertInfo.message} type={alertInfo.type} onClose={() => setAlertInfo({ ...alertInfo, show: false })} />
      )}
      <div className="max-w-3xl mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Buat Mapel (Admin)</h1>
          <p className="text-gray-500">Tambah mapel baru untuk kelas dan guru.</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-3xl p-8 shadow-sm space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Nama Mapel</label>
            <input
              value={formData.mapel_name}
              onChange={(e) => setFormData({ ...formData, mapel_name: e.target.value })}
              className="w-full rounded-2xl border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-sky-500"
              placeholder="Contoh: PAI"
            />
          </div>
            <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Pilih Kelas</label>
            <div className="relative">
              <select
                value={formData.id_class}
                onChange={(e) => setFormData({ ...formData, id_class: e.target.value })}
                className="w-full rounded-3xl border border-gray-300 bg-white px-4 py-3 pr-10 text-gray-700 shadow-sm transition appearance-none focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200 disabled:cursor-not-allowed disabled:bg-gray-100"
                disabled={isLoadingOptions}
              >
                <option value="">{isLoadingOptions ? 'Memuat kelas...' : 'Pilih kelas'}</option>
                {classes.map((kelas) => (
                  <option key={kelas.id_class} value={kelas.id_class}>
                    {kelas.class_name}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-gray-400">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6 8L10 12L14 8" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Pilih Guru (opsional)</label>
            <div className="relative">
              <select
                value={formData.id_teacher}
                onChange={(e) => setFormData({ ...formData, id_teacher: e.target.value })}
                className="w-full rounded-3xl border border-gray-300 bg-white px-4 py-3 pr-10 text-gray-700 shadow-sm transition appearance-none focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200 disabled:cursor-not-allowed disabled:bg-gray-100"
                disabled={isLoadingOptions}
              >
                <option value="">{isLoadingOptions ? 'Memuat guru...' : 'Pilih guru (opsional)'}</option>
                {teachers.map((teacher) => (
                  <option key={teacher.id_teacher} value={teacher.id_teacher}>
                    {teacher.username}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-gray-400">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6 8L10 12L14 8" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Hari</label>
            <div className="relative">
              <select
                value={formData.day}
                onChange={(e) => setFormData({ ...formData, day: e.target.value })}
                className="w-full rounded-3xl border border-gray-300 bg-white px-4 py-3 pr-10 text-gray-700 shadow-sm transition appearance-none focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
              >
                <option value="">Pilih hari</option>
                {['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'].map((hari) => (
                  <option key={hari} value={hari}>{hari}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-gray-400">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6 8L10 12L14 8" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">JP (Jam Pelajaran)</label>
            <input
              value={formData.jp}
              onChange={(e) => setFormData({ ...formData, jp: e.target.value })}
              className="w-full rounded-2xl border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-sky-500"
              placeholder="contoh: 4 atau 4-6 atau 4,5,6"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-2xl bg-[#0d264f] py-3 text-white font-bold hover:bg-[#0b1f47] transition-all"
          >
            {isLoading ? 'Menyimpan...' : 'Buat Mapel'}
          </button>
        </form>
      </div>
    </MainLayout>
  );
}
