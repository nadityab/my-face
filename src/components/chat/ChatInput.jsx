// src/components/Chat/ChatInput.jsx
import React, { useState } from "react";
import { useSocket } from "../../context/SocketContext";

const ChatInput = ({ selectedUser }) => {
  const [text, setText] = useState("");
  const { socket } = useSocket();
  const currentUserId = localStorage.getItem("userId");

  const handleSend = () => {
    if (!text.trim() || !socket) return;

    const chatData = {
      sender: currentUserId,
      receiver: selectedUser._id,
      message: text,
    };

    socket.emit("send_message", chatData);
    setText("");
  };

  return (
    <div className="p-3 border-t bg-gray-50 flex gap-2">
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSend()}
        placeholder="Ketik pesan..."
        className="flex-1 bg-white border border-gray-200 rounded-full px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-400"
      />
      <button
        onClick={handleSend}
        className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 transform rotate-90"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
          />
        </svg>
      </button>
    </div>
  );
};

export default ChatInput;
