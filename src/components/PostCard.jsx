import React from "react";
import { Image } from "antd";
import CommentInputBox from "./CommentInputBox"; // Sesuaikan path jika beda

import api, { API_URL } from "../api";

const PostCard = ({
  todo,
  currentUser,
  api,
  comments,
  setComments,
  activeCommentBox,
  setActiveCommentBox,
  openMenuId,
  setOpenMenuId,
  formatTimestamp,
  handleLike,
  handleShare,
  startEdit,
  handleDelete,
  handleLikeComment,
  handleDeleteComment,
  refreshFeed,
}) => {
  const isMyPost = todo.userId?._id === currentUser?._id;

  return (
    <div
      id={todo._id}
      style={{ scrollMarginTop: "100px" }}
      className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden relative"
    >
      {/* --- HEADER POST --- */}
      <div className="flex items-center justify-between p-4 gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-linear-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-inner">
            {todo.userId?.username?.charAt(0).toUpperCase() || "A"}
          </div>
          <div className="flex flex-col">
            <strong className="text-sm text-gray-900 hover:underline cursor-pointer">
              {todo.userId?.username || "Anonymous"}
            </strong>
            <span className="text-xs text-gray-500">
              {formatTimestamp(todo.createdAt)} • 🌍 Public
            </span>
          </div>
        </div>
        {isMyPost && (
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setOpenMenuId(openMenuId === todo._id ? null : todo._id);
              }}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-gray-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                />
              </svg>
            </button>
            {openMenuId === todo._id && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setOpenMenuId(null)}
                ></div>
                <div className="absolute right-0 top-full mt-1 w-32 bg-white border rounded-lg shadow-xl z-20">
                  <button
                    onClick={() => {
                      startEdit(todo);
                      setOpenMenuId(null);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50"
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => {
                      handleDelete(todo._id);
                      setOpenMenuId(null);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    🗑️ Delete
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* --- BODY POST --- */}
      <div className="px-4 py-3 border-t border-gray-50">
        <p className="text-base leading-relaxed text-gray-800 mb-3 whitespace-pre-wrap">
          {todo.task}
        </p>

        {/* LOGIKA BANYAK GAMBAR */}
        {todo.images && todo.images.length > 0 && (
          <div className="mt-3 -mx-4 sm:mx-0">
            <Image.PreviewGroup>
              {todo.images.length === 1 && (
                <div className="rounded-lg overflow-hidden flex justify-center items-center bg-gray-50">
                  <Image
                    src={`${API_URL}${todo.images[0]}`}
                    className="max-w-full h-auto object-contain max-h-112.5 cursor-pointer sm:rounded-xl"
                    width="100%"
                  />
                </div>
              )}
              {todo.images.length === 2 && (
                <div className="grid grid-cols-2 gap-1 sm:rounded-xl overflow-hidden">
                  <Image
                    src={`${API_URL}${todo.images[0]}`}
                    className="aspect-square object-cover w-full cursor-pointer"
                    width="100%"
                  />
                  <Image
                    src={`${API_URL}${todo.images[1]}`}
                    className="aspect-square object-cover w-full cursor-pointer"
                    width="100%"
                  />
                </div>
              )}
              {todo.images.length === 3 && (
                <div className="grid grid-cols-2 gap-1 sm:rounded-xl overflow-hidden">
                  <div className="col-span-2">
                    <Image
                      src={`${API_URL}${todo.images[0]}`}
                      className="aspect-video object-cover w-full cursor-pointer"
                      width="100%"
                    />
                  </div>
                  <Image
                    src={`${API_URL}${todo.images[1]}`}
                    className="aspect-square object-cover w-full cursor-pointer"
                    width="100%"
                  />
                  <Image
                    src={`${API_URL}${todo.images[2]}`}
                    className="aspect-square object-cover w-full cursor-pointer"
                    width="100%"
                  />
                </div>
              )}
              {todo.images.length >= 4 && (
                <div className="grid grid-cols-3 gap-1 sm:rounded-xl overflow-hidden">
                  <div className="col-span-3">
                    <Image
                      src={`${API_URL}${todo.images[0]}`}
                      className="aspect-video object-cover w-full cursor-pointer"
                      width="100%"
                    />
                  </div>
                  <Image
                    src={`${API_URL}${todo.images[1]}`}
                    className="aspect-square object-cover w-full cursor-pointer"
                    width="100%"
                  />
                  <Image
                    src={`${API_URL}${todo.images[2]}`}
                    className="aspect-square object-cover w-full cursor-pointer"
                    width="100%"
                  />
                  <div className="relative w-full h-full">
                    <Image
                      src={`${API_URL}${todo.images[3]}`}
                      className="aspect-square object-cover w-full cursor-pointer block"
                      width="100%"
                    />
                    {todo.images.length > 4 && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-2xl font-bold pointer-events-none shadow-inner">
                        +{todo.images.length - 4}
                      </div>
                    )}
                  </div>
                </div>
              )}
              {/* Sisa Gambar Hidden untuk PreviewGroup */}
              {todo.images.length > 4 && (
                <div className="hidden">
                  {todo.images.slice(4).map((img, index) => (
                    <Image key={index + 4} src={`${API_URL}${img}`} />
                  ))}
                </div>
              )}
            </Image.PreviewGroup>
          </div>
        )}

        {/* LOGIKA 1 GAMBAR LAMA (Fallback) */}
        {todo.image && (!todo.images || todo.images.length === 0) && (
          <div className="mt-3 rounded-lg overflow-hidden flex justify-center items-center bg-gray-50">
            <Image
              src={`${API_URL}${todo.image}`}
              className="max-w-full h-auto object-contain max-h-112.5 cursor-pointer sm:rounded-xl"
              width="100%"
            />
          </div>
        )}
      </div>

      {/* --- TOMBOL ENGAGEMENT --- */}
      <div className="flex items-center gap-6 px-4 py-2 border-t border-b border-gray-50 bg-gray-50/30">
        <button
          onClick={() => handleLike(todo._id)}
          className={`flex items-center gap-2 transition-all active:scale-125 ${
            (todo.likes || []).includes(currentUser?._id)
              ? "text-pink-500"
              : "text-gray-500 hover:text-pink-500"
          }`}
        >
          <span className="text-xl">
            {(todo.likes || []).includes(currentUser?._id) ? "❤️" : "🤍"}
          </span>
          <span className="text-xs font-bold">
            {todo.likes?.length || 0} Likes
          </span>
        </button>

        <button
          onClick={() =>
            setActiveCommentBox(activeCommentBox === todo._id ? null : todo._id)
          }
          className={`flex items-center gap-1.5 px-2 py-1 rounded-md transition-colors text-sm font-semibold ${
            activeCommentBox === todo._id
              ? "text-blue-600 bg-blue-50"
              : "text-gray-500 hover:bg-gray-100"
          }`}
        >
          <span className="text-xl">💬</span>
          <span>{comments[todo._id]?.length || 0} Komentar</span>
        </button>

        <button
          onClick={() => handleShare(todo)}
          className="flex items-center gap-2 text-gray-500 hover:text-blue-500 transition-colors"
        >
          <span className="text-xl">🚀</span>
          <span className="text-xs font-bold">Share</span>
        </button>
      </div>

      {/* --- AREA KOMENTAR --- */}
      <div className="px-4 pb-4 bg-white border-t border-gray-50">
        {comments[todo._id]?.length > 1 && (
          <button
            onClick={() =>
              setActiveCommentBox(
                activeCommentBox === todo._id ? null : todo._id
              )
            }
            className="text-xs text-blue-600 font-bold hover:underline py-2"
          >
            {activeCommentBox === todo._id
              ? "Sembunyikan komentar"
              : `Lihat ${comments[todo._id].length - 1} komentar lainnya`}
          </button>
        )}

        <div className="mt-2 space-y-4">
          {(activeCommentBox === todo._id
            ? comments[todo._id]
            : comments[todo._id]?.slice(-1)
          )?.map((comment) => (
            <div key={comment._id} className="flex gap-2 group">
              <div className="shrink-0 w-8 h-8 rounded-full bg-linear-to-tr from-gray-200 to-gray-300 flex items-center justify-center text-[10px] font-bold shadow-sm">
                {comment.userId?.username?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 flex flex-col">
                <div className="bg-gray-100 px-3 py-2 rounded-2xl inline-block max-w-[95%]">
                  <div className="flex justify-between items-center gap-4">
                    <span className="text-[12px] font-bold text-gray-900">
                      {comment.userId?.username}
                    </span>
                    <span className="text-[9px] text-gray-400 font-medium">
                      {formatTimestamp(comment.createdAt)}
                    </span>
                  </div>
                  <p className="text-[13px] mt-0.5 text-gray-800 leading-snug whitespace-pre-wrap">
                    {comment.content}
                  </p>
                  {comment.image && (
                    <div className="mt-2 rounded-lg overflow-hidden max-w-50">
                      <Image
                        src={`${API_URL}${comment.image}`}
                        alt="Comment attachment"
                        className="w-full object-cover rounded-md cursor-pointer"
                      />
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-4 ml-2 mt-1">
                  <button
                    onClick={() => handleLikeComment(comment._id, todo._id)}
                    className={`text-[11px] font-bold transition-colors ${
                      comment.likes?.includes(currentUser?._id)
                        ? "text-pink-500"
                        : "text-gray-500 hover:text-blue-600"
                    }`}
                  >
                    Suka
                  </button>
                  {comment.likes?.length > 0 && (
                    <span className="text-[11px] text-gray-400 flex items-center gap-1">
                      ❤️ {comment.likes.length}
                    </span>
                  )}
                  {comment.userId?._id === currentUser?._id && (
                    <button
                      onClick={() => handleDeleteComment(comment._id, todo._id)}
                      className="text-red-400 hover:text-red-600 text-[11px] font-medium transition-colors"
                    >
                      Hapus
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* INPUT BAR KOMENTAR */}
        <CommentInputBox
          todoId={todo._id}
          api={api}
          setComments={setComments}
          fetchAllTodos={refreshFeed}
          currentUser={currentUser}
        />
      </div>
    </div>
  );
};

export default PostCard;
