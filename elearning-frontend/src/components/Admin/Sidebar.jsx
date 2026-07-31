import React, { useState, createContext, useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import EduSpace from '../../assets/EduSpace.png';
import authService from '../../services/authService';

const SidebarContext = createContext();

const safeParseJSON = (value) => {
  try {
    return JSON.parse(value || '{}');
  } catch {
    return {};
  }
};

const normalizeRole = (role) => {
  if (role === 'admin' || role === 'superadmin' || role === 'super_admin') {
    return 'superAdmin';
  }

  return role || 'superAdmin';
};

const getUserRole = () => {
  const savedUser = safeParseJSON(localStorage.getItem('user'));
  return normalizeRole(savedUser.role || localStorage.getItem('pending_role'));
};

export const SidebarProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => setIsOpen((prev) => !prev);
  const closeSidebar = () => setIsOpen(false);

  return (
    <SidebarContext.Provider value={{ isOpen, toggleSidebar, closeSidebar }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const useSidebar = () => {
  const context = useContext(SidebarContext);

  if (!context) {
    return {
      isOpen: false,
      toggleSidebar: () => {},
      closeSidebar: () => {},
    };
  }

  return context;
};

function SidebarContent() {
  const { isOpen, closeSidebar } = useSidebar();
  const navigate = useNavigate();
  const userRole = getUserRole();

  const menuItems = [
    {
      name: 'Home',
      icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
      path: '/admin/super-dashboard',
      roles: ['superAdmin'],
    },
    {
      name: 'User',
      icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
      path: '/admin/users',
      roles: ['superAdmin'],
    },
    {
      name: 'Manage User',
      icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
      path: '/admin/super-control',
      roles: ['superAdmin'],
    },
    {
      name: 'Classes',
      icon: 'M3 7h18M3 12h18M3 17h18',
      path: '/admin/classes',
      roles: ['superAdmin'],
    },
    {
      name: 'Calendar',
      icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
      path: '/admin/calendar',
      roles: ['superAdmin'],
    },
    {
      name: 'Settings',
      icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z',
      path: '/admin/settings',
      roles: ['superAdmin'],
    },
  ];

  const filteredMenu = menuItems.filter((item) => item.roles.includes(userRole));

  const handleLogout = async () => {
    try {
      await authService.logout();
    } finally {
      localStorage.removeItem('user');
      localStorage.removeItem('pending_user_id');
      localStorage.removeItem('pending_role');
      localStorage.removeItem('pending_email');

      window.dispatchEvent(new Event('user-logout'));
      navigate('/login', { replace: true });
    }
  };

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300 md:hidden ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={closeSidebar}
      />

      <div
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-[#0d264f] text-white shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0`}
      >
        <div className="p-6 flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-2">
            <img src={EduSpace} alt="Logo" className="h-10 w-auto object-contain" />
            <h1 className="text-xl font-bold tracking-wide">
              Edu<span className="text-blue-300">Space</span>
            </h1>
          </div>

          <button onClick={closeSidebar} className="md:hidden text-blue-200 hover:text-white">
            X
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto custom-scrollbar">
          {filteredMenu.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => {
                if (window.innerWidth < 768) closeSidebar();
              }}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                  isActive
                    ? 'bg-white text-[#0d264f] font-bold shadow-md'
                    : 'text-blue-200 hover:text-white hover:bg-white/10'
                }`
              }
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
              </svg>
              <span className="font-medium">{item.name}</span>
            </NavLink>
          ))}
        </nav>

        <div className="px-6 py-4 bg-black/20 border-t border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full animate-pulse bg-purple-400" />
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-widest text-blue-300">
                Logged as
              </span>
              <span className="text-xs font-bold text-white tracking-wide">
                Super Admin
              </span>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-300 hover:bg-red-500/10 hover:text-red-100 transition-all font-semibold"
          >
            Logout
          </button>
        </div>
      </div>
    </>
  );
}

export const HamburgerButton = () => {
  const { toggleSidebar } = useSidebar();

  return (
    <button
      onClick={toggleSidebar}
      className="p-2 rounded-lg text-[#0d264f] md:hidden hover:bg-slate-100 transition-colors"
    >
      Menu
    </button>
  );
};

export default function Sidebar() {
  return <SidebarContent />;
}