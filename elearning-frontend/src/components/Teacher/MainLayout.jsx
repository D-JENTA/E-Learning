import React, { useState, useEffect } from 'react';
import SidebarTeacher from "./SidebarTeacher";
import TopbarTeacher from "./TopbarTeacher";

export default function MainLayoutTeacher({ children, user }) {
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < 768 : false
  );
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) setIsSidebarOpen(false);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="h-screen w-screen overflow-hidden bg-gray-50 flex flex-col md:flex-row">

      <div className="flex-shrink-0 z-40">
        <SidebarTeacher
          isOpen={isSidebarOpen}
          onClose={closeSidebar}
          isMobile={isMobile}
        />
      </div>

      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">

        <TopbarTeacher
          onToggleSidebar={toggleSidebar}
          isMobile={isMobile}
          user={user}
        />

        <main className="flex-1 overflow-y-auto pt-20 px-4 sm:px-8 pb-8 scroll-smooth">
          <div className="max-w-5xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}