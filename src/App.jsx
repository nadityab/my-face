import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import TodoPage from "./pages/TodoPage";
import { SocketProvider } from "./context/SocketContext"; // ✅ Import Provider-nya

function App() {
  const token = localStorage.getItem("token");

  // ✅ Ambil userId. Pastikan saat login, kamu juga menyimpan userId ke localStorage!
  // Contoh: localStorage.setItem("userId", user._id);
  const userId = localStorage.getItem("userId");

  return (
    // ✅ Bungkus Routes dengan SocketProvider
    // Socket akan otomatis konek hanya jika userId ada
    <SocketProvider userId={userId}>
      <Routes>
        {/* 1. Halaman utama */}
        <Route
          path="/"
          element={token ? <Navigate to="/home" /> : <Navigate to="/login" />}
        />

        {/* 2. Rute Login */}
        <Route
          path="/login"
          element={token ? <Navigate to="/home" /> : <LoginPage />}
        />

        {/* 3. Rute To-Do List (PROTECTED) */}
        <Route
          path="/home"
          element={token ? <TodoPage /> : <Navigate to="/login" />}
        />

        {/* 4. Catch-all */}
        <Route path="*" element={<Navigate to="/" />} />

        {/* 5. Jalur khusus share */}
        <Route path="/post/:postId" element={<TodoPage />} />
      </Routes>
    </SocketProvider>
  );
}

export default App;
