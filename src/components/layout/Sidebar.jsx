import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import { FaSun, FaMoon, FaTimes, FaListUl, FaInfoCircle } from "react-icons/fa";
import { NEWS_UPDATES } from "../../constants/news-updates"; // Sesuaikan path ini!

const Sidebar = ({ isOpen, onClose }) => {
  const { theme, toggleTheme } = useTheme();

  // State untuk kontrol What's New
  const [showNews, setShowNews] = useState(false);
  const [showAllVersions, setShowAllVersions] = useState(false);

  const displayedUpdates = showAllVersions
    ? NEWS_UPDATES
    : NEWS_UPDATES.slice(0, 2);

  // Menu Navigasi Utama
  const menuItems = [
    { path: "/home", name: "Beranda Utama", icon: <FaListUl /> },
    // Kamu bisa tambah menu lain di sini nanti
  ];

  return (
    <aside
      className={`fixed top-0 left-0 z-50 w-80 h-dvh bg-white dark:bg-slate-900 shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col
        ${isOpen ? "translate-x-0" : "-translate-x-full"} 
      `}
    >
      {/* --- HEADER DRAWER --- */}
      <div className="p-5 flex justify-between items-center border-b border-gray-100 dark:border-slate-800 transition-colors">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
          {showNews ? "🚀 What's New" : "Menu Utama"}
        </h2>
        <button
          onClick={() => {
            onClose();
            setShowNews(false); // Reset ke menu utama kalau ditutup
          }}
          className="text-gray-500 hover:text-red-500 dark:text-gray-400 p-1"
        >
          <FaTimes size={20} />
        </button>
      </div>

      {/* --- KONTEN DRAWER (Switch antara Menu vs What's New) --- */}
      {!showNews ? (
        // 🔹 TAMPILAN MENU UTAMA
        <div className="flex-1 flex flex-col px-4 py-2 overflow-y-auto">
          {/* Link Navigasi */}
          <nav className="space-y-2 mb-6">
            <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider px-2 mb-2">
              Navigasi
            </p>
            {menuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose} // Tutup drawer saat diklik
                className={({ isActive }) =>
                  `flex items-center gap-3 p-3 rounded-xl transition-all ${
                    isActive
                      ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-semibold"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800"
                  }`
                }
              >
                {item.icon}
                <span className="text-sm">{item.name}</span>
              </NavLink>
            ))}
          </nav>

          {/* Spacer */}
          <div className="flex-1"></div>

          {/* Bagian Bawah: Tema & What's New */}
          <div className="space-y-3 pt-4 border-t border-gray-100 dark:border-slate-800">
            {/* Tombol Dark Mode */}
            <button
              onClick={toggleTheme}
              className="flex items-center justify-between w-full p-3 rounded-xl bg-gray-50 dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:ring-2 hover:ring-blue-400 transition-all border border-gray-200 dark:border-slate-700"
            >
              <div className="flex items-center gap-3">
                {theme === "light" ? (
                  <FaMoon className="text-blue-600" />
                ) : (
                  <FaSun className="text-yellow-400" />
                )}
                <span className="text-sm font-semibold">
                  {theme === "light" ? "Mode Malam" : "Mode Terang"}
                </span>
              </div>
            </button>

            {/* Tombol Buka What's New */}
            <button
              onClick={() => setShowNews(true)}
              className="w-full flex items-center justify-between p-3 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-colors group border border-transparent"
            >
              <div className="flex items-center gap-3">
                <span className="text-lg group-hover:scale-110 transition-transform">
                  ✨
                </span>
                <span className="font-semibold text-gray-700 dark:text-gray-300 text-sm">
                  What's New
                </span>
              </div>
              <span className="text-gray-400 group-hover:translate-x-1 transition-transform">
                →
              </span>
            </button>
          </div>
        </div>
      ) : (
        // 🔹 TAMPILAN WHAT'S NEW (List Berita)
        <div className="flex-1 flex flex-col min-h-0 animate-in fade-in slide-in-from-right-4 duration-300">
          <div className="px-6 py-2">
            <button
              onClick={() => setShowNews(false)}
              className="text-blue-600 dark:text-blue-400 text-sm font-bold flex items-center gap-1 hover:text-blue-800 transition-colors py-2"
            >
              ← Kembali ke Menu
            </button>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 pl-6 space-y-6 custom-scrollbar">
            {displayedUpdates.map((update) => {
              const colorMap = {
                blue: "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
                indigo:
                  "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400",
                purple:
                  "bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
                green:
                  "bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400",
              };
              const badgeColor =
                colorMap[update.color] ||
                "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400";

              return (
                <section
                  key={update.version}
                  className="relative pl-8 border-l-2 border-gray-100 dark:border-slate-800 last:border-l-transparent pb-4"
                >
                  <span
                    className={`absolute -left-2.75 top-1 h-5 w-5 rounded-full border-4 border-white dark:border-slate-900 shadow-sm ${
                      update.version === NEWS_UPDATES[0].version
                        ? "bg-blue-500"
                        : "bg-gray-300 dark:bg-gray-600"
                    }`}
                  ></span>
                  <div className="mb-1">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${badgeColor}`}
                    >
                      {update.version} • {update.date}
                    </span>
                  </div>
                  <h3 className="font-bold text-gray-800 dark:text-white text-sm">
                    {update.title}
                  </h3>
                  <ul className="text-xs text-gray-500 dark:text-gray-400 list-disc ml-4 mt-2 space-y-2">
                    {update.points.map((point, pIdx) => (
                      <li key={pIdx} className="leading-relaxed">
                        {point}
                      </li>
                    ))}
                  </ul>
                </section>
              );
            })}

            {NEWS_UPDATES.length > 3 && (
              <div className="pt-2 pb-4 flex justify-center">
                <button
                  onClick={() => setShowAllVersions(!showAllVersions)}
                  className="text-xs font-semibold text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-1 px-4 py-2 bg-gray-50 dark:bg-slate-800 rounded-full"
                >
                  {showAllVersions
                    ? "Sembunyikan Versi Lama 🔼"
                    : "Lihat Versi Sebelumnya 🔽"}
                </button>
              </div>
            )}
            <div className="h-10" />
          </div>
        </div>
      )}

      {/* --- FOOTER DRAWER --- */}
      <div className="mt-auto pt-4 pb-4 border-t border-gray-100 dark:border-slate-800 text-center text-[10px] text-gray-400 dark:text-gray-500 transition-colors">
        Build with ❤️ and Fun!
      </div>
    </aside>
  );
};

export default Sidebar;
