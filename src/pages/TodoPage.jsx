import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // Tambahkan ini
import { jwtDecode } from "jwt-decode";

const API_URL = "https://api.myface.fun/todos";

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

  const navigate = useNavigate();

  // 1. Ambil token dari localStorage
  const token = localStorage.getItem("token");
  const decoded = jwtDecode(token);
  const currentUserId = decoded.id; // Sesuaikan dengan key ID di tokenmu

  // 2. Buat fungsi helper untuk Header agar kode lebih bersih
  const authHeader = {
    headers: { Authorization: `Bearer ${token}` },
  };

  useEffect(() => {
    // 3. Proteksi: Jika tidak ada token, tendang ke login
    if (!token) {
      navigate("/login");
    } else {
      fetchAllTodos();
    }
  }, []);

  const fetchPrivateTodos = async () => {
    try {
      // TAMBAHKAN authHeader di sini
      const res = await axios.get(API_URL, authHeader);
      setTodos(res.data);
    } catch (err) {
      console.error("Gagal ambil data", err);
      // Jika token tidak valid/expired, balik ke login
      if (err.response?.status === 401) navigate("/login");
    }
  };

  const fetchAllTodos = async () => {
    try {
      const token = localStorage.getItem("token"); // 1. Ambil token dari storage

      const res = await axios.get(`${API_URL}/public`, {
        headers: {
          Authorization: `Bearer ${token}`, // 2. Masukkan ke header
        },
      });

      setTodos(res.data);
    } catch (err) {
      console.error("Gagal ambil data", err);

      // 3. Jika error 401 (Unauthorized/Token Expired), hapus token & ke login
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
      }
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!inputTask && !selectedImage) return;

    // Gunakan FormData untuk mengirim file + teks
    const formData = new FormData();
    formData.append("task", inputTask);

    if (selectedImage) {
      formData.append("image", selectedImage); // "image" harus sama dengan di backend
    }

    try {
      // Kirim formData, bukan objek JSON
      await axios.post(API_URL, formData, {
        headers: {
          ...authHeader.headers,
          "Content-Type": "multipart/form-data", // Wajib untuk kirim file
        },
      });

      setInputTask("");
      setSelectedImage(null); // Reset input gambar
      document.getElementById("imageInput").value = ""; // Reset input file fisik
      fetchAllTodos(); // Refresh data feed
    } catch (err) {
      console.error(
        "Gagal tambah postingan",
        err.response?.data || err.message
      );
      alert("Gagal memposting, pastikan file adalah gambar.");
    }
  };

  const handleToggle = async (todo) => {
    try {
      // TAMBAHKAN authHeader
      await axios.put(
        `${API_URL}/${todo._id}`,
        {
          completed: !todo.completed,
        },
        authHeader
      );
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

    // Jika ada gambar baru yang dipilih, masukkan ke formData
    if (editImage) {
      formData.append("image", editImage);
    }

    try {
      const res = await axios.put(`${API_URL}/${id}`, formData, {
        headers: {
          ...authHeader.headers,
          "Content-Type": "multipart/form-data",
        },
      });

      // Update state local
      setTodos(todos.map((t) => (t._id === id ? res.data : t)));
      setIsModalOpen(false);
      setEditImage(null); // Reset state gambar setelah sukses
    } catch (err) {
      console.error("Gagal update postingan", err);
      alert("Gagal mengedit postingan.");
    }
  };

  const handleDelete = async (id) => {
    try {
      // TAMBAHKAN authHeader
      await axios.delete(`${API_URL}/${id}`, authHeader);
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
        {/* --- HEADER UTAMA --- */}
        <div className="flex justify-between items-center mb-8 bg-white p-6 rounded-xl shadow-sm">
          <h2 className="text-2xl font-bold text-gray-800">MyFace is Fun</h2>
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
          >
            Logout
          </button>
        </div>

        {/* --- FORM TAMBAH POST --- */}
        <form
          onSubmit={handleAdd}
          className="mb-8 bg-white p-4 rounded-xl shadow-sm flex flex-col gap-3"
        >
          <div className="flex gap-2 items-center">
            <input
              type="text"
              value={inputTask}
              onChange={(e) => setInputTask(e.target.value)}
              placeholder="Apa yang kamu pikirkan?"
              className="flex-1 bg-gray-50 border border-gray-200 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
            />

            {/* Input File Tersembunyi */}
            <label className="cursor-pointer p-2 hover:bg-gray-100 rounded-full transition-colors">
              <input
                id="imageInput"
                type="file"
                accept="image/*"
                onChange={(e) => setSelectedImage(e.target.files[0])}
                className="hidden"
              />
              {/* Icon Kamera */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-gray-500"
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

            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full font-bold transition-all shadow-md active:scale-95 text-sm"
            >
              Post
            </button>
          </div>

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
                            src={`http://api.myface.fun${todo.image}`}
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
