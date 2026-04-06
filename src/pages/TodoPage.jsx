import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Tambahkan ini
import { jwtDecode } from "jwt-decode";
// Jika nama filenya newsupdates.js (u kecil), maka importnya:
import { NEWS_UPDATES } from "../constants/news-updates";
// ✅ Pastikan importnya mengarah ke file api.js yang kita buat tadi
import api, { API_URL } from "../api";

function TodoPage() {
  const [todos, setTodos] = useState([]);
  const [inputTask, setInputTask] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTodo, setSelectedTodo] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [editImage, setEditImage] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [showNews, setShowNews] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  // 1. Ambil token dari localStorage
  const token = localStorage.getItem("token");
  const decoded = jwtDecode(token);
  const currentUserId = decoded.id; // Sesuaikan dengan key ID di tokenmu

  // 2. Buat fungsi helper untuk Header agar kode lebih bersih
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    } else {
      fetchAllTodos(); // atau fetchPrivateTodos() tergantung kebutuhanmu
    }
  }, []);

  const fetchPrivateTodos = async () => {
    try {
      // ✅ Ganti axios dengan api, dan hapus authHeader
      const res = await api.get("/todos");
      setTodos(res.data);
    } catch (err) {
      console.error("Gagal ambil data", err);
      // Gak perlu lagi if (401) navigate login di sini, karena api.js sudah otomatis urus refresh token!
    }
  };

  const fetchAllTodos = async () => {
    try {
      // ✅ Ganti axios dengan api
      const res = await api.get("/todos/public");
      setTodos(res.data);
    } catch (err) {
      console.error("Gagal ambil data public", err);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!inputTask && !selectedImage) return;

    // 1. SET LOADING MENJADI TRUE
    setIsLoading(true);

    const formData = new FormData();
    formData.append("task", inputTask);
    if (selectedImage) formData.append("image", selectedImage);

    try {
      await api.post("/todos", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setInputTask("");
      setSelectedImage(null);
      document.getElementById("imageInput").value = "";
      fetchAllTodos();
    } catch (err) {
      console.error("Gagal tambah postingan", err);

      if (err.response?.status === 401 || err.response?.status === 403) {
        alert("Sesi habis atau token kadaluarsa, silakan login kembali.");
      } else if (err.response?.status === 400) {
        alert(
          "Gagal memposting: " +
            (err.response?.data?.message ||
              "Format file salah atau terlalu besar.")
        );
      } else {
        alert("Gagal memposting, coba lagi nanti.");
      }
    } finally {
      // 2. SET LOADING MENJADI FALSE DI FINALLY
      // Blok finally akan selalu dieksekusi, entah try sukses atau catch error
      setIsLoading(false);
    }
  };

  const handleToggle = async (todo) => {
    try {
      // ✅ Ganti axios dengan api
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
    const formData = new FormData();
    formData.append("task", editText);
    if (editImage) formData.append("image", editImage);

    try {
      // ✅ Ganti axios dengan api
      const res = await api.put(`/todos/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setTodos(todos.map((t) => (t._id === id ? res.data : t)));
      setIsModalOpen(false);
      setEditImage(null);
    } catch (err) {
      console.error("Gagal update postingan", err);
    }
  };

  const handleDelete = async (id) => {
    try {
      // ✅ Ganti axios dengan api
      await api.delete(`/todos/${id}`);
      fetchAllTodos();
    } catch (err) {
      console.error("Gagal hapus task", err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user"); // Bersihkan juga data user jika ada

    // Paksa pindah halaman dan refresh
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen bg-gray-100 py-10 font-sans">
      <div className="max-w-xl mx-auto px-4">
        {/* --- TOMBOL PEMBUKA (Floating Button di pojok kiri bawah atau atas) --- */}
        {/* --- FLOATING BUTTON WHAT'S NEW --- */}
        <button
          onClick={() => setIsDrawerOpen(true)}
          className="fixed bottom-6 left-6 z-40 flex items-center gap-2 bg-white/90 backdrop-blur-sm border border-blue-100 text-blue-600 px-5 py-3 rounded-full shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all group"
        >
          <span className="text-lg group-hover:rotate-12 transition-transform">
            ✨
          </span>
          <span className="font-bold text-sm tracking-wide">What's New</span>
          {/* Indikator Dot Notifikasi (Opsional) */}
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
          </span>
        </button>

        {/* --- OVERLAY (OPTIMIZED) --- */}
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
            {/* Header Drawer */}
            <div className="flex justify-between items-center border-b pb-4 mb-4">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                {showNews ? "🚀 What's New" : "Menu Utama"}
              </h2>
              <button
                onClick={() => {
                  setIsDrawerOpen(false);
                  setShowNews(false); // Reset ke menu utama saat tutup
                }}
                className="text-gray-500 hover:text-red-500 text-2xl"
              >
                &times;
              </button>
            </div>

            {/* KONTEN DINAMIS */}
            {!showNews ? (
              /* --- TAMPILAN AWAL: LIST MENU --- */
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
              /* --- TAMPILAN KEDUA: KONTEN WHAT'S NEW (OPTIMIZED) --- */
              /* min-h-0 di sini adalah kunci agar area scroll di dalamnya terdeteksi oleh browser mobile */
              <div className="flex-1 flex flex-col min-h-0 animate-in fade-in slide-in-from-right-4 duration-300">
                {/* Tombol Back - Menggunakan px-6 agar sejajar dengan isi timeline */}
                <div className="px-6 py-2">
                  <button
                    onClick={() => setShowNews(false)}
                    className="text-blue-600 text-sm font-bold flex items-center gap-1 hover:text-blue-800 transition-colors py-2"
                  >
                    ← Kembali ke Menu
                  </button>
                </div>

                {/* Area Scrollable */}
                <div className="flex-1 overflow-y-auto pr-2 pl-6 space-y-6 will-change-transform touch-pan-y overscroll-contain custom-scrollbar">
                  {NEWS_UPDATES.map((update) => (
                    <section
                      key={update.version}
                      className="relative pl-8 border-l-2 border-gray-100 last:border-l-transparent pb-4"
                    >
                      {/* Titik Timeline - Sekarang menggunakan -left-[9px] agar bulat sempurna di tengah garis */}
                      <span
                        className={`absolute -left-2.25 top-1 h-4 w-4 rounded-full border-4 border-white shadow-sm ${
                          update.version === NEWS_UPDATES[0].version
                            ? "bg-blue-500"
                            : "bg-gray-300"
                        }`}
                      ></span>

                      {/* Label Versi & Tanggal */}
                      <div className="mb-1">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                            update.color === "blue"
                              ? "bg-blue-50 text-blue-600"
                              : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {update.version} • {update.date}
                        </span>
                      </div>

                      {/* Judul & List */}
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
                  ))}

                  {/* Spacer bawah: Sangat penting untuk iPhone 14 Pro Max agar tidak tertutup Home Indicator */}
                  <div className="h-24" />
                </div>
              </div>
            )}

            {/* Footer Drawer */}
            <div className="mt-auto pt-4 border-t text-center text-xs text-gray-400">
              Build with ❤️ and Fun!
            </div>
          </div>
        </div>

        {/* --- HEADER UTAMA (ULTRA RESPONSIVE) --- */}
        <div className="sticky top-0 z-30 flex justify-between items-center mb-8 bg-white/80 backdrop-blur-md p-3 md:p-6 rounded-xl shadow-sm border-b border-gray-100 mx-2 sm:mx-0 overflow-hidden">
          {/* SISI KIRI: Hamburger + Logo 
      Gunakan min-w-0 dan flex-1 agar area ini bisa mengecil secara dinamis
  */}
          <div className="flex items-center gap-1.5 sm:gap-4 min-w-0 flex-1">
            {/* Tombol Hamburger: flex-shrink-0 wajib agar tidak gepeng */}
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="shrink-0 p-2 hover:bg-gray-100 rounded-lg transition-colors group"
              aria-label="Open Menu"
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

            {/* Logo: 
        1. min-w-0: Penting agar elemen h2 bisa mengecil di bawah ukuran aslinya.
        2. truncate: Memotong teks dengan (...) jika menabrak tombol Logout.
    */}
            <h2 className="text-sm xs:text-base md:text-2xl font-bold text-gray-800 tracking-tight truncate min-w-0 select-none">
              MyFace <span className="text-blue-600">is Fun</span>
            </h2>
          </div>

          {/* SISI KANAN: Tombol Logout 
      flex-shrink-0: Menjamin tombol ini tetap pada ukurannya dan tidak tergeser keluar.
  */}
          <div className="shrink-0 ml-2">
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-3 md:px-4 py-2 rounded-lg text-[10px] xs:text-xs md:text-sm font-semibold transition-all active:scale-95 shadow-sm whitespace-nowrap"
            >
              Logout
            </button>
          </div>
        </div>

        {/* --- FORM TAMBAH POST (FIXED RESPONSIVE) --- */}
        <form
          onSubmit={handleAdd}
          className="mb-8 bg-white p-3 sm:p-4 rounded-xl shadow-sm flex flex-col gap-3 mx-2 sm:mx-0 overflow-hidden"
        >
          <div className="flex gap-2 items-center w-full min-w-0">
            {/* Input Teks: 
        - basis-0: Memaksa input untuk tidak punya lebar default.
        - flex-grow: Mengambil sisa ruang yang ada.
        - min-w-0: Kunci agar input bisa mengecil sampai sangat kecil tanpa mendorong tombol.
    */}
            <div className="grow shrink min-w-0 basis-0">
              <input
                type="text"
                value={inputTask}
                onChange={(e) => setInputTask(e.target.value)}
                placeholder="Apa yang kamu pikirkan?"
                className="w-full bg-gray-50 border border-gray-200 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm truncate"
              />
            </div>

            {/* Sisi Kanan: Icon Kamera & Tombol Post (Dibungkus agar tidak terpisah) */}
            <div className="shrink-0 flex items-center gap-1 sm:gap-2">
              {/* Tombol Kamera */}
              <label className="cursor-pointer p-2 hover:bg-gray-100 rounded-full transition-colors shrink-0">
                <input
                  id="imageInput"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setSelectedImage(e.target.files[0])}
                  className="hidden"
                />
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 sm:h-6 sm:w-6 text-gray-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </label>

              {/* Tombol Post: 
    - disabled: Mencegah klik ganda saat sedang upload (isLoading === true)
    - opacity & cursor: Memberikan feedback visual bahwa tombol sedang tidak aktif
*/}
              <button
                type="submit"
                disabled={isLoading}
                className={`shrink-0 text-white px-4 sm:px-6 py-2 rounded-full font-bold transition-all shadow-md text-xs sm:text-sm whitespace-nowrap 
    ${
      isLoading
        ? "bg-blue-400 cursor-not-allowed opacity-70"
        : "bg-blue-600 hover:bg-blue-700 active:scale-95"
    }`}
              >
                {/* Tampilkan teks yang berbeda saat loading */}
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <svg
                      className="animate-spin h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Memposting...
                  </div>
                ) : (
                  "Post"
                )}
              </button>
            </div>
          </div>

          {/* Preview Gambar (Jika ada gambar terpilih) */}
          {selectedImage && (
            <div className="relative inline-block w-20 h-20 mt-2 ml-2">
              <img
                src={URL.createObjectURL(selectedImage)}
                className="w-full h-full object-cover rounded-lg border"
                alt="preview"
              />
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center shadow-md"
              >
                ✕
              </button>
            </div>
          )}

          {/* Preview Nama File Jika Ada Gambar Terpilih */}
          {selectedImage && (
            <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-100 rounded-lg w-fit">
              <span className="text-xs text-blue-700 font-medium">
                🖼️ {selectedImage.name}
              </span>
              <button
                type="button"
                onClick={() => {
                  setSelectedImage(null);
                  document.getElementById("imageInput").value = "";
                }}
                className="text-blue-700 hover:text-red-500 font-bold text-xs"
              >
                ✕
              </button>
            </div>
          )}
        </form>

        {/* --- LIST POSTINGAN (FEED) --- */}
        <div className="flex flex-col gap-6">
          {todos.map((todo) => {
            // CEK: Apakah ini postingan saya?
            const isMyPost = todo.userId?._id === currentUserId;

            return (
              <div
                key={todo._id}
                className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden relative"
              >
                {/* --- HEADER POST --- */}
                <div className="flex items-center justify-between p-4 gap-3">
                  <div className="flex items-center gap-3">
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-full bg-linear-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-inner">
                      {todo.userId?.username?.charAt(0).toUpperCase() || "A"}
                    </div>

                    <div className="flex flex-col">
                      <strong className="text-sm text-gray-900 hover:underline cursor-pointer">
                        {todo.userId?.username || "Anonymous"}
                      </strong>
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        {new Date(todo.createdAt).toLocaleString("id-ID", {
                          day: "numeric",
                          month: "numeric",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}{" "}
                        • 🌍 Public
                      </span>
                    </div>
                  </div>

                  {/* --- TOMBOL AKSI (Hanya muncul jika isMyPost === true) --- */}
                  {isMyPost && (
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation(); // Agar tidak memicu event klik di elemen pembungkus
                          setOpenMenuId(
                            openMenuId === todo._id ? null : todo._id
                          );
                        }}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors active:bg-gray-200"
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

                      {/* Menu Dropdown - Muncul berdasarkan state openMenuId */}
                      {openMenuId === todo._id && (
                        <>
                          {/* Overlay transparan untuk menutup menu saat klik di luar area menu */}
                          <div
                            className="fixed inset-0 z-10"
                            onClick={() => setOpenMenuId(null)}
                          ></div>

                          <div className="absolute right-0 top-full mt-1 w-32 bg-white border border-gray-100 rounded-lg shadow-xl z-20 animate-in fade-in slide-in-from-top-1 duration-150">
                            <button
                              onClick={() => {
                                startEdit(todo);
                                setOpenMenuId(null);
                              }}
                              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 flex items-center gap-2"
                            >
                              ✏️ Edit
                            </button>
                            <button
                              onClick={() => {
                                handleDelete(todo._id);
                                setOpenMenuId(null);
                              }}
                              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
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
                  {editingId === todo._id ? (
                    <div className="flex flex-col gap-2">
                      <input
                        className="w-full bg-gray-50 border border-blue-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-200 outline-none"
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        autoFocus
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setEditingId(null)}
                          className="text-xs text-gray-500"
                        >
                          Batal
                        </button>
                        <button
                          onClick={() => handleUpdateText(todo._id)}
                          className="text-xs bg-blue-600 text-white px-2 py-1 rounded"
                        >
                          Simpan
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Teks Postingan */}
                      <p
                        className={`text-base leading-relaxed text-gray-800 mb-3 ${
                          todo.completed ? "line-through text-gray-400" : ""
                        }`}
                      >
                        {todo.task}
                      </p>

                      {/* TAMPILAN GAMBAR (Hanya muncul jika ada data image) */}
                      {todo.image && (
                        <div className="mt-3 rounded-lg overflow-hidden border border-gray-100">
                          <img
                            src={`${API_URL}${todo.image}`}
                            alt="post-content"
                            className="w-full h-auto object-cover max-h-112.5 hover:opacity-95 transition-opacity cursor-pointer"
                            onError={(e) => {
                              e.target.style.display = "none"; // Sembunyikan jika gambar gagal load
                            }}
                          />
                        </div>
                      )}
                    </>
                  )}
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
            {/* Header Modal */}
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-800">
                Edit Postingan
              </h3>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setEditImage(null);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Body Modal */}
            <div className="p-6 flex flex-col gap-4">
              {/* Input Teks */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Isi Postingan
                </label>
                <textarea
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none h-28"
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  placeholder="Tuliskan perubahan kamu..."
                  autoFocus
                />
              </div>

              {/* Input Edit Gambar */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ganti Gambar (Opsional)
                </label>
                <div className="flex items-center gap-3">
                  <label className="flex-1 flex flex-col items-center justify-center px-4 py-4 bg-gray-50 text-blue-600 rounded-xl border-2 border-dashed border-gray-200 cursor-pointer hover:bg-blue-50 hover:border-blue-200 transition-all">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 mb-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
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

                  {editImage && (
                    <button
                      onClick={() => setEditImage(null)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                      title="Batalkan gambar baru"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Footer Modal */}
            <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3">
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setEditImage(null);
                }}
                className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Batal
              </button>
              <button
                onClick={() => handleUpdateText(selectedTodo._id)}
                className="px-6 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-md transition-all active:scale-95"
              >
                Simpan Perubahan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TodoPage;
