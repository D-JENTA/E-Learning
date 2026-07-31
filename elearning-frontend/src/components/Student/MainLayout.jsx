import React from 'react';
import SidebarStudent, { SidebarStudentProvider } from "./SidebarStudent";
import TopbarStudent from "./TopbarStudent";

export default function MainLayoutStudent({ children }) {
  return (
    <SidebarStudentProvider>
      <div className="h-screen w-screen overflow-hidden bg-gray-50 flex flex-col md:flex-row">
        
        <div className="flex-shrink-0 z-40">
          <SidebarStudent />
        </div>
        
        <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
          
          <TopbarStudent />
          
          {
            }
          <main className="flex-1 overflow-y-auto pt-20 px-4 sm:px-8 pb-8 scroll-smooth">
            <div className="max-w-5xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarStudentProvider>
  );
}