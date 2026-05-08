import React, { useRef } from "react"; // Tambah useRef
import { Image } from "antd";
import CommentInputBox from "./CommentInputBox"; // Sesuaikan path jika beda
import api, { API_URL } from "../api";

const PostCard = ({
  todo,
  currentUser,
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
  users,
}) => {
  // +++ Buat referensi untuk mengakses fungsi di dalam CommentInputBox
  const commentInputRef = useRef(null);
  // 2. Fungsi Balas yang akan dipanggil tombol
  const handleReply = (username) => {
    console.log("Tombol Balas dipencet buat:", username); // Debugging
    if (commentInputRef.current) {
      commentInputRef.current.addReply(username);
    } else {
      console.error("Ref ke CommentInputBox belum nempel, Bre!");
    }
  };
  // api diprop tapi juga diimport, kita pake prop aja biar konsisten
  const isMyPost = todo.userId?._id === currentUser?._id;

  // Fungsi render mention
  // Fungsi render mention - PERBAIKAN TOTAL
  const renderTextWithMentions = (text, users) => {
    // Kalau text kosong, return array kosong (bukan null!)
    if (!text || text === "") {
      return [];
    }

    // Kalau users tidak valid, return text biasa dalam array
    if (!users || !Array.isArray(users) || users.length === 0) {
      return [{ type: "text", content: text }];
    }

    // Buat array username
    const sortedUsernames = [...users]
      .filter((u) => u && u.username) // filter yang valid
      .map((u) => u.username)
      .sort((a, b) => b.length - a.length);

    // Kalau ga ada username sama sekali
    if (sortedUsernames.length === 0) {
      return [{ type: "text", content: text }];
    }

    const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const mentionPattern = new RegExp(
      `@(${sortedUsernames.map(escapeRegex).join("|")})(?=\\s|$)`,
      "g"
    );

    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = mentionPattern.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push({
          type: "text",
          content: text.slice(lastIndex, match.index),
        });
      }

      parts.push({
        type: "mention",
        content: match[0],
        username: match[1],
      });

      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < text.length) {
      parts.push({
        type: "text",
        content: text.slice(lastIndex),
      });
    }

    // Kalau parts kosong, return text biasa
    if (parts.length === 0) {
      return [{ type: "text", content: text }];
    }

    return parts;
  };

  return (
    <div
      id={todo._id}
      style={{ scrollMarginTop: "100px" }}
      // 🌓 FIX DARK MODE: bg-white -> dark:bg-slate-900, border-gray-100 -> dark:border-slate-800
      className="bg-white dark:bg-slate-900 rounded-xl shadow-md border border-gray-100 dark:border-slate-800 overflow-hidden relative transition-colors duration-300"
    >
      {/* --- HEADER POST --- */}
      <div className="flex items-center justify-between p-4 gap-3">
        <div className="flex items-center gap-3">
          {/* 🌓 FIX DARK MODE: text-white -> dark:text-slate-900 (opsional, biar kontras aja) */}
          <div className="w-10 h-10 rounded-full bg-linear-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white dark:text-slate-900 font-bold shadow-inner overflow-hidden">
            {todo.userId?.avatar ? (
              <img
                src={`${API_URL}${todo.userId.avatar}`}
                alt={todo.userId?.username}
                className="w-full h-full object-cover"
              />
            ) : (
              todo.userId?.username?.charAt(0)?.toUpperCase() || "A"
            )}
          </div>
          <div className="flex flex-col">
            {/* 🌓 FIX DARK MODE: text-gray-900 -> dark:text-white */}
            <strong className="text-sm text-gray-900 dark:text-white hover:underline cursor-pointer">
              {todo.userId?.username || "Anonymous"}
            </strong>
            {/* 🌓 FIX DARK MODE: text-gray-500 -> dark:text-gray-400 */}
            <span className="text-xs text-gray-500 dark:text-gray-400">
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
              // 🌓 FIX DARK MODE: hover:bg-gray-100 -> dark:hover:bg-slate-800
              className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full"
            >
              {/* 🌓 FIX DARK MODE: text-gray-500 -> dark:text-gray-400 */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-gray-500 dark:text-gray-400"
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
                {/* 🌓 FIX DARK MODE: bg-white -> dark:bg-slate-800, border -> dark:border-slate-700 */}
                <div className="absolute right-0 top-full mt-1 w-32 bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-lg shadow-xl z-20 overflow-hidden">
                  <button
                    onClick={() => {
                      startEdit(todo);
                      setOpenMenuId(null);
                    }}
                    // 🌓 FIX DARK MODE: text-gray-700 -> dark:text-gray-200, hover:bg-blue-50 -> dark:hover:bg-blue-950
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-950"
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => {
                      handleDelete(todo._id);
                      setOpenMenuId(null);
                    }}
                    // 🌓 FIX DARK MODE: hover:bg-red-50 -> dark:hover:bg-red-950
                    className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-500 hover:bg-red-50 dark:hover:bg-red-950"
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
      {/* 🌓 FIX DARK MODE: border-gray-50 -> dark:border-slate-800 */}
      <div className="px-4 py-3 border-t border-gray-50 dark:border-slate-800">
        {/* 🌓 FIX DARK MODE: text-gray-800 -> dark:text-gray-100 */}
        <p className="text-base leading-relaxed text-gray-800 dark:text-gray-100 mb-3 whitespace-pre-wrap">
          {renderTextWithMentions(todo.task, users).map((part, index) => {
            if (part.type === "mention") {
              return (
                <span
                  key={index}
                  className="text-blue-600 dark:text-blue-400 font-medium"
                >
                  {part.content}
                </span>
              );
            }
            return <span key={index}>{part.content}</span>;
          })}
        </p>

        {/* LOGIKA BANYAK GAMBAR */}
        {todo.images && todo.images.length > 0 && (
          <div className="mt-3 -mx-4 sm:mx-0">
            <Image.PreviewGroup>
              {todo.images.length === 1 && (
                // 🌓 FIX DARK MODE: bg-gray-50 -> dark:bg-slate-800
                <div className="rounded-lg overflow-hidden flex justify-center items-center bg-gray-50 dark:bg-slate-800 border dark:border-slate-800 sm:rounded-xl">
                  <Image
                    src={`${API_URL}${todo.images[0]}`}
                    className="max-w-full h-auto object-contain max-h-112.5 cursor-pointer"
                    width="100%"
                  />
                </div>
              )}
              {todo.images.length === 2 && (
                <div className="grid grid-cols-2 gap-1 sm:rounded-xl overflow-hidden border dark:border-slate-800">
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
                <div className="grid grid-cols-2 gap-1 sm:rounded-xl overflow-hidden border dark:border-slate-800">
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
                <div className="grid grid-cols-3 gap-1 sm:rounded-xl overflow-hidden border dark:border-slate-800">
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
                  <div className="relative w-full h-full overflow-hidden">
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
          // 🌓 FIX DARK MODE: bg-gray-50 -> dark:bg-slate-800
          <div className="mt-3 rounded-lg overflow-hidden flex justify-center items-center bg-gray-50 dark:bg-slate-800 border dark:border-slate-800 sm:rounded-xl">
            <Image
              src={`${API_URL}${todo.image}`}
              className="max-w-full h-auto object-contain max-h-112.5 cursor-pointer"
              width="100%"
            />
          </div>
        )}
      </div>

      {/* --- TOMBOL ENGAGEMENT --- */}
      {/* 🌓 FIX DARK MODE: border-gray-50 -> dark:border-slate-800, bg-gray-50/30 -> dark:bg-slate-800/30 */}
      <div className="flex items-center gap-6 px-4 py-2 border-t border-b border-gray-50 dark:border-slate-800 bg-gray-50/30 dark:bg-slate-800/30 transition-colors">
        <button
          onClick={() => handleLike(todo._id)}
          // 🌓 FIX DARK MODE: text-gray-500 -> dark:text-gray-400
          className={`flex items-center gap-2 transition-all active:scale-125 ${
            (todo.likes || []).includes(currentUser?._id)
              ? "text-pink-500"
              : "text-gray-500 dark:text-gray-400 hover:text-pink-500 dark:hover:text-pink-400"
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
          // 🌓 FIX DARK MODE: hover:bg-gray-100 -> dark:hover:bg-slate-800, text-gray-500 -> dark:text-gray-400, active bg-blue-50 -> dark:bg-blue-950, text-blue-600 -> dark:text-blue-400
          className={`flex items-center gap-1.5 px-2 py-1 rounded-md transition-colors text-sm font-semibold ${
            activeCommentBox === todo._id
              ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950"
              : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800"
          }`}
        >
          <span className="text-xl">💬</span>
          <span>{comments[todo._id]?.length || 0} Komentar</span>
        </button>

        <button
          onClick={() => handleShare(todo)}
          // 🌓 FIX DARK MODE: text-gray-500 -> dark:text-gray-400
          className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
        >
          <span className="text-xl">🚀</span>
          <span className="text-xs font-bold">Share</span>
        </button>
      </div>

      {/* --- AREA KOMENTAR --- */}
      {/* 🌓 FIX DARK MODE: bg-white -> dark:bg-slate-900, border-gray-50 -> dark:border-slate-800 */}
      <div className="px-4 pb-4 bg-white dark:bg-slate-900 border-t border-gray-50 dark:border-slate-800 transition-colors">
        {comments[todo._id]?.length > 1 && (
          <button
            onClick={() =>
              setActiveCommentBox(
                activeCommentBox === todo._id ? null : todo._id
              )
            }
            // 🌓 FIX DARK MODE: text-blue-600 -> dark:text-blue-400
            className="text-xs text-blue-600 dark:text-blue-400 font-bold hover:underline py-2"
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
              {/* 🌓 FIX DARK MODE: from-gray-200 to-gray-300 -> dark:from-slate-700 dark:to-slate-800, text white (implied default) -> dark:text-white */}
              <div className="shrink-0 w-8 h-8 rounded-full bg-linear-to-tr from-gray-200 to-gray-300 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center text-[10px] text-gray-700 dark:text-white font-bold shadow-sm overflow-hidden">
                {comment.userId?.avatar ? (
                  <img
                    src={`${API_URL}${comment.userId.avatar}`}
                    alt={comment.userId?.username}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  comment.userId?.username?.charAt(0)?.toUpperCase() || "?"
                )}
              </div>
              <div className="flex-1 flex flex-col">
                {/* 🌓 FIX DARK MODE: bg-gray-100 -> dark:bg-slate-800 */}
                <div className="bg-gray-100 dark:bg-slate-800 px-3 py-2 rounded-2xl inline-block max-w-[95%] transition-colors duration-300">
                  <div className="flex justify-between items-center gap-4">
                    {/* 🌓 FIX DARK MODE: text-gray-900 -> dark:text-white */}
                    <span className="text-[12px] font-bold text-gray-900 dark:text-white hover:underline cursor-pointer">
                      {comment.userId?.username}
                    </span>
                    {/* 🌓 FIX DARK MODE: text-gray-400 -> dark:text-gray-500 */}
                    <span className="text-[9px] text-gray-400 dark:text-gray-500 font-medium">
                      {formatTimestamp(comment.createdAt)}
                    </span>
                  </div>
                  {/* 🌓 FIX DARK MODE: text-gray-800 -> dark:text-gray-100 */}
                  <p className="text-[13px] mt-0.5 text-gray-800 dark:text-gray-100 leading-snug whitespace-pre-wrap">
                    {renderTextWithMentions(comment.content, users).map(
                      (part, index) => {
                        if (part.type === "mention") {
                          return (
                            <span
                              key={index}
                              className="text-blue-600 dark:text-blue-400 font-medium"
                            >
                              {part.content}
                            </span>
                          );
                        }
                        return <span key={index}>{part.content}</span>;
                      }
                    )}
                  </p>
                  {comment.image && (
                    <div className="mt-2 rounded-lg overflow-hidden max-w-50 border dark:border-slate-700">
                      <Image
                        src={`${API_URL}${comment.image}`}
                        alt="Comment attachment"
                        className="w-full object-cover cursor-pointer"
                      />
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-4 ml-2 mt-1">
                  <button
                    onClick={() => handleLikeComment(comment._id, todo._id)}
                    // 🌓 FIX DARK MODE: text-gray-500 -> dark:text-gray-400, hover text-blue-600 -> dark:text-blue-400, text-pink-500
                    className={`text-[11px] font-bold transition-colors ${
                      comment.likes?.includes(currentUser?._id)
                        ? "text-pink-500"
                        : "text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                    }`}
                  >
                    Suka
                  </button>
                  {/* TITIK PEMISAH */}
                  <span className="text-[10px] text-gray-300 dark:text-gray-600">
                    •
                  </span>

                  {/* BUTTON BALAS (New) */}
                  <button
                    onClick={() => handleReply(comment.userId.username)}
                    className="text-[11px] font-bold text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    Balas
                  </button>
                  {comment.likes?.length > 0 && (
                    // 🌓 FIX DARK MODE: text-gray-400 -> dark:text-gray-500
                    <span className="text-[11px] text-gray-400 dark:text-gray-500 flex items-center gap-1">
                      ❤️ {comment.likes.length}
                    </span>
                  )}
                  {comment.userId?._id === currentUser?._id && (
                    <button
                      onClick={() => handleDeleteComment(comment._id, todo._id)}
                      // 🌓 FIX DARK MODE: text-red-400 -> dark:text-red-500
                      className="text-red-400 dark:text-red-500 hover:text-red-600 dark:hover:text-red-400 text-[11px] font-medium transition-colors"
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
          ref={commentInputRef}
          innerRef={commentInputRef} // +++ Berikan ref agar PostCard bisa "menyuntikkan" teks
          todoId={todo._id}
          api={api}
          setComments={setComments}
          fetchAllTodos={refreshFeed}
          currentUser={currentUser}
          users={users}
        />
      </div>
    </div>
  );
};

export default PostCard;
