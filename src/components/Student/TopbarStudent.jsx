import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { HamburgerButtonStudent } from './SidebarStudent';

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
  const cachedUser = getCachedUser();

  const [userData, setUserData] = useState(
    cachedUser || {
      username: "",
      profile_picture_url: null,
      role: "Student"
    }
  );

  const [isLoading, setIsLoading] = useState(!cachedUser);
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

    return () => controller.abort();
  }, []);

  const profileSrc = userData.profile_picture_url
    ? userData.profile_picture_url
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.username || 'U')}&background=0D264F&color=fff`;

  const handleProfileClick = () => {
    navigate("/student/settings");
  };

  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 sm:px-6 fixed top-0 right-0 left-0 md:left-64 z-30">

      <div className="flex items-center">
        <div className="md:hidden">
          <HamburgerButtonStudent />
        </div>
      </div>

      <div className="flex items-center gap-4">

        <div className="text-right hidden sm:block">
          <p className="text-sm font-bold text-gray-800 leading-tight">
            {isLoading && !userData.username ? "Memuat..." : userData.username}
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
            onError={(e) => {
              e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.username || 'U')}&background=0D264F&color=fff`;
            }}
          />
          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
        </button>
      </div>
    </header>
  );
}