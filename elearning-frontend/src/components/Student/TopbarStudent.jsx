import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { HamburgerButtonStudent } from './SidebarStudent';
import authService from '../../services/authService';
import { useAuthUser } from '../../context/AuthContext';

const TOPBAR_USER_CACHE_KEY = 'student_topbar_user';

const getCachedUser = () => {
  try {
    const cached = sessionStorage.getItem(TOPBAR_USER_CACHE_KEY);
    return cached ? JSON.parse(cached) : null;
  } catch {
    return null;
  }
};

const saveCachedUser = (data) => {
  try {
    sessionStorage.setItem(TOPBAR_USER_CACHE_KEY, JSON.stringify(data));
  } catch {
    // Abaikan jika browser tidak mengizinkan sessionStorage.
  }
};

export default function TopbarStudent() {
  // Profil dari AuthContext (diisi App.jsx lewat /api/auth/users/me saat app load).
  // Dipakai sebagai sumber utama/fallback supaya topbar konsisten dengan
  // halaman lain — tidak bergantung pada satu fetch sendiri yang bisa gagal.
  const contextUser = useAuthUser();

  const cachedUser = getCachedUser();

  const [userData, setUserData] = useState(
    cachedUser || {
      username: contextUser?.username || "",
      profile_picture_url: contextUser?.profile_picture_url || null,
      role: contextUser?.role || "Student"
    }
  );

  const [isLoading, setIsLoading] = useState(!cachedUser);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef(null);
  const navigate = useNavigate();

  const fetchUserData = async (signal) => {
    try {
      const token = localStorage.getItem("token") || localStorage.getItem("admin_token");

      const response = await fetch("/api/auth/users/me", {
        method: "GET",
        headers: {
          ...(token ? { "Authorization": `Bearer ${token}` } : {}),
          "ngrok-skip-browser-warning": "69420"
        },
        credentials: "include",
        signal
      });

      if (response.ok) {
        const result = await response.json();
        const finalData = result.data || result;

        const nextUserData = {
          username: finalData.username || "User",
          profile_picture_url: finalData.profile_picture_url || null,
          role: finalData.role || "Student"
        };

        setUserData(nextUserData);
        saveCachedUser(nextUserData);
      } else {
        console.error("Server return error:", response.status);
      }
    } catch (error) {
      if (error.name !== "AbortError") {
        console.error("Fetch Topbar Gagal:", error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    fetchUserData(controller.signal);

    // Settings (dan halaman lain) dispatch 'user-updated' setelah ganti
    // foto/nama — topbar langsung refetch tanpa perlu pindah halaman.
    const handleUserUpdated = () => fetchUserData();
    window.addEventListener('user-updated', handleUserUpdated);

    return () => {
      controller.abort();
      window.removeEventListener('user-updated', handleUserUpdated);
    };
  }, []);

  // AuthContext bisa terisi belakangan (App.jsx fetch async) — gabungkan
  // kalau data sendiri masih kosong.
  useEffect(() => {
    if (!contextUser) return;
    setUserData((prev) => ({
      username: prev.username || contextUser.username || "",
      profile_picture_url: prev.profile_picture_url || contextUser.profile_picture_url || null,
      role: prev.role || contextUser.role || "Student"
    }));
  }, [contextUser]);

  // Tutup dropdown profil saat klik di luar area
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const profileSrc = userData.profile_picture_url
    ? userData.profile_picture_url
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.username || 'U')}&background=0D264F&color=fff`;

  const handleGoToSettings = () => {
    setIsProfileMenuOpen(false);
    navigate("/student/settings");
  };

  const handleLogout = async () => {
    setIsProfileMenuOpen(false);
    try {
      await authService.logout();
    } finally {
      localStorage.removeItem('pending_user_id');
      localStorage.removeItem('pending_role');
      localStorage.removeItem('pending_email');

      window.dispatchEvent(new Event('user-logout'));
      navigate('/login', { replace: true });
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 sm:px-6 fixed top-0 right-0 left-0 md:left-60 z-30">

      <div className="flex items-center">
        <div className="md:hidden">
          <HamburgerButtonStudent />
        </div>
      </div>

      <div className="flex items-center gap-4">

        <div className="text-right hidden sm:block">
          <p className="text-sm font-bold text-gray-800 leading-tight">
            {isLoading && !userData.username ? "Memuat..." : userData.username || "User"}
          </p>
          <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mt-0.5">
            {userData.role}
          </p>
        </div>

        <div ref={profileMenuRef} className="relative">
          <button
            onClick={() => setIsProfileMenuOpen((prev) => !prev)}
            className="relative group focus:outline-none p-1 rounded-full hover:bg-gray-50 transition-colors"
            title="Menu profil"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full opacity-0 group-hover:opacity-75 transition duration-200 blur"></div>
            <img
              src={profileSrc}
              alt="Profile"
              className="relative h-10 w-10 rounded-full border-2 border-white shadow-md object-cover bg-slate-100 transition-transform group-hover:scale-105 cursor-pointer"
              onError={(e) => {
                e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.username || 'U')}&background=0D264F&color=fff`;
              }}
            />
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
          </button>

          {isProfileMenuOpen && (
            <div className="absolute right-0 z-50 mt-2 w-56 rounded-2xl border border-slate-100 bg-white p-2 shadow-xl">
              <div className="px-3 py-2 mb-1 border-b border-slate-100 sm:hidden">
                <p className="text-sm font-bold text-slate-800 truncate">{userData.username}</p>
                <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider">{userData.role}</p>
              </div>

              <button
                type="button"
                onClick={handleGoToSettings}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-[#0d264f] transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                </svg>
                <span>Settings</span>
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
