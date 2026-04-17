import React, { useEffect, useRef } from "react";

const ChatMessages = ({ messages, currentUserId }) => {
  const scrollRef = useRef();

  // Auto scroll ke pesan paling bawah setiap ada pesan baru
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 custom-scrollbar">
      {messages.map((msg, index) => {
        const isMe = msg.sender === currentUserId;
        return (
          <div
            key={index}
            className={`flex ${isMe ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm shadow-sm ${
                isMe
                  ? "bg-blue-600 text-white rounded-br-none"
                  : "bg-white text-gray-800 border border-gray-100 rounded-bl-none"
              }`}
            >
              <p>{msg.message}</p>
              <span
                className={`text-[9px] block mt-1 opacity-70 ${
                  isMe ? "text-right" : "text-left"
                }`}
              >
                {new Date(msg.timestamp).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </div>
        );
      })}
      {/* Element pancingan buat scroll */}
      <div ref={scrollRef} />
    </div>
  );
};

export default ChatMessages;
