import { useState, useRef } from "react"; // ✅ Tambahkan useRef

const useCreatePost = (api, refreshFeed) => {
  // ✅ Gunakan nama refreshFeed agar konsisten
  const [text, setText] = useState("");
  const [images, setImages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // ✅ 1. Buat kabel koneksi (Ref) ke textarea
  const textAreaRef = useRef(null);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = [];
    const MAX_SIZE = 10 * 1024 * 1024; // 10MB

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
      setImages((prev) => [...prev, ...validFiles].slice(0, 10));
    }
    e.target.value = "";
  };

  const removeImage = (indexToRemove) => {
    setImages((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  const submitPost = async () => {
    if (isLoading || (!text.trim() && images.length === 0)) return;
    setIsLoading(true);

    const formData = new FormData();
    formData.append("task", text || "");

    images.forEach((image) => {
      formData.append("images", image); // ✅ Sudah benar pakai "images"
    });

    try {
      await api.post("/todos", formData);

      // --- RESET SETELAH BERHASIL ---
      setText("");
      setImages([]);

      // ✅ 2. Reset tinggi kotak teks tanpa pakai getElementById
      if (textAreaRef.current) {
        textAreaRef.current.style.height = "auto";
      }

      // ✅ 3. Panggil refresh feed
      refreshFeed();
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
    textAreaRef, // ✅ 4. Kirim ref ini ke UI
  };
};

export default useCreatePost;
