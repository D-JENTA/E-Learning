import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function TopbarTeacher({ onToggleSidebar, isMobile }) {
  const [userData, setUserData] = useState({
    username: "",
    profile_picture_url: null,
    role: "Teacher"
  });
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem("token") || localStorage.getItem("admin_token");
      const response = await fetch("/api/auth/users/me", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "ngrok-skip-browser-warning": "69420"
        },
        credentials: "include"
      });
      
      if (response.ok) {
        const result = await response.json();
        const finalData = result.data || result;
        setUserData({
          username: finalData.username || "User",
          profile_picture_url: finalData.profile_picture_url || null,
          role: finalData.role || "Teacher"
        });
      }
    } catch (error) {
      console.error("Fetch Topbar Gagal:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const profileSrc = userData.profile_picture_url 
    ? userData.profile_picture_url 
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.username || 'U')}&background=0D264F&color=fff`;

  const handleProfileClick = () => {
    navigate("/teacher/settings");
  };

  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 sm:px-6 fixed top-0 right-0 left-0 md:left-64 z-30">
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
            {isLoading ? "Memuat..." : userData.username}
          </p>
          <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mt-0.5">
            {userData.role}
          </p>
        </div>

        <button 
          onClick={handleProfileClick}
          className="relative group focus:outline-none p-1 rounded-full hover:bg-gray-50 transition-colors"
          title="Go to Settings"
        >
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full opacity-0 group-hover:opacity-75 transition duration-200 blur"></div>
          <img 
            src={profileSrc} 
            alt="Profile" 
            className="relative h-10 w-10 rounded-full border-2 border-white shadow-md object-cover bg-slate-100 transition-transform group-hover:scale-105 cursor-pointer"
            key={userData.profile_picture_url} 
          />
          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
        </button>
      </div>
    </header>
  );
}