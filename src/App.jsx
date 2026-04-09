import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import TodoPage from "./pages/TodoPage";

function App() {
  // Ambil token dari localStorage
  const token = localStorage.getItem("token");

  return (
    <Routes>
      {/* 1. Halaman utama: Jika ada token langsung ke home, jika tidak ke login */}
      <Route
        path="/"
        element={token ? <Navigate to="/home" /> : <Navigate to="/login" />}
      />
      {/* 2. Rute Login: Jika user sudah login, jangan bolehkan buka halaman login lagi */}
      <Route
        path="/login"
        element={token ? <Navigate to="/home" /> : <LoginPage />}
      />
      {/* 3. Rute To-Do List (PROTECTED): Jika tidak ada token, tendang ke login */}
      <Route
        path="/home"
        element={token ? <TodoPage /> : <Navigate to="/login" />}
      />
      {/* 4. Catch-all: Jika user ngetik asal, arahkan ke login atau home */}
      <Route path="*" element={<Navigate to="/" />} />
      {/* 5. Auto scroll ke jalur share */}
      <Route path="/post/:postId" element={<TodoPage />} />{" "}
      {/* Jalur khusus share */}
    </Routes>
  );
}

export default App;
