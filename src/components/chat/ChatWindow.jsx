// src/components/Chat/ChatWindow.jsx
import React, { useState, useEffect, useRef } from "react";
import { useSocket } from "../../context/SocketContext";
import axios from "axios";

import ChatMessages from "./ChatMessages";
import ChatInput from "./ChatInput";

import { API_URL } from "../../api";

const SOCKET_URL = API_URL;

const currentUserId = localStorage.getItem("userId");

const ChatWindow = ({ selectedUser, onClose }) => {
  const [messages, setMessages] = useState([]);
  const { socket } = useSocket();
  const currentUserId = localStorage.getItem("userId");
  const baseURL = SOCKET_URL || "http://localhost:3000";

  // 1. Ambil Riwayat Chat (History)
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await axios.get(
          `${baseURL}/chat/history/${currentUserId}/${selectedUser._id}`
        );
        setMessages(res.data);
      } catch (err) {
        console.error("Gagal ambil riwayat chat", err);
      }
    };

    if (selectedUser) {
      fetchHistory();
      // Bergabung ke room private
      socket?.emit("join_chat", {
        senderId: currentUserId,
        receiverId: selectedUser._id,
      });
    }
  }, [selectedUser, socket]);

  // 2. Dengerin Pesan Masuk (Real-time)
  useEffect(() => {
    if (!socket) return;

    socket.on("receive_message", (newMessage) => {
      // Hanya tambahkan pesan jika itu dari orang yang sedang kita ajak chat
      if (
        newMessage.sender === selectedUser._id ||
        newMessage.sender === currentUserId
      ) {
        setMessages((prev) => [...prev, newMessage]);
      }
    });

    return () => socket.off("receive_message");
  }, [socket, selectedUser]);

  useEffect(() => {
    // Tambahkan pengecekan string "null" (sering kejadian di JS)
    const isIdValid =
      currentUserId &&
      currentUserId !== "null" &&
      currentUserId !== "undefined";

    if (!isIdValid || !selectedUser?._id) {
      console.warn("Koneksi ditunda: ID pengirim atau penerima tidak valid.");
      return; // Berhenti di sini, jangan lanjut fetchHistory
    }

    const fetchHistory = async () => {
      try {
        const res = await axios.get(
          `${baseURL}/chat/history/${currentUserId}/${selectedUser._id}`
        );
        setMessages(res.data);
      } catch (err) {
        console.error("Gagal ambil history:", err);
      }
    };

    fetchHistory();
    socket?.emit("join_chat", {
      senderId: currentUserId,
      receiverId: selectedUser._id,
    });
  }, [selectedUser, socket, currentUserId]);

  return (
    <div className="fixed bottom-24 right-6 z-50 w-80 h-112.5 bg-white shadow-2xl rounded-2xl border border-blue-100 flex flex-col overflow-hidden animate-slide-in">
      {/* Header */}
      <div className="p-3 bg-blue-600 text-white flex justify-between items-center shadow-md">
        <div className="flex items-center gap-2">
          <img
            src={selectedUser.profilePic}
            className="w-8 h-8 rounded-full border border-white/50"
            alt=""
          />
          <span className="text-sm font-bold truncate">
            {selectedUser.username}
          </span>
        </div>
        <button onClick={onClose} className="hover:bg-blue-700 p-1 rounded">
          ✕
        </button>
      </div>

      {/* List Pesan */}
      <ChatMessages messages={messages} currentUserId={currentUserId} />

      {/* Input */}
      <ChatInput selectedUser={selectedUser} />
    </div>
  );
};

export default ChatWindow;
