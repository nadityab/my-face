import React, { useState, useEffect } from "react";
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
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [showNotifBanner, setShowNotifBanner] = useState(false);
  // +++ State untuk checkbox "Jangan tampilkan lagi"
  const [dontShowAgain, setDontShowAgain] = useState(false);

  // ==========================================
  // FITUR PUSH NOTIFICATION & PWA
  // ==========================================
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    // Fungsi pengecekan saat pertama kali aplikasi dibuka
    const checkNotificationStatus = () => {
      const isHidden = localStorage.getItem("hideNotifBanner");

      // HANYA muncul jika:
      // - Browser dukung Notifikasi
      // - Izin masih 'default' (belum pernah milih Allow/Block di browser)
      // - User belum pernah centang "Jangan Tampilkan Lagi"
      if (
        "Notification" in window &&
        Notification.permission === "default" &&
        isHidden !== "true" // Cek string "true"
      ) {
        setShowNotifBanner(true);
      }
    };

    checkNotificationStatus();
  }, []);

  useEffect(() => {
    const checkBanner = () => {
      // Ambil data dari localStorage (hasilnya adalah string "true" atau null)
      const isHidden = localStorage.getItem("hideNotifBanner");

      // Logika: Munculkan jika browser dukung, izin masih default, DAN belum pernah diceklis "jangan tampilkan"
      if (
        "Notification" in window &&
        Notification.permission === "default" &&
        isHidden !== "true" // Membandingkan string "true"
      ) {
        setShowNotifBanner(true);
      }
    };

    checkBanner();
  }, []);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBanner(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    // Deteksi iOS untuk manual PWA prompt
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isApple = /iphone|ipad|ipod/.test(userAgent);
    const isStandalone = window.navigator.standalone;

    if (isApple && !isStandalone) {
      setShowInstallBanner(true);
    }

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstallClick = async () => {
    // 1. Cek apakah event 'beforeinstallprompt' sudah ditangkap dan disimpan di state
    if (deferredPrompt) {
      // 2. Di sinilah kita "membayar hutang" ke browser dengan memanggil .prompt()
      deferredPrompt.prompt();

      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === "accepted") {
        console.log("User menginstal MyFace! 🚀");
        setShowInstallBanner(false);
      }

      // 3. Reset state karena event ini hanya bisa dipakai sekali
      setDeferredPrompt(null);
    } else {
      // Untuk iOS yang tidak mendukung beforeinstallprompt
      alert(
        "Di iPhone: Klik ikon 'Share' lalu pilih 'Add to Home Screen' ya Bre! 🔥"
      );
    }
  };

  // Helper VAPID Key
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

  // 2. Fungsi Utama Langganan Push (FIXED)
  const enablePushNotifications = async () => {
    if (Notification.permission === "denied") {
      alert(
        "Izin diblokir, Bre! 🔥\n\nKamu harus klik ikon gembok (🔒) atau apapun itu di sebelah alamat URL (bagian atas website), lalu ubah izin Notifikasi jadi 'Allow' secara manual."
      );
      setShowNotifBanner(false); // +++ TAMBAHAN: Tutup banner karena sudah tidak bisa diproses lewat tombol
      return;
    }

    if ("serviceWorker" in navigator && "PushManager" in window) {
      try {
        const register = await navigator.serviceWorker.register("/sw.js");

        // 2. Jika statusnya 'default', baru pop-up browser akan muncul
        const permission = await Notification.requestPermission();

        if (permission !== "granted") {
          alert(
            "Yah, kamu menolak akses notifikasi. Selanjutnya harus lewat setelan browser ya kalau mau aktifin!"
          );
          setShowNotifBanner(false); // +++ TAMBAHAN: Tutup banner karena user sudah membuat keputusan (menolak)
          return;
        }

        const publicVapidKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;

        // PENTING: Bungkus dalam objek { subscription } agar sesuai backend
        const subscription = await register.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicVapidKey),
        });

        // ✅ PERBAIKAN: Kirim sebagai objek { subscription }
        await fetch(`${API_URL}/notifications/subscribe`, {
          method: "POST",
          body: JSON.stringify({ subscription }), // Dibungkus objek
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        alert("Berhasil! Notifikasi background aktif. ✅");
        setShowNotifBanner(false);
      } catch (error) {
        console.error("Gagal mendaftar push:", error);
        alert("Gagal mengaktifkan notifikasi.");
      }
    } else {
      alert("Browser tidak mendukung Web Push.");
    }
  };

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

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-slate-950 transition-colors duration-300">
      <Sidebar isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 flex justify-between items-center bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-3 md:p-4 shadow-sm border-b border-gray-200 dark:border-slate-800 transition-colors">
          <div className="flex items-center gap-3 md:gap-4 min-w-0 flex-1">
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
            <button
              onClick={enablePushNotifications}
              className="hidden md:block bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-1 px-3 rounded-lg transition-colors mr-2"
            >
              Aktifkan Notif
            </button>
            <button
              onClick={testTembakNotif}
              className="hidden md:block bg-red-600 hover:bg-red-700 text-white text-xs font-bold py-1 px-3 rounded-lg transition-colors mr-4"
            >
              Test Tembak Notif
            </button>

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
              {totalUnread > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] md:text-xs font-bold rounded-full min-w-4.5 h-4.5 md:min-w-5 md:h-5 flex items-center justify-center px-1 shadow-md">
                  {totalUnread > 99 ? "99+" : totalUnread}
                </span>
              )}
            </button>
          </div>
        </header>

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
                notifications.map((notif) => (
                  <div
                    key={notif._id}
                    onClick={() => {
                      markNotifAsRead(notif._id);
                      setIsNotifOpen(false);
                      const postIdToScroll =
                        notif.referenceType === "Todo"
                          ? notif.referenceId
                          : notif.todoId;
                      navigate("/home", {
                        state: { scrollToPost: postIdToScroll },
                        replace: true,
                      });
                    }}
                    className={`p-3 border-b border-gray-100 dark:border-slate-700 cursor-pointer transition-colors ${
                      !notif.isRead
                        ? "bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30"
                        : "hover:bg-gray-50 dark:hover:bg-slate-700"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="shrink-0 w-10 h-10 rounded-full bg-linear-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold overflow-hidden">
                        {notif.fromUserId?.avatar ? (
                          <img
                            src={`${API_URL}${notif.fromUserId.avatar}`}
                            alt={notif.fromUserId?.username}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          notif.fromUserId?.username
                            ?.charAt(0)
                            ?.toUpperCase() || "?"
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          {notif.fromUserId?.username || "Pengguna"}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-0.5">
                          {notif.message}
                        </p>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(notif.createdAt).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-xl mx-auto py-6">{children}</div>
        </main>
      </div>

      {isDrawerOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 transition-opacity animate-in fade-in"
          onClick={() => setIsDrawerOpen(false)}
        />
      )}

      {/* OVERLAY & BANNER PERSISTENT NOTIFIKASI */}
      {showNotifBanner && (
        <>
          {/* LAPISAN OVERLAY */}
          <div
            className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm z-9998 transition-opacity animate-in fade-in duration-300"
            onClick={() => setShowNotifBanner(false)}
          />

          {/* BANNER */}
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-105 bg-white dark:bg-slate-800 border-l-4 border-blue-500 shadow-2xl p-6 rounded-xl z-9999 animate-in zoom-in-95 duration-300">
            <div className="flex flex-col gap-4">
              {/* Bagian Atas: Ikon & Teks */}
              <div className="flex items-start gap-4">
                <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full text-3xl shrink-0">
                  🔔
                </div>
                <div>
                  <h4 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">
                    Aktifkan Notifikasi?
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                    Jangan lewatkan komentar, mention, dan update penting
                    lainnya di <strong>MyFace</strong>.
                  </p>
                </div>
              </div>

              {/* +++ BAGIAN BARU: Checkbox "Jangan tampilkan lagi" */}
              <div className="flex items-center gap-2 px-1">
                <input
                  type="checkbox"
                  id="dontShow"
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  checked={dontShowAgain}
                  onChange={(e) => setDontShowAgain(e.target.checked)}
                />
                <label
                  htmlFor="dontShow"
                  className="text-xs text-gray-500 dark:text-gray-400 cursor-pointer select-none"
                >
                  Jangan tampilkan lagi jika saya memilih "Nanti"
                </label>
              </div>

              {/* Bagian Bawah: Tombol Aksi */}
              <div className="flex items-center justify-end gap-3 mt-2">
                <button
                  onClick={() => {
                    // +++ Simpan pilihan ke localStorage jika dicentang
                    if (dontShowAgain) {
                      localStorage.setItem("hideNotifBanner", "true");
                    }
                    setShowNotifBanner(false);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                >
                  Nanti Saja
                </button>
                <button
                  onClick={enablePushNotifications}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold py-2.5 px-6 rounded-lg shadow-lg shadow-blue-500/30 transition-all active:scale-95"
                >
                  Ya, Aktifkan!
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* BANNER INSTALASI PWA */}
      {/* ✅ PERBAIKAN: Tambahkan !showNotifBanner agar tidak bentrok */}
      {showInstallBanner && !showNotifBanner && (
        <div className="fixed bottom-6 left-4 right-4 md:left-auto md:right-6 md:w-80 bg-slate-900 border border-slate-700 text-white p-4 rounded-xl shadow-2xl z-9990 animate-bounce-subtle">
          <div className="flex flex-col gap-3">
            <div className="flex items-start justify-between">
              <div className="flex gap-3">
                <div className="bg-blue-600 p-2 rounded-lg">🚀</div>
                <div>
                  <h4 className="font-bold text-sm">Install MyFace App</h4>
                  <p className="text-xs text-slate-400">
                    Dapatkan notifikasi secara real-time & akses lebih cepat!
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowInstallBanner(false)}
                className="text-slate-500 hover:text-white"
              >
                ✕
              </button>
            </div>
            <button
              onClick={handleInstallClick}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-lg text-sm font-semibold transition-all"
            >
              {deferredPrompt ? "Instal Sekarang" : "Cara Instal di iPhone"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MainLayout;
