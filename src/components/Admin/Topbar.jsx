import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { HamburgerButton } from './Sidebar';

export default function TopbarTeacher() {
  const navigate = useNavigate();
  
  const [userData, setUserData] = useState({
    username: "",
    profile_picture_url: null,
    role: "Admin"
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem("token") || localStorage.getItem("admin_token");
      
      if (!token) {
        setIsLoading(false);
        return;
      }

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
          role: finalData.role || "Admin"
        });
      } else {
        console.error("Gagal mengambil user data:", response.status);
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

  const profileSrc = userData.profile_picture_url 
    ? userData.profile_picture_url 
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.username || 'U')}&background=0D264F&color=fff`;

  const handleProfileClick = () => {
    navigate('/admin/settings'); 
  };

  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 sm:px-6 fixed top-0 right-0 left-0 md:left-72 z-40 transition-all duration-300 shadow-sm">
      
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

        <button 
          onClick={handleProfileClick}
          className="relative group cursor-pointer"
          title="Klik untuk ke Settings"
        >
          <img 
            src={profileSrc} 
            alt="Profile" 
            key={userData.profile_picture_url} 
            className="h-10 w-10 rounded-full border-2 border-white shadow-md object-cover bg-slate-100 group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
        </button>

      </div>
    </header>
  );
}