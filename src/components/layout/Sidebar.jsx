import React from "react";
import { NavLink } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import {
  FaSun,
  FaMoon,
  FaListUl,
  FaComments,
  FaInfoCircle,
} from "react-icons/fa";

const Sidebar = () => {
  const { theme, toggleTheme } = useTheme();

  const menuItems = [
    { path: "/todos", name: "Tugas Saya", icon: <FaListUl /> },
    { path: "/chat", name: "Obrolan", icon: <FaComments /> },
  ];

  return (
    <aside className="w-64 h-screen bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800 flex flex-col transition-colors duration-300">
      {/* Logo / Brand */}
      <div className="p-6 border-b border-gray-100 dark:border-slate-800">
        <h1 className="text-xl font-bold text-blue-600 dark:text-blue-400">
          MyFace
        </h1>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 p-3 rounded-xl transition-all ${
                isActive
                  ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800"
              }`
            }
          >
            {item.icon}
            <span className="font-medium text-sm">{item.name}</span>
          </NavLink>
        ))}
      </nav>

      {/* Bottom Section (Setelan & What's New) */}
      <div className="p-4 border-t border-gray-100 dark:border-slate-800 space-y-2">
        {/* 🔘 TOMBOL DARK MODE (Di atas What's New) */}
        <button
          onClick={toggleTheme}
          className="flex items-center gap-3 w-full p-3 rounded-xl bg-gray-50 dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:ring-2 hover:ring-blue-400 dark:hover:ring-blue-500 transition-all border border-gray-200 dark:border-slate-700"
        >
          {theme === "light" ? (
            <>
              <FaMoon className="text-blue-600" />
              <span className="text-sm font-semibold">Mode Malam</span>
            </>
          ) : (
            <>
              <FaSun className="text-yellow-400" />
              <span className="text-sm font-semibold">Mode Terang</span>
            </>
          )}
        </button>

        {/* WHAT'S NEW */}
        <button className="flex items-center gap-3 w-full p-3 text-gray-500 dark:text-gray-400 hover:text-blue-500 transition-colors">
          <FaInfoCircle size={14} />
          <span className="text-xs font-medium">✨ What's New</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
