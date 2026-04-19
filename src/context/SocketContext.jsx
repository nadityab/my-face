// src/context/SocketContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import api, { API_URL } from "../api";

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [unreadCounts, setUnreadCounts] = useState({});

  // Ambil userId dari localStorage
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    // --- STEP 2: HANDSHAKE AUTH ---
    // Mengirim identitas saat pertama kali kabel socket dicolok
    const newSocket = io(API_URL, {
      withCredentials: true,
      transports: ["polling", "websocket"],
      auth: {
        userId: userId, // Server bisa baca ini di socket.handshake.auth
      },
    });

    setSocket(newSocket);

    // --- STEP 1: AUTO-REGISTER EMIT ---
    // Sebagai backup jika server butuh pemicu manual untuk join room
    if (userId && userId !== "null") {
      console.log("🚀 Mengirim identitas ke server untuk User ID:", userId);
      newSocket.emit("register_user", userId);

      // Jika di backend kamu pakai nama event "join_chat" (sesuai diskusi tadi)
      // Tambahkan juga baris ini:
      newSocket.emit("join_chat", { userId: userId });
    } else {
      console.warn("⚠️ Socket terkoneksi anonim.");
    }

    // 3. Dengerin update user online
    newSocket.on("get_online_users", (users) => {
      console.log("🌐 User online saat ini:", users);
      setOnlineUsers(users);
    });

    // 4. Notifikasi unread messages
    newSocket.on("receive_message", (msg) => {
      const currentUserId = localStorage.getItem("userId");
      if (msg.receiver === currentUserId) {
        setUnreadCounts((prev) => ({
          ...prev,
          [msg.sender]: (prev[msg.sender] || 0) + 1,
        }));
      }
    });

    return () => {
      console.log("🔌 Memutus koneksi socket...");
      newSocket.close();
    };
  }, [userId]);

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
