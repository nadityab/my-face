import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const API_URL = "https://api.myface.fun";

  // --- FITUR AUTO-LOGIN ---
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/home");
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const endpoint = isRegister ? "/auth/register" : "/auth/login";

    try {
      const res = await axios.post(`${API_URL}${endpoint}`, {
        username,
        password,
      });

      if (!isRegister) {
        localStorage.setItem("token", res.data.token);
        if (res.data.user) {
          localStorage.setItem("user", JSON.stringify(res.data.user));
        }
        navigate("/home");
        window.location.reload();
      } else {
        alert("Register Berhasil! Silakan Login.");
        setIsRegister(false);
        setUsername("");
        setPassword("");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Terjadi kesalahan saat masuk");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 font-sans px-4">
      <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-lg text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          {isRegister ? "Buat Akun Baru" : "Selamat Datang"}
        </h2>
        <p className="text-sm text-gray-500 mb-8">
          {isRegister
            ? "Daftar untuk mulai berbagi"
            : "Silakan masuk ke akun Anda"}
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="text-left flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Username
            </label>
            <input
              type="text"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-sm"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Masukkan username"
              required
            />
          </div>

          <div className="text-left flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Password
            </label>
            <input
              type="password"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-sm"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Masukkan password"
              required
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 p-3 rounded-lg">
              <p className="text-xs text-red-600 font-medium">⚠️ {error}</p>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-md hover:shadow-lg transition-all transform active:scale-95 mt-2"
          >
            {isRegister ? "Daftar Sekarang" : "Masuk"}
          </button>
        </form>

        <p className="mt-8 text-sm text-gray-600">
          {isRegister ? "Sudah punya akun?" : "Belum punya akun?"}{" "}
          <button
            onClick={() => {
              setIsRegister(!isRegister);
              setError("");
              setUsername("");
              setPassword("");
            }}
            className="text-blue-600 font-bold hover:underline focus:outline-none"
          >
            {isRegister ? "Login di sini" : "Daftar di sini"}
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
