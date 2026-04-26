import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import api from "../api"; // ✅ API Path sudah benar
import CreatePostBox from "../components/CreatePostBox";
import ChatWidget from "../components/chat/ChatWidget";
import ChatWindow from "../components/chat/ChatWindow";
import useFeed from "../hooks/useFeed";
import PostCard from "../components/PostCard";

function TodoPage() {
  const {
    todos,
    setTodos,
    isFetchingMore,
    hasMore,
    observerTarget,
    refreshFeed,
  } = useFeed(api);

  const [inputTask, setInputTask] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTodo, setSelectedTodo] = useState(null);
  const [selectedImages, setSelectedImages] = useState([]);
  const [editImage, setEditImage] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);

  // ❌ [DIHAPUS]: Semua state yang berhubungan dengan Drawer dan News (pindah ke Layout)

  const [isLoading, setIsLoading] = useState(false);
  const [isCommentLoading, setIsCommentLoading] = useState({});
  const { postId } = useParams();
  const hasScrolledRef = useRef(false);

  const [selectedCommentImages, setSelectedCommentImages] = useState({});
  const [currentUser, setCurrentUser] = useState(null);
  const [comments, setComments] = useState({});
  const [activeCommentBox, setActiveCommentBox] = useState(null);
  const [commentInputs, setCommentInputs] = useState({});
  const [selectedUser, setSelectedUser] = useState(null);

  const navigate = useNavigate();

  // 1. Ambil token dari localStorage untuk decode awal
  const token = localStorage.getItem("token");
  let currentUserId = null;
  let decoded = {};

  if (token) {
    try {
      decoded = jwtDecode(token);
      currentUserId = decoded.id;
    } catch (e) {
      console.error("Token invalid");
    }
  }

  // 1. PINTU UTAMA: Validasi Sesi & Auto Renewal
  useEffect(() => {
    let isMounted = true;
    let intervalId = null;

    const checkSession = async (isInitialCall = false) => {
      const token = localStorage.getItem("token");
      const storedUserId = localStorage.getItem("userId");
      const currentPath = window.location.pathname;

      if (currentPath === "/login") {
        if (isInitialCall) setIsLoading(false);
        return;
      }

      const logoutUser = (message) => {
        if (isMounted) {
          alert(message);
          localStorage.clear();
          window.location.href = "/login";
        }
      };

      if (!token || !storedUserId) {
        if (currentPath !== "/login") {
          logoutUser(
            "Sesi tidak ditemukan atau tidak valid, mohon login kembali."
          );
        }
        return;
      }

      try {
        const res = await api.get("/auth/me");

        if (isMounted) {
          if (res.data.user) {
            setCurrentUser(res.data.user);
            localStorage.setItem("userId", res.data.user._id);

            if (isInitialCall) {
              await fetchAllTodos();
            }
          } else {
            throw new Error("User data empty");
          }
        }
      } catch (err) {
        console.error("Sesi tidak valid:", err);
        logoutUser(
          "Sesi tidak valid atau telah berakhir, mohon menghubungkan ulang."
        );
      } finally {
        if (isMounted && isInitialCall) {
          setIsLoading(false);
        }
      }
    };

    checkSession(true);

    intervalId = setInterval(() => {
      checkSession(false);
    }, 5000);

    return () => {
      isMounted = false;
      if (intervalId) clearInterval(intervalId);
    };
  }, [navigate]);

  // 2. FETCH KOMENTAR
  useEffect(() => {
    if (todos.length > 0) {
      todos.forEach((todo) => {
        fetchComments(todo._id);
      });
    }
  }, [todos]);

  // 3. Auto scroll ke share
  useEffect(() => {
    if (postId && todos.length > 0 && !hasScrolledRef.current) {
      const target = document.getElementById(postId);
      if (target) {
        setTimeout(() => {
          target.scrollIntoView({ behavior: "smooth", block: "start" });
          hasScrolledRef.current = true;
          target.classList.add("ring-4", "ring-blue-500/50", "ring-offset-2");
          setTimeout(() => {
            target.classList.remove(
              "ring-4",
              "ring-blue-500/50",
              "ring-offset-2"
            );
          }, 3000);
        }, 800);
      }
    }
  }, [postId, todos]);

  useEffect(() => {
    hasScrolledRef.current = false;
  }, [postId]);

  const formatTimestamp = (dateString) => {
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

    if (compareDate === today) return `Today, ${timeStr}`;
    if (compareDate === yesterday) return `Yesterday, ${timeStr}`;
    return `${date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })}, ${timeStr}`;
  };

  const fetchAllTodos = async () => {
    try {
      const res = await api.get("/todos/public");
      setTodos(res.data);
    } catch (err) {
      console.error("Gagal ambil data public", err);
    }
  };

  const startEdit = (todo) => {
    setSelectedTodo(todo);
    setEditText(todo.task);
    setIsModalOpen(true);
  };

  const handleUpdateText = async (id) => {
    setIsLoading(true);
    const formData = new FormData();
    formData.append("task", editText);
    if (editImage) formData.append("image", editImage);

    try {
      const res = await api.put(`/todos/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setTodos(todos.map((t) => (t._id === id ? res.data : t)));
      setIsModalOpen(false);
      setEditImage(null);
    } catch (err) {
      console.error("Gagal update postingan", err);
      alert("Gagal menyimpan perubahan.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Hapus postingan ini?")) return;
    try {
      await api.delete(`/todos/${id}`);
      fetchAllTodos();
    } catch (err) {
      console.error("Gagal hapus task", err);
    }
  };

  const fetchComments = async (todoId) => {
    try {
      const res = await api.get(`/comments/${todoId}`);
      setComments((prev) => ({ ...prev, [todoId]: res.data }));
    } catch (err) {
      console.error("Gagal ambil komentar", err);
    }
  };

  const handleDeleteComment = async (commentId, todoId) => {
    if (!window.confirm("Hapus komentar ini?")) return;
    try {
      await api.delete(`/comments/${commentId}`);
      setComments((prev) => ({
        ...prev,
        [todoId]: prev[todoId].filter((c) => c._id !== commentId),
      }));
    } catch (err) {
      alert("Gagal hapus komentar");
    }
  };

  const handleLike = async (id) => {
    if (!currentUser) return;
    const userId = currentUser.id || currentUser._id;
    const previousTodos = [...todos];

    setTodos((prevTodos) =>
      prevTodos.map((t) => {
        if (t._id === id) {
          const alreadyLiked = t.likes?.includes(userId);
          const newLikes = alreadyLiked
            ? t.likes.filter((uid) => uid !== userId)
            : [...(t.likes || []), userId];
          return { ...t, likes: newLikes };
        }
        return t;
      })
    );

    try {
      const res = await api.patch(`/todos/${id}/like`);
      setTodos((prevTodos) =>
        prevTodos.map((t) =>
          t._id === id ? { ...t, likes: res.data.likes } : t
        )
      );
    } catch (err) {
      setTodos(previousTodos);
      alert("Gagal memproses Like, silakan coba lagi.");
    }
  };

  const handleShare = async (todo) => {
    const shareUrl = `${window.location.origin}/post/${todo._id}`;
    const shareData = {
      title: "MyFace is Fun",
      text: `Lihat postingan dari ${todo.userId?.username || "User"}: "${
        todo.task
      }"`,
      url: shareUrl,
    };

    try {
      const res = await api.patch(`/todos/${todo._id}/share`);
      setTodos((prevTodos) =>
        prevTodos.map((t) =>
          t._id === todo._id ? { ...t, sharesCount: res.data.sharesCount } : t
        )
      );

      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareUrl);
        alert("Link disalin! (Browser tidak support native share)");
      }
    } catch (err) {
      console.log("Proses share dibatalkan atau error:", err);
    }
  };

  const handleLikeComment = async (commentId, todoId) => {
    if (!currentUser) return;
    const userId = currentUser._id;

    setComments((prev) => ({
      ...prev,
      [todoId]: prev[todoId].map((c) => {
        if (c._id === commentId) {
          const alreadyLiked = c.likes?.includes(userId);
          const newLikes = alreadyLiked
            ? c.likes.filter((id) => id !== userId)
            : [...(c.likes || []), userId];
          return { ...c, likes: newLikes };
        }
        return c;
      }),
    }));

    try {
      await api.patch(`/comments/${commentId}/like`);
    } catch (err) {
      console.error("Gagal Like Komentar:", err);
    }
  };

  return (
    <>
      {/* 🚀 CATATAN PERUBAHAN UI:
        - Background 'bg-gray-100 py-10' DIHAPUS karena sekarang halaman ini 
          dibungkus oleh MainLayout yang sudah punya background dan padding.
        - Drawer dan Header (Logo & Tombol Logout) DIHAPUS karena sekarang 
          itu adalah tugas dari MainLayout dan Sidebar.
      */}
      <div className="font-sans w-full max-w-xl mx-auto px-4 sm:px-0 pt-4 md:pt-0">
        {/* --- FORM TAMBAH POST (CAROUSEL EDITION) --- */}
        <CreatePostBox api={api} refreshFeed={refreshFeed} />

        {/* --- LIST POSTINGAN (FEED) --- */}
        <div className="flex flex-col gap-6 mt-6">
          {todos.map((todo) => (
            <PostCard
              key={todo._id}
              todo={todo}
              currentUser={currentUser}
              api={api}
              comments={comments}
              setComments={setComments}
              activeCommentBox={activeCommentBox}
              setActiveCommentBox={setActiveCommentBox}
              openMenuId={openMenuId}
              setOpenMenuId={setOpenMenuId}
              formatTimestamp={formatTimestamp}
              handleLike={handleLike}
              handleShare={handleShare}
              startEdit={startEdit}
              handleDelete={handleDelete}
              handleLikeComment={handleLikeComment}
              handleDeleteComment={handleDeleteComment}
              refreshFeed={refreshFeed}
            />
          ))}
        </div>

        {/* --- CHAT WIDGET --- */}
        <ChatWidget onSelectUser={(user) => setSelectedUser(user)} />

        {selectedUser && (
          <ChatWindow
            selectedUser={selectedUser}
            onClose={() => setSelectedUser(null)}
          />
        )}

        {/* --- PAGINASI --- */}
        {todos.length > 0 && (
          <div
            ref={observerTarget}
            className="w-full flex justify-center items-center py-6 pb-24"
          >
            {isFetchingMore ? (
              <div className="flex flex-col items-center gap-2">
                <div className="h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-xs text-gray-500 font-medium">
                  Memuat postingan lama...
                </span>
              </div>
            ) : !hasMore ? (
              <div className="text-center py-4 bg-gray-50 dark:bg-slate-800 w-full rounded-xl transition-colors">
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                  ✨ Yay! Kamu sudah melihat semua postingan.
                </p>
              </div>
            ) : null}
          </div>
        )}
      </div>

      {/* --- MODAL POPUP EDIT --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b dark:border-slate-800 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                Edit Postingan
              </h3>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setEditImage(null);
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                ✕
              </button>
            </div>
            <div className="p-6 flex flex-col gap-4">
              <textarea
                className="w-full bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white border dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 h-28 transition-colors"
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
              />
              <label className="flex-1 flex flex-col items-center justify-center px-4 py-4 bg-gray-50 dark:bg-slate-800 text-blue-600 dark:text-blue-400 rounded-xl border-2 border-dashed dark:border-slate-700 cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">
                <span className="text-xs font-semibold">
                  {editImage ? editImage.name : "Klik untuk ganti foto"}
                </span>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => setEditImage(e.target.files[0])}
                />
              </label>
            </div>
            <div className="px-6 py-4 bg-gray-50 dark:bg-slate-900 border-t dark:border-slate-800 flex justify-end gap-3 transition-colors">
              <button
                onClick={() => handleUpdateText(selectedTodo._id)}
                disabled={isLoading}
                className={`px-6 py-2 text-sm font-bold text-white rounded-lg transition-all shadow-md ${
                  isLoading
                    ? "bg-blue-400 cursor-not-allowed opacity-70"
                    : "bg-blue-600 hover:bg-blue-700 active:scale-95"
                }`}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    Menyimpan...
                  </div>
                ) : (
                  "Simpan Perubahan"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default TodoPage;
