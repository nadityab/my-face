// src/hooks/useSocket.js
import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import api, { API_URL } from "../api";

export const useSocket = (userId) => {
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
    const newSocket = io(API_URL, {
      withCredentials: true,
    });

    setSocket(newSocket);

    // Register user agar server tahu kita online
    if (userId) {
      newSocket.emit("register_user", userId);
    }

    // Pantau user yang online
    newSocket.on("get_online_users", (users) => {
      setOnlineUsers(users);
    });

    return () => newSocket.close();
  }, [userId]);

  return { socket, onlineUsers };
};
