import React from "react";
import Sidebar from "../components/layout/Sidebar";

const MainLayout = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-slate-950 transition-colors duration-300">
      {/* Sidebar tetap di posisi kiri */}
      <Sidebar />

      {/* Konten Halaman akan muncul di sini */}
      <main className="flex-1 p-8 overflow-y-auto h-screen">
        <div className="max-w-5xl mx-auto">{children}</div>
      </main>
    </div>
  );
};

export default MainLayout;
