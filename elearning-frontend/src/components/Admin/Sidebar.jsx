import React, { useState, useEffect, createContext, useContext } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import logoEDUSpace from '../../assets/logoEDUSpace.png';
import authService from '../../services/authService';

const SidebarContext = createContext();

const normalizeRole = (role) => {
  if (role === 'admin' || role === 'superadmin' || role === 'super_admin') {
    return 'superAdmin';
  }

  return role || 'superAdmin';
};

const getUserRole = () => {
  const currentUser = authService.getCurrentUser();
  return normalizeRole(currentUser?.role || localStorage.getItem('pending_role'));
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
  const location = useLocation();
  const userRole = getUserRole();

  // Submenu "User" terbuka otomatis saat sedang berada di halaman anak-nya.
  const isUserSection =
    location.pathname.startsWith('/admin/teachers') ||
    location.pathname.startsWith('/admin/students');
  const [userMenuOpen, setUserMenuOpen] = useState(isUserSection);

  useEffect(() => {
    if (isUserSection) setUserMenuOpen(true);
  }, [isUserSection]);

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
      roles: ['superAdmin'],
      // Menu dropdown: klik "User" membuka submenu Guru/Siswa
      children: [
        { name: 'Guru', path: '/admin/teachers' },
        { name: 'Siswa', path: '/admin/students' },
      ],
    },
    {
      name: 'Classes',
      icon: 'M3 7h18M3 12h18M3 17h18',
      path: '/admin/classes',
      roles: ['superAdmin'],
    },
   // {
      //name: 'Create Mapel',
      //icon: 'M12 4v16m8-8H4',
     // path: '/admin/create-mapel',
      //roles: ['superAdmin'],
    //},
    {
      name: 'Mapel',
      icon: 'M4 6h16M4 10h16M4 14h16M4 18h16',
      path: '/admin/mapels',
      roles: ['superAdmin'],
    },
    {
      name: 'Calendar',
      icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
      path: '/admin/calendar',
      roles: ['superAdmin'],
    },
  ];
  // Menu "Settings" dipindahkan ke dropdown profil di Topbar.

  const filteredMenu = menuItems.filter((item) => item.roles.includes(userRole));
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
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300 md:hidden ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={closeSidebar}
      />

      <div
        className={`fixed inset-y-0 left-0 z-50 w-60 bg-[#0d264f] text-white shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0`}
      >
        <div className="p-6 flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-3">
            <img src={logoEDUSpace} alt="Logo" className="h-9 w-9 object-contain shrink-0" />
            <h1 className="text-xl font-bold tracking-wide">
              Edu<span className="text-blue-300">Space</span>
            </h1>
          </div>

          <button onClick={closeSidebar} className="md:hidden text-blue-200 hover:text-white">
            X
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto custom-scrollbar">
          {filteredMenu.map((item) =>
            item.children ? (
              <div key={item.name}>
                <button
                  type="button"
                  onClick={() => setUserMenuOpen((prev) => !prev)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                    isUserSection && userMenuOpen
                      ? 'bg-white/10 text-white font-bold'
                      : 'text-blue-200 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                  </svg>
                  <span className="font-medium flex-1 text-left">{item.name}</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-4 w-4 shrink-0 transition-transform duration-300 ${userMenuOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    userMenuOpen ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <div className="mt-1 space-y-1 pl-6">
                    {item.children.map((child) => (
                      <NavLink
                        key={child.path}
                        to={child.path}
                        onClick={() => {
                          if (window.innerWidth < 768) closeSidebar();
                        }}
                        className={({ isActive }) =>
                          `flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300 text-sm ${
                            isActive
                              ? 'bg-white text-[#0d264f] font-bold shadow-md'
                              : 'text-blue-200 hover:text-white hover:bg-white/10'
                          }`
                        }
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60" />
                        <span className="font-medium">{child.name}</span>
                      </NavLink>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
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
            )
          )}
        </nav>

        <div className="px-6 py-4 bg-black/20 border-t border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full animate-pulse bg-purple-400" />
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-widest text-blue-300">
                Logged as
              </span>
              <span className="text-xs font-bold text-white tracking-wide">
                Admin
              </span>
            </div>
          </div>
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