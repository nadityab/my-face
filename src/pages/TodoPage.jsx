import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom"; // Tambahkan ini
import { jwtDecode } from "jwt-decode";
// Jika nama filenya newsupdates.js (u kecil), maka importnya:
import axios from "axios";
import { NEWS_UPDATES } from "../constants/news-updates";
// ✅ Pastikan importnya mengarah ke file api.js yang kita buat tadi
import api, { API_URL } from "../api";
import { Image } from "antd";

import CommentInputBox from "../components/CommentInputBox"; // Sesuaikan path folder kamu
import CreatePostBox from "../components/CreatePostBox";

function TodoPage() {
  const [todos, setTodos] = useState([]);
  const [inputTask, setInputTask] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTodo, setSelectedTodo] = useState(null);
  const [selectedImages, setSelectedImages] = useState([]); //carousell
  const [editImage, setEditImage] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [showNews, setShowNews] = useState(false);
  // 1. State untuk melacak apakah daftar versi dibuka semua atau tidak
  const [showAllVersions, setShowAllVersions] = useState(false);

  // 2. Logika pemotongan otomatis
  const displayedUpdates = showAllVersions
    ? NEWS_UPDATES
    : NEWS_UPDATES.slice(0, 2);

  const [isLoading, setIsLoading] = useState(false);
  const [isCommentLoading, setIsCommentLoading] = useState({});
  const { postId } = useParams();
  const hasScrolledRef = useRef(false);
  // State untuk menyimpan file gambar komentar per-postingan
  const [selectedCommentImages, setSelectedCommentImages] = useState({});

  // ✅ FIX: Tambahkan state currentUser yang tadinya belum ada
  const [currentUser, setCurrentUser] = useState(null);

  // State untuk menyimpan komentar berdasarkan ID postingan { todoId: [comments] }
  const [comments, setComments] = useState({});
  // State untuk melacak postingan mana yang sedang dibuka kolom komentarnya
  const [activeCommentBox, setActiveCommentBox] = useState(null);
  // State untuk teks input komentar per postingan { todoId: "teks" }
  const [commentInputs, setCommentInputs] = useState({});

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
    const initApp = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const res = await api.get("/auth/me");
        // SIMPAN DATA USER (Termasuk _id)
        setCurrentUser(res.data.user);

        fetchAllTodos();
      } catch (err) {
        console.error("Gagal inisialisasi");
      }
    };
    initApp();
  }, [navigate]);

  // 2. FETCH KOMENTAR: Berjalan otomatis setiap kali 'todos' berhasil di-load
  useEffect(() => {
    if (todos.length > 0) {
      todos.forEach((todo) => {
        fetchComments(todo._id);
      });
    }
  }, [todos]);

  // 3. Auto scroll ke share dengan unique id tertentu
  useEffect(() => {
    // ✅ Kita tambah syarat: HANYA jalan jika hasScrolledRef masih FALSE
    if (postId && todos.length > 0 && !hasScrolledRef.current) {
      const target = document.getElementById(postId);
      if (target) {
        setTimeout(() => {
          target.scrollIntoView({ behavior: "smooth", block: "start" });

          // ✅ TANDAI: Bahwa kita sudah scroll satu kali, jadi jangan ulangi lagi
          hasScrolledRef.current = true;

          // ✨ STYLING TETAP (Sesuai permintaan, tidak disunat)
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
  }, [postId, todos]); // Dependency tetap, tapi dikontrol oleh hasScrolledRef

  // Jika postId di URL berubah, kita izinkan scroll lagi untuk ID baru tersebut
  useEffect(() => {
    hasScrolledRef.current = false;
  }, [postId]);

  const formatTimestamp = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();

    // Ambil waktu tengah malam hari ini & kemarin untuk perbandingan yang akurat
    const today = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    ).getTime();
    const yesterday = today - 24 * 60 * 60 * 1000;

    // Waktu dari data (di-reset ke jam 00:00 untuk perbandingan tanggal)
    const compareDate = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    ).getTime();

    // Format jam (contoh: 14:05)
    const timeStr = date.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });

    if (compareDate === today) {
      return `Today, ${timeStr}`;
    } else if (compareDate === yesterday) {
      return `Yesterday, ${timeStr}`;
    } else {
      // Jika lebih lama, tampilkan tanggal lengkap (contoh: 07 Apr 2026, 14:05)
      return `${date.toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })}, ${timeStr}`;
    }
  };

  const fetchPrivateTodos = async () => {
    try {
      const res = await api.get("/todos");
      setTodos(res.data);
    } catch (err) {
      console.error("Gagal ambil data", err);
    }
  };

  const fetchAllTodos = async () => {
    try {
      const res = await api.get("/todos/public");
      setTodos(res.data);
    } catch (err) {
      console.error("Gagal ambil data public", err);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();

    if (!inputTask.trim() && selectedImages.length === 0) return;

    setIsLoading(true);
    const formData = new FormData();
    formData.append("task", inputTask);

    if (selectedImages.length > 0) {
      selectedImages.forEach((image) => {
        formData.append("images", image);
      });
    }

    try {
      // 🔥 CLEAN ARCHITECTURE:
      // 1. Tidak perlu `${API_URL}` karena sudah ada di baseURL api.js
      // 2. Tidak perlu header Token, karena sudah diurus Interceptor Request
      // 3. Tidak perlu Content-Type, karena Axios otomatis mendeteksi FormData
      await api.post("/todos", formData);

      setInputTask("");
      setSelectedImages([]);
      fetchAllTodos();

      // ✅ TAMBAHKAN BARIS INI UNTUK MENGKEMPESKAN KOTAK TEKS
      const postInput = document.getElementById("main-post-input");
      if (postInput) postInput.style.height = "auto";
    } catch (error) {
      console.error("Error menambah todo:", error);
      // Error 401 (Expired) sudah otomatis melempar user ke /login berkat Interceptor Response!
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ CLEAN ARCHITECTURE: Fungsi khusus menangani logika pemilihan gambar
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = [];
    const MAX_SIZE = 10 * 1024 * 1024; // Limit 10MB per file

    // 1. Validasi Ukuran File
    files.forEach((file) => {
      if (file.size > MAX_SIZE) {
        alert(
          `Waduh, ukuran gambar "${file.name}" terlalu besar! Maksimal 10MB ya.`
        );
      } else {
        validFiles.push(file);
      }
    });

    // 2. Gabungkan foto lama dengan foto baru yang lolos sensor, batasi maksimal 10 foto
    if (validFiles.length > 0) {
      setSelectedImages((prev) => [...prev, ...validFiles].slice(0, 10));
    }

    // 3. Reset input form agar user bisa memilih file yang sama jika sebelumnya di-cancel
    e.target.value = "";
  };

  // ✅ CLEAN ARCHITECTURE: Fungsi khusus menangani gambar komentar (Single File)
  const handleCommentImageChange = (e, todoId) => {
    const file = e.target.files[0];

    if (!file) return;

    const MAX_SIZE = 10 * 1024 * 1024; // Limit 10MB

    // Validasi Ukuran File
    if (file.size > MAX_SIZE) {
      alert(
        `Waduh, ukuran gambar "${file.name}" terlalu besar! Maksimal 10MB ya.`
      );
      e.target.value = "";
      return;
    }

    // Simpan ke state khusus komentar (menggunakan todoId sebagai kunci)
    setSelectedCommentImages((prev) => ({
      ...prev,
      [todoId]: file,
    }));

    // Reset input form
    e.target.value = "";
  };

  const handleToggle = async (todo) => {
    try {
      await api.put(`/todos/${todo._id}`, {
        completed: !todo.completed,
      });
      fetchAllTodos();
    } catch (err) {
      console.error("Gagal toggle status", err);
    }
  };

  const startEdit = (todo) => {
    setSelectedTodo(todo);
    setEditText(todo.task);
    setIsModalOpen(true);
  };

  const handleUpdateText = async (id) => {
    setIsLoading(true); // 1. Mulai Loading
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
      setIsLoading(false); // 2. Matikan Loading (berhasil atau gagal tetap mati)
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

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  const fetchComments = async (todoId) => {
    try {
      const res = await api.get(`/comments/${todoId}`);
      setComments((prev) => ({ ...prev, [todoId]: res.data }));
    } catch (err) {
      console.error("Gagal ambil komentar", err);
    }
  };

  const handleAddComment = async (todoId) => {
    // 0. GUARD: Cegah klik ganda (Anti-Double Upload)
    if (isCommentLoading[todoId]) return;

    const text = commentInputs[todoId];
    const imageFile = selectedCommentImages[todoId];

    if (!text?.trim() && !imageFile) return;

    // 1. SET LOADING TRUE (Hanya untuk ID ini)
    setIsCommentLoading((prev) => ({ ...prev, [todoId]: true }));

    const formData = new FormData();
    formData.append("content", text || "");
    if (imageFile) {
      formData.append("image", imageFile);
    }

    try {
      // 🔥 CLEAN ARCHITECTURE: Header otomatis diurus oleh Axios
      const res = await api.post(`/comments/${todoId}`, formData);

      // Update state komentar tanpa harus fetchAllTodos (Sangat optimal!)
      setComments((prev) => ({
        ...prev,
        [todoId]: [...(prev[todoId] || []), res.data],
      }));

      // Kosongkan input state
      setCommentInputs((prev) => ({ ...prev, [todoId]: "" }));
      setSelectedCommentImages((prev) => ({ ...prev, [todoId]: null }));

      // ✅ KEMPESKAN KOTAK TEKS (Penting agar UI tidak bug)
      const commentInput = document.getElementById(`input-comment-${todoId}`);
      if (commentInput) {
        commentInput.style.height = "auto";
      }
    } catch (err) {
      console.error("Error detail:", err);
      alert("Gagal mengirim komentar");
    } finally {
      // 2. SET LOADING FALSE
      setIsCommentLoading((prev) => ({ ...prev, [todoId]: false }));
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

    const userId = currentUser.id || currentUser._id; // Sesuaikan dengan struktur user kamu

    // 1. Simpan kondisi 'todos' saat ini buat jaga-jaga kalau server error (Rollback)
    const previousTodos = [...todos];

    // 2. LANGSUNG UPDATE UI (Optimistic)
    setTodos((prevTodos) =>
      prevTodos.map((t) => {
        if (t._id === id) {
          const alreadyLiked = t.likes?.includes(userId);
          const newLikes = alreadyLiked
            ? t.likes.filter((uid) => uid !== userId) // Hapus jika sudah ada (Unlike)
            : [...(t.likes || []), userId]; // Tambah jika belum ada (Like)

          return { ...t, likes: newLikes };
        }
        return t;
      })
    );

    try {
      // 3. Baru tembak API di belakang layar
      const res = await api.patch(`/todos/${id}/like`);

      // 4. Opsional: Sinkronkan ulang dengan data asli server agar lebih akurat
      setTodos((prevTodos) =>
        prevTodos.map((t) =>
          t._id === id ? { ...t, likes: res.data.likes } : t
        )
      );
    } catch (err) {
      console.error("Gagal Like, mengembalikan state...", err);

      // 5. ROLLBACK: Jika server error (misal 500), kembalikan warna ke sebelumnya
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
      // 1. Panggil API Backend untuk menaikkan sharesCount & Fix data lama
      const res = await api.patch(`/todos/${todo._id}/share`);

      // 2. Update UI secara lokal agar angka share langsung berubah
      setTodos((prevTodos) =>
        prevTodos.map((t) =>
          t._id === todo._id ? { ...t, sharesCount: res.data.sharesCount } : t
        )
      );

      // 3. Jalankan fitur Share bawaan HP/Browser
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

    // 1. Update secara instan (Optimistic)
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
      // 2. Tembak API (Kita buat nanti di Step 3)
      await api.patch(`/comments/${commentId}/like`);
    } catch (err) {
      console.error("Gagal Like Komentar:", err);
      // Jika error, kamu bisa fetch ulang komentar untuk sync data asli
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-10 font-sans">
      <div className="max-w-xl mx-auto px-4">
        {/* --- FLOATING BUTTON WHAT'S NEW --- */}
        {/* <button
          onClick={() => setIsDrawerOpen(true)}
          className="fixed bottom-6 left-6 z-40 flex items-center gap-2 bg-white/90 backdrop-blur-sm border border-blue-100 text-blue-600 px-5 py-3 rounded-full shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all group"
        >
          <span className="text-lg group-hover:rotate-12 transition-transform">
            ✨
          </span>
          <span className="font-bold text-sm tracking-wide">What's New</span>
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
          </span>
        </button>

        {/* --- OVERLAY --- */}
        {isDrawerOpen && (
          <div
            className="fixed inset-0 bg-black/30 z-50 transition-opacity duration-300 animate-in fade-in"
            onClick={() => {
              setIsDrawerOpen(false);
              setShowNews(false);
            }}
          ></div>
        )}

        {/* --- DRAWER PANEL --- */}
        <div
          className={`fixed top-0 left-0 w-80 bg-white shadow-2xl z-60 transform transition-transform duration-300 ease-in-out flex flex-col h-dvh ${
            isDrawerOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="p-5 flex flex-col h-full">
            <div className="flex justify-between items-center border-b pb-4 mb-4">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                {showNews ? "🚀 What's New" : "Menu Utama"}
              </h2>
              <button
                onClick={() => {
                  setIsDrawerOpen(false);
                  setShowNews(false);
                }}
                className="text-gray-500 hover:text-red-500 text-2xl"
              >
                &times;
              </button>
            </div>

            {!showNews ? (
              <div className="flex-1 px-4">
                <button
                  onClick={() => setShowNews(true)}
                  className="w-full flex items-center justify-between p-4 hover:bg-blue-50 rounded-xl transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl group-hover:scale-110 transition-transform duration-200">
                      ✨
                    </span>
                    <span className="font-semibold text-gray-700">
                      What's New
                    </span>
                  </div>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-gray-400 group-hover:translate-x-1 transition-transform"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </div>
            ) : (
              <div className="flex-1 flex flex-col min-h-0 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="px-6 py-2">
                  <button
                    onClick={() => setShowNews(false)}
                    className="text-blue-600 text-sm font-bold flex items-center gap-1 hover:text-blue-800 transition-colors py-2"
                  >
                    ← Kembali ke Menu
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto pr-2 pl-6 space-y-6 touch-pan-y overscroll-contain custom-scrollbar">
                  {/* ✅ KODINGAN MAPPING YANG SUDAH BERSIH DAN DINAMIS */}
                  {displayedUpdates.map((update) => {
                    // Mapping warna agar rapi dan best practice
                    const colorMap = {
                      blue: "bg-blue-50 text-blue-600",
                      indigo: "bg-indigo-50 text-indigo-600",
                      purple: "bg-purple-50 text-purple-600",
                      green: "bg-green-50 text-green-600",
                    };
                    const badgeColor =
                      colorMap[update.color] || "bg-gray-100 text-gray-500";

                    return (
                      <section
                        key={update.version}
                        className="relative pl-8 border-l-2 border-gray-100 last:border-l-transparent pb-4"
                      >
                        <span
                          className={`absolute -left-2.25 top-1 h-4 w-4 rounded-full border-4 border-white shadow-sm ${
                            update.version === NEWS_UPDATES[0].version
                              ? "bg-blue-500"
                              : "bg-gray-300"
                          }`}
                        ></span>
                        <div className="mb-1">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${badgeColor}`}
                          >
                            {update.version} • {update.date}
                          </span>
                        </div>
                        <h3 className="font-bold text-gray-800 text-sm">
                          {update.title}
                        </h3>
                        <ul className="text-xs text-gray-500 list-disc ml-4 mt-2 space-y-2">
                          {update.points.map((point, pIdx) => (
                            <li key={pIdx} className="leading-relaxed">
                              {point}
                            </li>
                          ))}
                        </ul>
                      </section>
                    );
                  })}

                  {/* ✅ TOMBOL SHOW MORE / SHOW LESS */}
                  {NEWS_UPDATES.length > 3 && (
                    <div className="pt-2 pb-4 flex justify-center">
                      <button
                        onClick={() => setShowAllVersions(!showAllVersions)}
                        className="text-xs font-semibold text-gray-500 hover:text-blue-600 transition-colors flex items-center gap-1 px-4 py-2 bg-gray-50 rounded-full hover:bg-blue-50"
                      >
                        {showAllVersions
                          ? "Sembunyikan Versi Lama 🔼"
                          : "Lihat Versi Sebelumnya 🔽"}
                      </button>
                    </div>
                  )}

                  <div className="h-24" />
                </div>
              </div>
            )}
            <div className="mt-auto pt-4 border-t text-center text-xs text-gray-400">
              Build with ❤️ and Fun!
            </div>
          </div>
        </div>

        {/* --- HEADER UTAMA --- */}
        <div className="sticky top-0 z-30 flex justify-between items-center mb-8 bg-white/80 backdrop-blur-md p-3 md:p-6 rounded-xl shadow-sm border-b border-gray-100 mx-2 sm:mx-0 overflow-hidden">
          <div className="flex items-center gap-1.5 sm:gap-4 min-w-0 flex-1">
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="shrink-0 p-2 hover:bg-gray-100 rounded-lg transition-colors group"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 sm:h-6 sm:w-6 text-gray-600 group-hover:text-blue-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
            <h2 className="text-sm xs:text-base md:text-2xl font-bold text-gray-800 tracking-tight truncate min-w-0 select-none">
              MyFace <span className="text-blue-600">is Fun</span>
            </h2>
          </div>
          <div className="shrink-0 ml-2">
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-3 md:px-4 py-2 rounded-lg text-[10px] xs:text-xs md:text-sm font-semibold transition-all active:scale-95 shadow-sm whitespace-nowrap"
            >
              Logout
            </button>
          </div>
        </div>

        {/* --- FORM TAMBAH POST (CAROUSEL EDITION) --- */}
        <CreatePostBox api={api} fetchAllTodos={fetchAllTodos} />

        {/* --- LIST POSTINGAN (FEED) --- */}
        <div className="flex flex-col gap-6">
          {todos.map((todo) => {
            // ✅ FIX: Gunakan currentUser dari state yang sudah tervalidasi
            const isMyPost = todo.userId?._id === currentUser?._id;

            return (
              <div
                key={todo._id}
                id={todo._id} // ✅ Wajib ada untuk target scroll
                style={{ scrollMarginTop: "100px" }} // ✅ Agar tidak tertutup header sticky kamu
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
                        {/* ✅ Menggunakan formatTimestamp yang baru dibuat */}
                        {formatTimestamp(todo.createdAt)} • 🌍 Public
                      </span>
                    </div>
                  </div>
                  {isMyPost && (
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenMenuId(
                            openMenuId === todo._id ? null : todo._id
                          );
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

                  {/* ✅ LOGIKA 1: UNTUK POSTINGAN BARU (BANYAK GAMBAR - ALA FACEBOOK) */}
                  {todo.images && todo.images.length > 0 && (
                    <div className="mt-3 -mx-4 sm:mx-0">
                      <Image.PreviewGroup>
                        {/* JIKA 1 GAMBAR: Tampil Penuh */}
                        {todo.images.length === 1 && (
                          <div className="rounded-lg overflow-hidden flex justify-center items-center bg-gray-50">
                            <Image
                              src={`${API_URL}${todo.images[0]}`}
                              alt="post"
                              className="max-w-full h-auto object-contain max-h-112.5 cursor-pointer sm:rounded-xl"
                              width="100%"
                            />
                          </div>
                        )}

                        {/* JIKA 2 GAMBAR: Dibagi 2 Kolom Sejajar */}
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

                        {/* JIKA 3 GAMBAR: 1 Besar di Atas, 2 Kecil di Bawah */}
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

                        {/* JIKA 4 GAMBAR ATAU LEBIH: 1 Besar di Atas, 3 Kecil di Bawah + Angka Sisa */}
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

                            {/* Kotak Terakhir (Gambar Ke-4) dengan Overlay Angka */}
                            <div className="relative w-full h-full">
                              <Image
                                src={`${API_URL}${todo.images[3]}`}
                                className="aspect-square object-cover w-full cursor-pointer block"
                                width="100%"
                              />

                              {/* Overlay Hitam Transparan "+X" (Hanya muncul jika lebih dari 4) */}
                              {todo.images.length > 4 && (
                                <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-2xl font-bold pointer-events-none shadow-inner">
                                  +{todo.images.length - 4}
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Trik Rahasia Ant Design: Me-render sisa gambar secara kasat mata (hidden) 
            agar saat di-zoom, user tetap bisa geser ke gambar ke-5, ke-6, dst. */}
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

                  {/* ✅ LOGIKA 2: FALLBACK UNTUK POSTINGAN LAMA (Tetap Aman!) */}
                  {todo.image && (!todo.images || todo.images.length === 0) && (
                    <div className="mt-3 rounded-lg overflow-hidden flex justify-center items-center bg-gray-50">
                      <Image
                        src={`${API_URL}${todo.image}`}
                        alt="post"
                        className="max-w-full h-auto object-contain max-h-112.5 cursor-pointer sm:rounded-xl"
                        width="100%"
                      />
                    </div>
                  )}
                </div>

                {/* ✅ FIX: Tombol Engagement (LIKE & SHARE) HARUS DI DALAM MAP */}
                <div className="flex items-center gap-6 px-4 py-2 border-t border-b border-gray-50 bg-gray-50/30">
                  {/* Tombol LIKE */}
                  <button
                    onClick={() => handleLike(todo._id)}
                    className={`flex items-center gap-2 transition-all active:scale-125 ${
                      (todo.likes || []).includes(currentUser?._id)
                        ? "text-pink-500"
                        : "text-gray-500 hover:text-pink-500"
                    }`}
                  >
                    <span className="text-xl">
                      {(todo.likes || []).includes(currentUser?._id)
                        ? "❤️"
                        : "🤍"}
                    </span>
                    <span className="text-xs font-bold">
                      {todo.likes?.length || 0} Likes
                    </span>
                  </button>

                  <button
                    onClick={() =>
                      setActiveCommentBox(
                        activeCommentBox === todo._id ? null : todo._id
                      )
                    }
                    className={`flex items-center gap-1.5 px-2 py-1 rounded-md transition-colors text-sm font-semibold ${
                      activeCommentBox === todo._id
                        ? "text-blue-600 bg-blue-50"
                        : "text-gray-500 hover:bg-gray-100"
                    }`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      />
                    </svg>

                    {/* ✅ ANGKA OTOMATIS UPDATE */}
                    <span>{comments[todo._id]?.length || 0} Komentar</span>
                  </button>

                  {/* Tombol SHARE */}
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
                  {/* --- TOMBOL LIHAT KOMENTAR LAINNYA --- */}
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
                        : `Lihat ${
                            comments[todo._id].length - 1
                          } komentar lainnya`}
                    </button>
                  )}

                  <div className="mt-2 space-y-4">
                    {(activeCommentBox === todo._id
                      ? comments[todo._id]
                      : comments[todo._id]?.slice(-1)
                    )?.map((comment) => (
                      <div key={comment._id} className="flex gap-2 group">
                        {/* Profil Mini */}
                        <div className="shrink-0 w-8 h-8 rounded-full bg-linear-to-tr from-gray-200 to-gray-300 flex items-center justify-center text-[10px] font-bold shadow-sm">
                          {comment.userId?.username?.charAt(0).toUpperCase()}
                        </div>

                        <div className="flex-1 flex flex-col">
                          {/* Bubble Komentar */}
                          <div className="bg-gray-100 px-3 py-2 rounded-2xl inline-block max-w-[95%]">
                            <div className="flex justify-between items-center gap-4">
                              <span className="text-[12px] font-bold text-gray-900">
                                {comment.userId?.username}
                              </span>
                              {/* ✅ 1. TIMESTAMP KOMENTAR */}
                              <span className="text-[9px] text-gray-400 font-medium">
                                {formatTimestamp(comment.createdAt)}
                              </span>
                            </div>

                            <p className="text-[13px] mt-0.5 text-gray-800 leading-snug whitespace-pre-wrap">
                              {comment.content}
                            </p>

                            {/* ✅ 2. GAMBAR KOMENTAR (Jika ada) */}
                            {comment.image && (
                              /* ✅ HAPUS class 'border' dan 'border-gray-100' di div pembungkus */
                              <div className="mt-2 rounded-lg overflow-hidden max-w-50">
                                <Image
                                  src={`${API_URL}${comment.image}`}
                                  alt="Comment attachment"
                                  className="w-full object-cover rounded-md cursor-pointer"
                                />
                              </div>
                            )}
                          </div>

                          {/* ✅ 3. TOMBOL AKSI (LIKE & DELETE) */}
                          <div className="flex items-center gap-4 ml-2 mt-1">
                            <button
                              onClick={() =>
                                handleLikeComment(comment._id, todo._id)
                              }
                              className={`text-[11px] font-bold transition-colors ${
                                comment.likes?.includes(currentUser?._id)
                                  ? "text-pink-500"
                                  : "text-gray-500 hover:text-blue-600"
                              }`}
                            >
                              {comment.likes?.includes(currentUser?._id)
                                ? "Suka"
                                : "Suka"}
                            </button>

                            {comment.likes?.length > 0 && (
                              <span className="text-[11px] text-gray-400 flex items-center gap-1">
                                ❤️ {comment.likes.length}
                              </span>
                            )}

                            {comment.userId?._id === currentUser?._id && (
                              <button
                                onClick={() =>
                                  handleDeleteComment(comment._id, todo._id)
                                }
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

                  {/* --- INPUT BAR KOMENTAR (Sudah Clean Architecture & Full UI) --- */}
                  <CommentInputBox
                    todoId={todo._id}
                    api={api}
                    setComments={setComments}
                    fetchAllTodos={fetchAllTodos}
                    currentUser={currentUser} // ✅ Tambahkan ini agar Avatar tidak error/kosong
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* --- MODAL POPUP EDIT --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-800">
                Edit Postingan
              </h3>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setEditImage(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <div className="p-6 flex flex-col gap-4">
              <textarea
                className="w-full bg-gray-50 border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 h-28"
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
              />
              <label className="flex-1 flex flex-col items-center justify-center px-4 py-4 bg-gray-50 text-blue-600 rounded-xl border-2 border-dashed cursor-pointer">
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
            <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3">
              <button
                onClick={() => handleUpdateText(selectedTodo._id)}
                disabled={isLoading} // 3. Cegah klik ganda
                className={`px-6 py-2 text-sm font-bold text-white rounded-lg transition-all shadow-md ${
                  isLoading
                    ? "bg-blue-400 cursor-not-allowed opacity-70"
                    : "bg-blue-600 hover:bg-blue-700 active:scale-95"
                }`}
              >
                {/* 4. Ubah teks saat loading */}
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
    </div>
  );
}

export default TodoPage;
