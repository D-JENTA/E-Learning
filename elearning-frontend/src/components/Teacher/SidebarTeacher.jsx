import React, { useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import logoEDUSpace from '../../assets/logoEDUSpace.png';

// Judul tab tetap mengenali halaman Settings walau menunya sudah pindah ke dropdown Topbar.
const PAGE_TITLES = {
  '/teacher/dashboard': 'Home',
  '/teacher/classes': 'Classes',
  '/teacher/calendar': 'Calendar',
  '/teacher/settings': 'Settings',
};

export default function SidebarTeacher({ isOpen, onClose, isMobile }) {
  const location = useLocation();

  const menuItems = [
    {
      name: 'Home',
      icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
      path: '/teacher/dashboard'
    },
    {
      name: 'Classes',
      icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
      path: '/teacher/classes'
    },
    {
      name: 'Calendar',
      icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
      path: '/teacher/calendar'
    },
  ];
  // Menu "Settings" dipindahkan ke dropdown profil di Topbar.
  // Logout dipindahkan ke dropdown profil di Topbar.

  useEffect(() => {
    const pageName = PAGE_TITLES[location.pathname];
    document.title = pageName ? `Edu Space | ${pageName}` : "EduSpace Teacher";
  }, [location]);

  return (
    <>
      {/* Sembunyikan scrollbar bawaan browser di area menu sidebar,
          tapi tetap bisa di-scroll kalau menu-nya kepanjangan */}
      <style>{`
        .custom-scrollbar {
          scrollbar-width: none; /* Firefox */
          -ms-overflow-style: none; /* IE / Edge lama */
        }
        .custom-scrollbar::-webkit-scrollbar {
          display: none; /* Chrome, Edge, Safari */
          width: 0;
          height: 0;
        }
      `}</style>

      <div 
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300 md:hidden
          ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
        `}
        onClick={onClose}
      ></div>

      <div 
        className={`
          fixed md:static inset-y-0 left-0 z-50 
          w-60 h-screen bg-[#0d264f] text-white shadow-2xl
          transform transition-transform duration-300 ease-in-out flex flex-col
          ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
          md:translate-x-0
        `}
      >
        <div className="p-6 flex items-center justify-between border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3 overflow-hidden">
             <img src={logoEDUSpace} alt="Logo" className="h-9 w-9 object-contain shrink-0" />
            <h1 className="text-xl font-bold tracking-wide text-white whitespace-nowrap">
              Edu<span className="text-blue-400">Space</span>
            </h1>
          </div>

          <button 
            onClick={onClose}
            className="md:hidden text-blue-200 hover:text-white transition-colors"
            aria-label="Close sidebar"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto custom-scrollbar">
          {menuItems.map((item, index) => (
            <NavLink
              key={index}
              to={item.path}
              onClick={() => { if(isMobile) onClose(); }}
              className={({ isActive }) => 
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 relative overflow-hidden group
                ${isActive 
                  ? 'bg-blue-500 text-white font-semibold shadow-lg shadow-blue-500/30' 
                  : 'text-blue-200 hover:text-white hover:bg-white/5'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className={`h-6 w-6 transition-colors duration-200 ${isActive ? 'text-white' : 'text-blue-300'}`} 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                  </svg>
                  <span className="font-medium tracking-wide text-sm">{item.name}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="px-6 py-4 bg-black/20 border-t border-white/5 shrink-0">
            <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full animate-pulse bg-blue-400`}></div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase tracking-widest text-blue-300">Logged as</span>
                  <span className="text-xs font-bold text-white tracking-wide">Teacher</span>
                </div>
            </div>
        </div>
      </div>
    </>
  );
}