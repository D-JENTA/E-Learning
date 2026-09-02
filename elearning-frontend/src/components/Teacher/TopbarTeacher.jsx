import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../../services/authService';
import { useAuthUser } from '../../context/AuthContext';

const capitalize = (str) => (str ? str.charAt(0).toUpperCase() + str.slice(1) : "Teacher");

export default function TopbarTeacher({ onToggleSidebar, isMobile, user: userProp }) {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef(null);
  const navigate = useNavigate();

  // Data user diambil langsung dari AuthContext (diisi oleh App.jsx), jadi
  // topbar tetap lengkap di SEMUA halaman — tidak lagi bergantung pada tiap
  // halaman yang meneruskan prop `user` ke MainLayout. Prop `user` masih
  // dihormati kalau ada, supaya pemanggilan lama tetap bekerja.
  const contextUser = useAuthUser();
  const user = userProp || contextUser;

  const username = user?.username || "User";
  const role = capitalize(user?.role);
  const profilePicture = user?.profile_picture_url || null;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const profileSrc = profilePicture
    ? profilePicture
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=0D264F&color=fff`;

  const handleGoToSettings = () => {
    setIsProfileMenuOpen(false);
    navigate("/teacher/settings");
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
        {isMobile && (
          <button
            onClick={onToggleSidebar}
            className="p-2 -ml-2 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-[#0d264f] transition-colors focus:outline-none"
            aria-label="Toggle sidebar"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        )}
      </div>

      <div className="flex items-center gap-4">
        <div className="text-right hidden sm:block">
          <p className="text-sm font-bold text-gray-800 leading-tight">
            {username}
          </p>
          <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mt-0.5">
            {role}
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
              key={profileSrc}
            />
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
          </button>

          {isProfileMenuOpen && (
            <div className="absolute right-0 z-50 mt-2 w-56 rounded-2xl border border-slate-100 bg-white p-2 shadow-xl">
              <div className="px-3 py-2 mb-1 border-b border-slate-100 sm:hidden">
                <p className="text-sm font-bold text-slate-800 truncate">{username}</p>
                <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider">{role}</p>
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