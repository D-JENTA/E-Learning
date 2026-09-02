import React, { useState, createContext, useContext } from 'react';
import { NavLink } from 'react-router-dom';
import logoEDUSpace from '../../assets/logoEDUSpace.png';

const SidebarContext = createContext();

export const SidebarStudentProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const toggleSidebar = () => setIsOpen(!isOpen);
  const closeSidebar = () => setIsOpen(false);

  return (
    <SidebarContext.Provider value={{ isOpen, toggleSidebar, closeSidebar }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const useStudentSidebar = () => useContext(SidebarContext);

function SidebarContent() {
  const { isOpen, closeSidebar } = useStudentSidebar();

  const menuItems = [
    { name: 'Home', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6', path: '/student/home' },
    { name: 'My Classes', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253', path: '/student/class' },
    { name: 'Calendar', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', path: '/student/calendar' },
  ];
  // Menu "Settings" dipindahkan ke dropdown profil di Topbar.
  // Logout dipindahkan ke dropdown profil di Topbar.

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
        onClick={closeSidebar}
      ></div>

      <div 
        className={`
          fixed md:static inset-y-0 left-0 z-50 w-60 h-screen bg-[#0d264f] text-white shadow-2xl
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
            onClick={closeSidebar}
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
              onClick={() => { if(window.innerWidth < 768) closeSidebar(); }}
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
                <div className={`w-2 h-2 rounded-full animate-pulse bg-green-400`}></div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase tracking-widest text-blue-300">Logged as</span>
                  <span className="text-xs font-bold text-white tracking-wide">Student</span>
                </div>
            </div>
        </div>
      </div>
    </>
  );
}

export const HamburgerButtonStudent = () => {
  const { toggleSidebar } = useStudentSidebar();
  return (
    <button onClick={toggleSidebar} className="p-2 -ml-2 rounded-lg text-[#0d264f] hover:bg-slate-100 transition-colors">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    </button>
  );
};

export default function SidebarStudent() {
  return <SidebarContent />;
}