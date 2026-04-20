import React, { useState, useEffect, useRef } from "react";
import { useSocket } from "../../context/SocketContext";
import axios from "axios";
import { API_URL } from "../../api";
import ChatMessages from "./ChatMessages";
import ChatInput from "./ChatInput";
import { FaArrowDown } from "react-icons/fa";

const ChatWindow = ({ selectedUser, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [skip, setSkip] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showScrollBtn, setShowScrollBtn] = useState(false);

  const { socket } = useSocket();
  const currentUserId = localStorage.getItem("userId");
  const scrollContainerRef = useRef(null);

  // 1. Fungsi ambil data History (Pagination 10-10)
  const fetchHistory = async (isInitial = false) => {
    if (loading || (!hasMore && !isInitial)) return;

    const container = scrollContainerRef.current;
    const oldScrollHeight = container?.scrollHeight || 0;

    setLoading(true);
    try {
      const currentSkip = isInitial ? 0 : skip;
      const res = await axios.get(
        `${API_URL}/chat/history/${currentUserId}/${selectedUser._id}?limit=10&skip=${currentSkip}`
      );

      const newMessages = res.data;

      if (isInitial) {
        setMessages(newMessages);
        setSkip(10);
        // ✅ AUTO SCROLL: Saat pertama kali buka chat, langsung ke bawah
        setTimeout(() => scrollToBottom(), 100);
      } else {
        setMessages((prev) => [...newMessages, ...prev]);
        setSkip((prev) => prev + 10);

        requestAnimationFrame(() => {
          if (container) {
            const newScrollHeight = container.scrollHeight;
            container.scrollTop = newScrollHeight - oldScrollHeight;
          }
        });
      }

      if (newMessages.length < 10) setHasMore(false);
    } catch (err) {
      console.error("Gagal narik history:", err);
    } finally {
      setLoading(false);
    }
  };

  // 2. Initial Load
  useEffect(() => {
    if (selectedUser) {
      setMessages([]);
      setHasMore(true);
      fetchHistory(true);
      socket?.emit("join_chat", {
        senderId: currentUserId,
        receiverId: selectedUser._id,
      });
    }
  }, [selectedUser]);

  // 3. Deteksi posisi Scroll
  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    if (scrollTop === 0 && hasMore && !loading) {
      fetchHistory();
    }
    const isBottom = scrollHeight - scrollTop - clientHeight < 200;
    setShowScrollBtn(!isBottom);
  };

  const scrollToBottom = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  };

  // ✅ 4. LOGIKA AUTO SCROLL CERDAS
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || messages.length === 0 || loading) return;

    const lastMessage = messages[messages.length - 1];
    const sentByMe = lastMessage.sender === currentUserId;

    // Cek apakah user sedang berada di area bawah (toleransi 150px)
    const { scrollTop, scrollHeight, clientHeight } = container;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 150;

    // Scroll hanya jika:
    // 1. Saya yang kirim pesan
    // 2. Pesan masuk saat saya memang sedang di bawah
    if (sentByMe || isAtBottom) {
      scrollToBottom();
    }
  }, [messages]); // Trigger setiap kali ada pesan baru

  // 5. Socket listener
  useEffect(() => {
    if (!socket) return;
    const handleReceive = (msg) => {
      if (
        (msg.sender === selectedUser._id && msg.receiver === currentUserId) ||
        (msg.sender === currentUserId && msg.receiver === selectedUser._id)
      ) {
        setMessages((prev) => [...prev, msg]);
        setSkip((prev) => prev + 1);
      }
    };

    socket.on("receive_message", handleReceive);
    return () => socket.off("receive_message", handleReceive);
  }, [socket, selectedUser, currentUserId]);

  return (
    <div className="fixed bottom-24 right-6 z-50 w-80 h-112.5 bg-white shadow-2xl rounded-2xl border border-blue-100 flex flex-col overflow-hidden animate-slide-in">
      <div className="p-3 bg-blue-600 text-white flex justify-between items-center shadow-md">
        <div className="flex items-center gap-2">
          <img
            src={
              selectedUser.profilePic ||
              `https://ui-avatars.com/api/?name=${selectedUser.username}`
            }
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

      <div className="relative flex-1 overflow-hidden flex flex-col">
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          style={{ overflowAnchor: "auto" }}
          className="flex-1 overflow-y-auto bg-gray-50 custom-scrollbar"
        >
          {loading && (
            <div className="text-[10px] text-center text-blue-400 py-2">
              Memuat pesan lama...
            </div>
          )}
          <ChatMessages messages={messages} currentUserId={currentUserId} />
        </div>

        {showScrollBtn && (
          <button
            onClick={scrollToBottom}
            className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white p-2.5 rounded-full shadow-lg hover:bg-blue-700 transition-all animate-bounce flex items-center justify-center border border-white/20 z-10"
            title="Scroll ke bawah"
          >
            <FaArrowDown size={14} />
          </button>
        )}
      </div>

      <ChatInput selectedUser={selectedUser} />
    </div>
  );
};

export default ChatWindow;
