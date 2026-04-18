// src/context/SocketContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);

  // ✅ Tambahkan state buat nampung unread messages
  // Formatnya: { "id_user_a": 2, "id_user_b": 1 }
  const [unreadCounts, setUnreadCounts] = useState({});

  // Ambil userId langsung di dalam useEffect agar selalu fresh
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    // 1. Inisialisasi koneksi
    const SOCKET_URL =
      import.meta.env.VITE_SOCKET_URL || "http://localhost:3000";
    const newSocket = io(SOCKET_URL, {
      withCredentials: true,
      transports: ["polling", "websocket"],
    });

    setSocket(newSocket);

    // 2. Kirim Identitas (Register)
    if (userId && userId !== "null") {
      console.log("🚀 Mengirim identitas ke server untuk User ID:", userId);
      newSocket.emit("register_user", userId);
    } else {
      console.warn(
        "⚠️ Socket terkoneksi anonim karena userId kosong di localStorage."
      );
    }

    // 3. Dengerin update user online
    newSocket.on("get_online_users", (users) => {
      console.log("🌐 User online saat ini:", users);
      setOnlineUsers(users);
    });

    // 4. Notifikasi unread messages
    newSocket.on("receive_message", (msg) => {
      const currentUserId = localStorage.getItem("userId");

      // ✅ LOGIKA NOTIFIKASI:
      // Jika pesan buat saya DAN saya sedang tidak buka chat sama orang itu
      // (Kita asumsikan pengecekan window terbuka dilakukan di tingkat UI)
      if (msg.receiver === currentUserId) {
        setUnreadCounts((prev) => ({
          ...prev,
          [msg.sender]: (prev[msg.sender] || 0) + 1,
        }));
      }
    });

    //penting (hiraukan)
    return () => {
      console.log("🔌 Memutus koneksi socket...");
      newSocket.close();
    };
  }, [userId]); // <--- Dependency userId sangat penting!

  // Fungsi buat hapus notif pas chat dibuka
  const resetUnread = (senderId) => {
    setUnreadCounts((prev) => {
      const newCounts = { ...prev };
      delete newCounts[senderId];
      return newCounts;
    });
  };

  return (
    <SocketContext.Provider
      value={{ socket, onlineUsers, unreadCounts, resetUnread }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
