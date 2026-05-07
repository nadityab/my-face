//this is useAddComment.js
import { useState } from "react";

// 🧠 SANG OTAK (Custom Hook: Berisi State & Logika API)
const useAddComment = (todoId, api, setComments, fetchAllTodos) => {
  const [text, setText] = useState("");
  const [image, setImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert(
        `Waduh, ukuran gambar "${file.name}" terlalu besar! Maksimal 10MB ya.`
      );
      e.target.value = "";
      return;
    }
    setImage(file);
    e.target.value = "";
  };

  const submitComment = async () => {
    if (isLoading || (!text.trim() && !image)) return;

    setIsLoading(true);
    const formData = new FormData();
    formData.append("content", text || "");
    if (image) formData.append("image", image);

    try {
      // Nembak API
      const res = await api.post(`/comments/${todoId}`, formData);

      // Optimistic UI Update
      setComments((prev) => ({
        ...prev,
        [todoId]: [...(prev[todoId] || []), res.data],
      }));

      // Bersihkan State
      setText("");
      setImage(null);
      fetchAllTodos();

      // Kempeskan kotak teks
      const commentInput = document.getElementById(`input-comment-${todoId}`);
      if (commentInput) commentInput.style.height = "auto";
    } catch (err) {
      console.error("Gagal mengirim komentar:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Kembalikan apa saja yang dibutuhkan oleh UI
  // Pastikan baris return di useAddComment.js seperti ini:
  return {
    text,
    setText,
    image,
    setImage,
    isLoading,
    handleImageChange,
    submitComment,
  };
};

export default useAddComment;
