import { useState, useEffect } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false); // Tambahan: Loading state

  const navigate = useNavigate();

  // --- FITUR AUTO-LOGIN (Validasi Awal) ---
  useEffect(() => {
    const token = localStorage.getItem("token");
    // Jika user sudah punya token dan mencoba buka halaman login,
    // langsung arahkan ke home.
    if (token) {
      navigate("/home", { replace: true });
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const endpoint = isRegister ? "/auth/register" : "/auth/login";
      const res = await api.post(endpoint, {
        username,
        password,
      });

      if (!isRegister) {
        // ✅ HANYA SIMPAN ACCESS TOKEN
        localStorage.setItem("token", res.data.token);

        // ✅ Opsional: Simpan username agar bisa dipakai di UI lain tanpa decode ulang
        localStorage.setItem("username", username);

        // Gunakan replace agar user tidak bisa tekan 'back' kembali ke login
        window.location.href = "/home";
      } else {
        alert("Registrasi Berhasil! Silakan masuk.");
        setIsRegister(false);
        setPassword(""); // Reset password untuk keamanan
      }
    } catch (err) {
      setError(err.response?.data?.message || "Gagal memproses permintaan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 font-sans px-4">
      <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-lg text-center border border-gray-100">
        <h2 className="text-3xl font-extrabold text-gray-800 mb-2">
          MyFace <span className="text-blue-600">is Fun</span>
        </h2>
        <p className="text-sm text-gray-500 mb-8">
          {isRegister
            ? "Bergabunglah dengan komunitas kami"
            : "Masuk untuk melihat feed terbaru"}
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="text-left flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-600 uppercase tracking-tight ml-1">
              Username
            </label>
            <input
              type="text"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50 outline-none transition-all text-sm"
              value={username}
              // ✅ FIX: .toLowerCase() dihapus agar "Polee" tetap "Polee"
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Contoh: Polee_Fun"
              required
            />
          </div>

          <div className="text-left flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-600 uppercase tracking-tight ml-1">
              Password
            </label>
            <input
              type="password"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50 outline-none transition-all text-sm"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 p-3 rounded-xl animate-in fade-in zoom-in duration-200">
              <p className="text-xs text-red-600 font-semibold text-center">
                🚫 {error}
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3.5 px-4 text-white font-bold rounded-xl shadow-md transition-all transform active:scale-95 mt-2 flex justify-center items-center gap-2 ${
              loading
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 hover:shadow-blue-200 shadow-blue-100"
            }`}
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            ) : isRegister ? (
              "Daftar Sekarang"
            ) : (
              "Masuk ke Akun"
            )}
          </button>
        </form>

        <div className="mt-10 pt-6 border-t border-gray-50">
          <p className="text-sm text-gray-600">
            {isRegister ? "Sudah punya akun?" : "Belum punya akun?"}{" "}
            <button
              type="button"
              onClick={() => {
                setIsRegister(!isRegister);
                setError("");
              }}
              className="text-blue-600 font-bold hover:underline"
            >
              {isRegister ? "Login di sini" : "Daftar gratis di sini"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
