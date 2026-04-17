import React, { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import api, { API_URL } from "../api";

const SocketContext = createContext();

const SOCKET_URL = API_URL;

export const SocketProvider = ({ children, userId }) => {
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
    // Ganti URL dengan URL backend kamu
    const newSocket = io(SOCKET_URL, {
      withCredentials: true,
      transports: ["websocket", "polling"], // Websocket didahulukan
    });

    setSocket(newSocket);

    // Beritahu server kalau kita online
    if (userId) {
      newSocket.emit("register_user", userId);
    }

    // Dengerin siapa aja yang online
    newSocket.on("get_online_users", (users) => {
      setOnlineUsers(users);
    });

    return () => newSocket.close();
  }, [userId]);

  return (
    <SocketContext.Provider value={{ socket, onlineUsers }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
