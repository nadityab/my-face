import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import TodoPage from "./pages/TodoPage";
import MainLayout from "./layouts/MainLayout"; // 👈 Import Layout baru
import { SocketProvider } from "./context/SocketContext";

function App() {
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");

  return (
    // ✅ SocketProvider membungkus semuanya agar koneksi socket tersedia di seluruh app
    <SocketProvider userId={userId}>
      <Routes>
        {/* 1. Jalur Utama (Redirect) */}
        <Route
          path="/"
          element={token ? <Navigate to="/home" /> : <Navigate to="/login" />}
        />

        {/* 2. Rute Login (Public - Tanpa Sidebar) */}
        <Route
          path="/login"
          element={token ? <Navigate to="/home" /> : <LoginPage />}
        />

        {/* 3. Rute Home/Todo (Protected - Dengan Sidebar & Dark Mode) */}
        <Route
          path="/home"
          element={
            token ? (
              <MainLayout>
                <TodoPage />
              </MainLayout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        {/* 4. Jalur Khusus Share (Protected - Dengan Sidebar) */}
        <Route
          path="/post/:postId"
          element={
            token ? (
              <MainLayout>
                <TodoPage />
              </MainLayout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        {/* 5. Catch-all: Jika rute tidak ditemukan, balikkan ke pintu utama */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </SocketProvider>
  );
}

export default App;
