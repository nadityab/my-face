import React, { useState, useEffect } from "react";
import axios from "axios";
import { useSocket } from "../../context/SocketContext";
import api, { API_URL } from "../../api";

const ChatWidget = ({ onSelectUser }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const { onlineUsers } = useSocket();

  useEffect(() => {
    if (isOpen) {
      const fetchUsers = async () => {
        try {
          // ✅ Ambil base URL dari environment variable
          // Jika tidak ada, dia akan lari ke localhost sebagai cadangan
          const baseURL = API_URL;

          // Gabungkan dengan path /chat/users
          const res = await axios.get(`${baseURL}/chat/users`);

          console.log("Berhasil load user:", res.data); // Buat mastiin datanya ada
          setUsers(res.data);
        } catch (err) {
          console.error("Gagal load users. Cek koneksi backend kamu!", err);
        }
      };
      fetchUsers();
    }
  }, [isOpen]);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4">
      {/* 1. Jendela Daftar User (Hanya muncul jika isOpen true) */}
      {isOpen && (
        <div className="w-72 h-96 bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden animate-fade-in-up">
          {/* Header Jendela */}
          <div className="p-4 bg-blue-600 text-white font-bold flex justify-between items-center">
            <span>Obrolan</span>
            <button onClick={() => setIsOpen(false)}>✕</button>
          </div>

          {/* Daftar User */}
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {users.length > 0 ? (
              users.map((user) => (
                <div
                  key={user._id}
                  onClick={() => {
                    onSelectUser(user); // Kirim user yang dipilih ke TodoPage
                    setIsOpen(false); // Tutup daftar user
                  }}
                  className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer transition-colors border-b border-gray-50"
                >
                  <div className="relative">
                    <img
                      src={
                        user.profilePic ||
                        `https://ui-avatars.com/api/?name=${user.username}`
                      }
                      className="w-10 h-10 rounded-full object-cover shadow-sm"
                      alt=""
                    />
                    {onlineUsers.includes(user._id) && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-gray-700">
                      {user.username}
                    </span>
                    <span className="text-[10px] text-gray-400">
                      {onlineUsers.includes(user._id) ? "Online" : "Offline"}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-400 text-xs mt-10">
                Belum ada teman...
              </p>
            )}
          </div>
        </div>
      )}

      {/* 2. Tombol Melayang (Floating Button) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all active:scale-90 ${
          isOpen
            ? "bg-gray-200 text-gray-600"
            : "bg-blue-600 text-white hover:bg-blue-700"
        }`}
      >
        {isOpen ? (
          <span className="text-xl font-bold">✕</span>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
            />
          </svg>
        )}
      </button>
    </div>
  );
};

export default ChatWidget;
