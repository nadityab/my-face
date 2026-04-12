import { useState } from "react";

const useCreatePost = (api, fetchAllTodos) => {
  const [text, setText] = useState("");
  const [images, setImages] = useState([]); // Array karena bisa banyak gambar
  const [isLoading, setIsLoading] = useState(false);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = [];
    const MAX_SIZE = 10 * 1024 * 1024; // Limit 10MB per file

    files.forEach((file) => {
      if (file.size > MAX_SIZE) {
        alert(
          `Waduh, ukuran gambar "${file.name}" terlalu besar! Maksimal 10MB ya.`
        );
      } else {
        validFiles.push(file);
      }
    });

    if (validFiles.length > 0) {
      setImages((prev) => [...prev, ...validFiles].slice(0, 10)); // Maksimal 10 gambar
    }

    e.target.value = ""; // Reset input
  };

  const removeImage = (indexToRemove) => {
    setImages((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  const submitPost = async () => {
    if (isLoading || (!text.trim() && images.length === 0)) return;

    setIsLoading(true);
    const formData = new FormData();
    formData.append("task", text || ""); // Sesuaikan "task" atau "content" dengan backend kamu

    // Looping untuk memasukkan semua gambar ke FormData
    images.forEach((image) => {
      formData.append("image", image); // Sesuaikan nama field dengan multer backend
    });

    try {
      await api.post("/todos", formData); // Sesuaikan endpoint dengan backend kamu

      // Bersihkan state setelah berhasil
      setText("");
      setImages([]);

      // Refresh feed utama untuk menampilkan postingan baru
      fetchAllTodos();

      // Kempeskan kotak teks utama
      const postInput = document.getElementById("input-main-post");
      if (postInput) postInput.style.height = "auto";
    } catch (err) {
      console.error("Gagal membuat postingan:", err);
      alert("Gagal mengunggah postingan.");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    text,
    setText,
    images,
    removeImage,
    isLoading,
    handleImageChange,
    submitPost,
  };
};

export default useCreatePost;
