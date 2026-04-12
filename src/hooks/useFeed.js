import { useState, useEffect, useCallback, useRef } from "react";

const useFeed = (api) => {
  const [todos, setTodos] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const observerTarget = useRef(null);

  const fetchTodos = useCallback(
    async (pageNum) => {
      if (isFetchingMore || (!hasMore && pageNum !== 1)) return;

      if (pageNum > 1) setIsFetchingMore(true);

      try {
        const limit = 10;
        const res = await api.get(
          `/todos/public?page=${pageNum}&limit=${limit}`
        );
        const newTodos = res.data;

        if (newTodos.length < limit) {
          setHasMore(false);
        } else {
          setHasMore(true);
        }

        setTodos((prev) => {
          if (pageNum === 1) return newTodos;
          const existingIds = new Set(prev.map((t) => t._id));
          const filteredNewTodos = newTodos.filter(
            (t) => !existingIds.has(t._id)
          );
          return [...prev, ...filteredNewTodos];
        });
      } catch (err) {
        console.error("Gagal ambil data public", err);
      } finally {
        setIsFetchingMore(false);
      }
    },
    [api, hasMore, isFetchingMore]
  );

  // Trigger saat page berubah
  useEffect(() => {
    fetchTodos(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  // Radar Infinite Scroll
  // --- RADAR INFINITE SCROLL (VERSI UPGRADE) ---
  useEffect(() => {
    // 1. Inisialisasi radar
    const observer = new IntersectionObserver(
      (entries) => {
        // Jika radar tersentuh layar && data masih ada && tidak sedang loading
        if (entries[0].isIntersecting && hasMore && !isFetchingMore) {
          console.log("Radar Terdeteksi! Memuat halaman:", page + 1);
          setPage((prevPage) => prevPage + 1);
        }
      },
      {
        threshold: 0.1, // ✅ Ubah ke 0.1 agar lebih sensitif (muncul dikit langsung tarik)
        rootMargin: "100px", // ✅ Sihir: Tarik data 100px sebelum user beneran mentok bawah
      }
    );

    // 2. Mulai mengawasi elemen (Antena)
    const currentElement = observerTarget.current;
    if (currentElement) {
      observer.observe(currentElement);
    }

    // 3. Cleanup: Putus koneksi saat komponen mati atau di-render ulang
    return () => {
      if (currentElement) {
        observer.unobserve(currentElement);
      }
    };
    // ✅ TAMBAHKAN 'todos' dan 'page' di sini agar radar selalu segar memantau posisi terbaru
  }, [hasMore, isFetchingMore, todos, page]);

  // Fungsi untuk refresh feed dari awal (Misal: setelah ngepost)
  const refreshFeed = () => {
    setPage(1);
    setHasMore(true);
    fetchTodos(1);
  };

  return {
    todos,
    setTodos,
    isFetchingMore,
    hasMore,
    observerTarget,
    refreshFeed,
  };
};

export default useFeed;
