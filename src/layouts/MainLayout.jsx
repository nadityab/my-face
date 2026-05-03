import React, { useState } from "react";
import Sidebar from "../components/layout/Sidebar";
import { FaBars } from "react-icons/fa";
import { useFeedContext } from "../context/FeedContext";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../api";

const MainLayout = ({ children }) => {
  const navigate = useNavigate();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  const { totalUnread, notifications, markNotifAsRead } = useFeedContext();
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  // ==========================================
  // FITUR PUSH NOTIFICATION (BACKGROUND)
  // ==========================================

  // 1. Fungsi pengubah format VAPID Key (Wajib untuk Web Push)
  const urlBase64ToUint8Array = (base64String) => {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, "+")
      .replace(/_/g, "/");
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  // 2. Fungsi utama untuk langganan Push Notif
  const enablePushNotifications = async () => {
    if ("serviceWorker" in navigator && "PushManager" in window) {
      try {
        // Daftarkan file sw.js
        const register = await navigator.serviceWorker.register("/sw.js");

        // Minta izin ke user
        const permission = await Notification.requestPermission();
        if (permission !== "granted") {
          alert(
            "Yah, kamu menolak notifikasi. Aktifkan di setting browser ya!"
          );
          return;
        }

        // Ambil Public Key dari .env.local
        const publicVapidKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;

        // Bikin token langganan
        const subscription = await register.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicVapidKey),
        });

        // Kirim token ke backend
        // Kirim token ke backend (Tambahkan /api di sini)
        await fetch(`${API_URL}/notifications/subscribe`, {
          method: "POST",
          // ... sisanya biarkan sama ...
          body: JSON.stringify(subscription),
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`, // Sesuaikan kalau nama tokenmu beda
          },
        });

        alert("Berhasil! Aplikasi akan mengirim notifications walau ditutup.");
      } catch (error) {
        console.error("Gagal mendaftar push notifications:", error);
        alert("Gagal mengaktifkan notifikasi. Cek console log.");
      }
    } else {
      alert("Browser kamu tidak mendukung fitur ini.");
    }
  };

  // Fungsi untuk ngetes tembakan dari backend
  const testTembakNotif = async () => {
    try {
      const res = await fetch(`${API_URL}/notifications/test-push`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await res.json();
      console.log("Respon Backend:", data.message);
    } catch (error) {
      console.error("Gagal nembak:", error);
    }
  };
  // ==========================================

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

          <div className="flex items-center gap-2 shrink-0">
            {/* TOMBOL AKTIFKAN PUSH NOTIFIKASI (Bisa kamu hapus nanti kalau udah ngga dites) */}
            <button
              onClick={enablePushNotifications}
              className="hidden md:block bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-1 px-3 rounded-lg transition-colors mr-2"
            >
              Aktifkan Notif
            </button>
            {/* TOMBOL TEST TEMBAK */}
            <button
              onClick={testTembakNotif}
              className="hidden md:block bg-red-600 hover:bg-red-700 text-white text-xs font-bold py-1 px-3 rounded-lg transition-colors mr-4"
            >
              Test Tembak Notif
            </button>

            {/* Ikon Lonceng Notifikasi */}
            <button
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className="relative p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-all cursor-pointer"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 md:h-6 md:w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>

              {/* AKTIFKAN BADGE NOTIFIKASI */}
              {totalUnread > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] md:text-xs font-bold rounded-full min-w-4.5 h-4.5 md:min-w-5 md:h-5 flex items-center justify-center px-1 shadow-md">
                  {totalUnread > 99 ? "99+" : totalUnread}
                </span>
              )}
            </button>
          </div>
        </header>

        {/* DROPDOWN NOTIFIKASI */}
        {isNotifOpen && (
          <div className="fixed right-4 top-14 w-80 bg-white dark:bg-slate-800 rounded-xl shadow-xl z-50 border border-gray-200 dark:border-slate-700">
            <div className="p-3 border-b border-gray-200 dark:border-slate-700 flex justify-between items-center">
              <h3 className="font-bold text-gray-900 dark:text-white">
                Notifikasi
              </h3>
              <button
                onClick={() => setIsNotifOpen(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <p className="p-4 text-center text-gray-500 dark:text-gray-400 text-sm">
                  Tidak ada notifikasi
                </p>
              ) : (
                notifications.map((notifications) => (
                  <div
                    key={notifications._id}
                    onClick={() => {
                      markNotifAsRead(notifications._id);
                      setIsNotifOpen(false);

                      let postIdToScroll;
                      if (notifications.referenceType === "Todo") {
                        postIdToScroll = notifications.referenceId;
                      } else if (notifications.referenceType === "Comment") {
                        postIdToScroll = notifications.todoId;
                      }

                      navigate("/home", {
                        state: { scrollToPost: postIdToScroll },
                        replace: true,
                      });
                    }}
                    className={`p-3 border-b border-gray-100 dark:border-slate-700 cursor-pointer transition-colors ${
                      !notifications.isRead
                        ? "bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30"
                        : "hover:bg-gray-50 dark:hover:bg-slate-700"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Avatar */}
                      <div className="shrink-0 w-10 h-10 rounded-full bg-linear-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold overflow-hidden">
                        {notifications.fromUserId?.avatar ? (
                          <img
                            src={`${API_URL}${notifications.fromUserId.avatar}`}
                            alt={notifications.fromUserId?.username}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          notifications.fromUserId?.username
                            ?.charAt(0)
                            ?.toUpperCase() || "?"
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          {notifications.fromUserId?.username || "Pengguna"}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-0.5">
                          {notifications.message}
                        </p>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(notifications.createdAt).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* --- ISI HALAMAN --- */}
        <main className="flex-1 overflow-y-auto">
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
