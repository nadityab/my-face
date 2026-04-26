import React, { useState } from "react";
import Sidebar from "../components/layout/Sidebar";
import { FaBars } from "react-icons/fa";

const MainLayout = ({ children }) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-slate-950 transition-colors duration-300">
      {/* 1. SIDEBAR (Drawer Kiri) */}
      <Sidebar isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />

      {/* 2. AREA KONTEN UTAMA */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* --- NAVBAR ATAS (Header) --- */}
        <header className="sticky top-0 z-30 flex justify-between items-center bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-3 md:p-4 shadow-sm border-b border-gray-200 dark:border-slate-800 transition-colors">
          <div className="flex items-center gap-3 md:gap-4 min-w-0 flex-1">
            {/* Tombol Hamburger pemicu Drawer */}
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-all"
            >
              <FaBars size={20} />
            </button>
            <h2 className="text-sm xs:text-base md:text-xl font-bold text-gray-800 dark:text-white tracking-tight truncate select-none">
              MyFace{" "}
              <span className="text-blue-600 dark:text-blue-400">is Fun</span>
            </h2>
          </div>

          {/* Tombol Logout */}
          <div className="shrink-0 ml-2">
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-3 md:px-4 py-2 rounded-lg text-[10px] xs:text-xs md:text-sm font-semibold transition-all active:scale-95 shadow-sm whitespace-nowrap"
            >
              Logout
            </button>
          </div>
        </header>

        {/* --- ISI HALAMAN (TodoPage / ChatPage akan masuk ke sini) --- */}
        <main className="flex-1 overflow-y-auto">
          {/* Padding dikurangi karena sudah ada di dalam TodoPage bawaannya */}
          <div className="max-w-xl mx-auto py-6">{children}</div>
        </main>
      </div>

      {/* --- OVERLAY GELAP (Saat Drawer Terbuka) --- */}
      {isDrawerOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 transition-opacity animate-in fade-in"
          onClick={() => setIsDrawerOpen(false)}
        />
      )}
    </div>
  );
};

export default MainLayout;
