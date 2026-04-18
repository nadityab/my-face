// src/components/Chat/ChatMessages.jsx
import React, { useEffect, useRef } from "react";

const ChatMessages = ({ messages, currentUserId }) => {
  const scrollRef = useRef();
  const lastMessageIdRef = useRef(null);

  useEffect(() => {
    if (messages.length === 0) return;

    // 💡 HANYA AUTO-SCROLL SAAT PERTAMA KALI BUKA CHAT
    if (!lastMessageIdRef.current) {
      scrollRef.current?.scrollIntoView({ behavior: "auto" });
    }

    // Logika auto-scroll untuk pesan baru dihapus sesuai permintaanmu.
    // User sekarang punya kendali penuh.

    lastMessageIdRef.current = messages[messages.length - 1]?._id;
  }, [messages]);

  return (
    <div className="p-4 space-y-3">
      {messages.map((msg, index) => {
        const isMe = msg.sender === currentUserId;
        return (
          <div
            key={msg._id || index}
            className={`flex ${isMe ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm shadow-sm ${
                isMe
                  ? "bg-blue-600 text-white rounded-br-none"
                  : "bg-white text-gray-800 border border-gray-100 rounded-bl-none"
              }`}
            >
              <p className="wrap-break-word leading-relaxed">{msg.message}</p>
              <span
                className={`text-[9px] block mt-1 opacity-70 ${
                  isMe ? "text-right" : "text-left"
                }`}
              >
                {msg.timestamp
                  ? new Date(msg.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "--:--"}
              </span>
            </div>
          </div>
        );
      })}
      <div ref={scrollRef} />
    </div>
  );
};

export default ChatMessages;
