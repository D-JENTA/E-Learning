import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { HamburgerButton } from './Sidebar';
import authService from '../../services/authService';

export default function TopbarTeacher() {
  const navigate = useNavigate();
  
  const [userData, setUserData] = useState({
    username: "",
    profile_picture_url: null,
    role: "Admin"
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef(null);

  const fetchUserData = async () => {
    try {
      const headers = {
        "ngrok-skip-browser-warning": "69420",
        "Cache-Control": "no-cache, no-store, must-revalidate",
      };

      const resUser = await fetch("/api/auth/users/me", {
        method: "GET",
        headers,
        credentials: "include",
      });
      if (resUser.ok) {
        const result = await resUser.json().catch(() => null);
        const finalData = result?.data || result?.user || result || {};
        setUserData({
          username: finalData.username || "User",
          profile_picture_url: finalData.profile_picture_url || null,
          role: finalData.role || "Admin",
        });
      } else {
        console.error("Gagal mengambil user data:", resUser.status);
      }

      const resPic = await fetch("/api/auth/profile-picture", {
        method: "GET",
        headers,
        credentials: "include",
      });
      if (resPic.ok) {
        const picResult = await resPic.json().catch(() => null);
        if (picResult?.profile_picture_url) {
          setUserData((prev) => ({ ...prev, profile_picture_url: picResult.profile_picture_url }));
        }
      }
    } catch (error) {
      console.error("Fetch Topbar Gagal:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
    window.addEventListener('user-updated', fetchUserData);
    return () => window.removeEventListener('user-updated', fetchUserData);
  }, []);

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
    navigate('/admin/settings');
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
    <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 sm:px-6 fixed top-0 right-0 left-0 md:left-60 z-40 transition-all duration-300 shadow-sm">
      
      <div className="flex items-center gap-4 flex-1">
        
        <HamburgerButton />
        
        <h1 className="font-bold text-xl text-slate-800 hidden sm:block">EduSpace Admin</h1>
      </div>

      <div className="flex items-center gap-4">
        
        <div className="text-right hidden sm:block">
          <p className="text-sm font-bold text-slate-800">
            {isLoading ? "Memuat..." : userData.username}
          </p>
          <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider">
            {userData.role}
          </p>
        </div>

        <div ref={profileMenuRef} className="relative">
          <button 
            onClick={() => setIsProfileMenuOpen((prev) => !prev)}
            className="relative group cursor-pointer"
            title="Menu profil"
          >
            <img 
              src={profileSrc} 
              alt="Profile" 
              key={userData.profile_picture_url} 
              className="h-10 w-10 rounded-full border-2 border-white shadow-md object-cover bg-slate-100 group-hover:scale-105 transition-transform duration-300"
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