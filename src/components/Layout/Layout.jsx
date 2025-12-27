import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.innerWidth >= 1024;
  });

  useEffect(() => {
    const handleResize = () => {
      setSidebarOpen(window.innerWidth >= 1024);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebar = () => setSidebarOpen((v) => !v);

  return (
    <div className="h-screen flex bg-gray-100 overflow-hidden">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex flex-col w-full h-screen">
        <Navbar onMenuClick={toggleSidebar} sidebarOpen={sidebarOpen} />

        <main className="p-6 h-full w-full overflow-x-hidden bg-gray-600">
          {children}
        </main>
      </div>
    </div>
  );
}
