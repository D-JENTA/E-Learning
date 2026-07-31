import Sidebar, { SidebarProvider, HamburgerButton } from "./Sidebar";
import Topbar from "./Topbar";

export default function MainLayout({ children }) {
  return (
    <SidebarProvider>
      <div className="min-h-screen bg-gray-50 flex">
        
        <Sidebar />
        
        <div className="flex-1 flex flex-col min-w-0">
          <Topbar />
          
          <main className="md:ml-72 pt-20 px-4 sm:px-8 pb-8 transition-all duration-300">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}