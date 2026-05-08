import React, { forwardRef, useImperativeHandle } from "react";
import { Image } from "antd";
import useAddComment from "../hooks/useAddComment";
import MentionTextarea from "./MentionTextarea";
import { API_URL } from "../api";

// ✅ Menggunakan forwardRef agar PostCard bisa memanggil fungsi di dalam komponen ini
const CommentInputBox = forwardRef(
  (
    { todoId, api, setComments, fetchAllTodos, currentUser, users = [] },
    ref
  ) => {
    // Panggil Sang Otak (Custom Hook)
    const {
      text,
      setText,
      image,
      setImage,
      isLoading,
      handleImageChange,
      submitComment,
    } = useAddComment(todoId, api, setComments, fetchAllTodos);

    // ✅ Ekspos fungsi addReply ke Parent (PostCard)
    useImperativeHandle(ref, () => ({
      addReply: (username) => {
        // 1. Masukkan mention ke state text di Hook
        setText(`@${username} `);

        // 2. Berikan fokus kursor ke input yang sesuai ID-nya
        setTimeout(() => {
          const inputElement = document.getElementById(
            `input-comment-${todoId}`
          );
          if (inputElement) {
            inputElement.focus();
            // Opsional: Scroll ke arah input box agar terlihat di layar
            inputElement.scrollIntoView({
              behavior: "smooth",
              block: "center",
            });
          }
        }, 100);
      },
    }));

    return (
      <div className="mt-4 flex gap-2 items-end w-full transition-colors duration-300">
        {/* Avatar User */}
        <div className="shrink-0 w-8 h-8 rounded-full bg-blue-100 dark:bg-slate-700 flex items-center justify-center text-[10px] font-bold text-blue-600 dark:text-blue-400 shadow-sm mb-1 transition-colors duration-300 overflow-hidden">
          {currentUser?.avatar ? (
            <img
              src={`${API_URL}${currentUser.avatar}`}
              alt={currentUser?.username}
              className="w-full h-full object-cover"
            />
          ) : (
            currentUser?.username?.charAt(0)?.toUpperCase() || "?"
          )}
        </div>

        {/* BUBBLE ABU-ABU UTAMA */}
        <div className="flex-1 flex flex-col bg-gray-100 dark:bg-slate-800 rounded-2xl p-2 shadow-inner transition-colors duration-300 overflow-hidden">
          {/* 1. AREA PREVIEW GAMBAR */}
          {image && (
            <div className="relative self-start mb-2 ml-1">
              <div className="relative rounded-lg overflow-hidden border border-gray-300/50 dark:border-slate-600/50 bg-black/5 dark:bg-white/5 flex items-center justify-center p-0.5 transition-colors duration-300">
                <Image
                  src={URL.createObjectURL(image)}
                  styles={{
                    root: {
                      display: "flex",
                      maxHeight: "192px",
                      maxWidth: "300px",
                    },
                  }}
                  style={{
                    maxHeight: "128px",
                    maxWidth: "200px",
                    objectFit: "contain",
                  }}
                  className="rounded-md shadow-sm cursor-pointer"
                  alt="preview"
                />
              </div>
              {/* Tombol Hapus (Silang) */}
              <button
                onClick={() => setImage(null)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-[11px] font-bold flex items-center justify-center shadow-md hover:bg-red-600 z-20 transition-transform hover:scale-110"
              >
                ✕
              </button>
            </div>
          )}

          {/* 2. BARIS INPUT TEKS & ICON */}
          <div className="flex items-center w-full">
            {/* Icon Kamera */}
            <label
              htmlFor={`upload-comment-image-${todoId}`}
              className="shrink-0 mr-2 ml-1 cursor-pointer hover:scale-110 transition-transform active:scale-95 text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 relative"
            >
              <span className="text-lg">📷</span>
              <input
                id={`upload-comment-image-${todoId}`}
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleImageChange}
              />
            </label>

            {/* Input Teks Utama (MentionTextarea) */}
            <MentionTextarea
              id={`input-comment-${todoId}`} // ✅ ID Penting untuk fitur Fokus
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Tulis komentar..."
              users={users}
              className="flex-1 bg-transparent border-none outline-none text-sm py-1.5 px-1 min-w-0 text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 resize-none overflow-hidden custom-scrollbar max-h-32 transition-colors duration-300"
              rows={1}
            />

            {/* Tombol Kirim */}
            <button
              onClick={submitComment}
              disabled={isLoading || (!text.trim() && !image)}
              className="disabled:opacity-50 transition-all ml-2 shrink-0 pr-1"
            >
              {isLoading ? (
                <div className="h-5 w-5 border-2 border-blue-600 dark:border-blue-400 border-t-transparent rounded-full animate-spin transition-colors duration-300"></div>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`h-5 w-5 transition-colors duration-300 ${
                    text.trim() || image
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-gray-400 dark:text-gray-600"
                  }`}
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }
);

export default CommentInputBox;
