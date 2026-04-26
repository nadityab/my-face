import React, { useState, useEffect } from "react";
import axios from "axios";
import { useSocket } from "../../context/SocketContext";
import api, { API_URL } from "../../api";

// ✅ Helper untuk format Last Seen
const formatLastSeen = (dateString) => {
  if (!dateString) return "Offline"; // Jaga-jaga kalau backend belum punya data ini

  const date = new Date(dateString);
  const now = new Date();

  const today = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  ).getTime();
  const yesterday = today - 24 * 60 * 60 * 1000;
  const compareDate = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  ).getTime();

  const timeStr = date.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });

  if (compareDate === today) {
    return `Terakhir aktif hari ini, ${timeStr}`;
  } else if (compareDate === yesterday) {
    return `Terakhir aktif kemarin, ${timeStr}`;
  } else {
    return `Terakhir aktif ${date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })}, ${timeStr}`;
  }
};

const ChatWidget = ({ onSelectUser }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [users, setUsers] = useState([]);

  const { onlineUsers, unreadCounts, resetUnread } = useSocket();
  const currentUserId = localStorage.getItem("userId");
  const totalUnread = Object.values(unreadCounts).reduce((a, b) => a + b, 0);

  useEffect(() => {
    if (isOpen) {
      const fetchUsers = async () => {
        try {
          const baseURL = API_URL;
          const res = await axios.get(`${baseURL}/chat/users`);
          console.log("Berhasil load user:", res.data);
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
      {isOpen && (
        <div className="w-72 h-96 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-slate-800 flex flex-col overflow-hidden animate-fade-in-up transition-colors duration-300">
          <div className="p-4 bg-blue-600 dark:bg-blue-800 text-white font-bold flex justify-between items-center transition-colors duration-300">
            <div className="flex items-center gap-2">
              <span>Obrolan</span>
              {totalUnread > 0 && (
                <span className="bg-red-500 text-[10px] px-1.5 py-0.5 rounded-full text-white">
                  {totalUnread} baru
                </span>
              )}
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:text-blue-200 transition-colors"
            >
              ✕
            </button>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {users.length > 0 ? (
              users
                .filter((u) => u._id !== currentUserId)
                .sort((a, b) => {
                  const aOnline = onlineUsers.includes(a._id);
                  const bOnline = onlineUsers.includes(b._id);
                  return bOnline - aOnline;
                })
                .map((user) => (
                  <div
                    key={user._id}
                    onClick={() => {
                      onSelectUser(user);
                      resetUnread(user._id);
                      setIsOpen(false);
                    }}
                    className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-slate-800 cursor-pointer transition-all border-b border-gray-50 dark:border-slate-800 group"
                  >
                    <div className="flex items-center gap-3">
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
                          <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-slate-900 rounded-full animate-pulse transition-colors duration-300"></span>
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span
                          className={`text-sm font-semibold transition-colors duration-300 ${
                            onlineUsers.includes(user._id)
                              ? "text-blue-600 dark:text-blue-400"
                              : "text-gray-700 dark:text-gray-300"
                          }`}
                        >
                          {user.username}
                        </span>

                        {/* ✅ PERUBAHAN LAST SEEN DI SINI */}
                        <span className="text-[10px] text-gray-400 dark:text-gray-500 transition-colors duration-300">
                          {onlineUsers.includes(user._id)
                            ? "Sedang aktif"
                            : formatLastSeen(user.lastSeen)}{" "}
                          {/* Pastikan nama field-nya 'lastSeen' sesuai dari Backend kamu */}
                        </span>
                      </div>
                    </div>

                    {unreadCounts[user._id] > 0 && (
                      <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm animate-bounce group-hover:animate-none">
                        {unreadCounts[user._id]}
                      </span>
                    )}
                  </div>
                ))
            ) : (
              <p className="text-center text-gray-400 dark:text-gray-500 text-xs mt-10 italic transition-colors duration-300">
                Belum ada teman yang terdaftar...
              </p>
            )}
          </div>
        </div>
      )}

      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 active:scale-90 ${
            isOpen
              ? "bg-gray-200 dark:bg-slate-700 text-gray-600 dark:text-gray-300"
              : "bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600"
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

        {!isOpen && totalUnread > 0 && (
          <div className="absolute -top-1 -left-1 bg-red-600 text-white text-[10px] font-bold w-6 h-6 rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900 shadow-md animate-pulse transition-colors duration-300">
            {totalUnread > 99 ? "99+" : totalUnread}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatWidget;
