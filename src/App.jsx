import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import TodoPage from "./pages/TodoPage";

function App() {
  return (
    <Routes>
      {/* Halaman utama otomatis ke Login */}
      <Route path="/" element={<Navigate to="/login" />} />

      {/* Rute Login */}
      <Route path="/login" element={<LoginPage />} />

      {/* Rute To-Do List */}
      <Route path="/home" element={<TodoPage />} />
    </Routes>
  );
}

export default App;
