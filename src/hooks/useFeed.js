import { useState, useEffect, useCallback, useRef } from "react";

const useFeed = (api) => {
  const [todos, setTodos] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const observerTarget = useRef(null);
  const [notifications, setNotifications] = useState([]);
  const [totalUnread, setTotalUnread] = useState(0);
  const [isLoadingNotif, setIsLoadingNotif] = useState(false);

  // Fetch notifikasi
  const fetchNotifications = useCallback(async () => {
    if (isLoadingNotif) return;

    setIsLoadingNotif(true);
    try {
      const res = await api.get(`/notif?page=1&limit=20`);
      setNotifications(res.data.notifications);
      setTotalUnread(res.data.totalUnread);
    } catch (err) {
      console.error("Gagal ambil notifikasi:", err);
    } finally {
      setIsLoadingNotif(false);
    }
  }, [api, isLoadingNotif]);

  // Tandai notifikasi sebagai dibaca
  const markNotifAsRead = async (notificationId) => {
    try {
      await api.put(`/notif/${notificationId}/read`);
      setNotifications(prev =>
        prev.map(notif =>
          notif._id === notificationId ? { ...notif, isRead: true } : notif
        )
      );
      setTotalUnread(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Gagal tandai dibaca:", err);
    }
  };

  // Tandai semua notifikasi sebagai dibaca
  const markAllNotifAsRead = async () => {
    try {
      await api.put("/notif/read-all");
      setNotifications(prev =>
        prev.map(notif => ({ ...notif, isRead: true }))
      );
      setTotalUnread(0);
    } catch (err) {
      console.error("Gagal tandai semua dibaca:", err);
    }
  };

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

  useEffect(() => {
    // 1. Set interval setiap 30.000 ms (0,5 menit)
    const interval = setInterval(() => {
      console.log("Auto-refresh: Mengecek postingan terbaru...");

      // Kita panggil fetchTodos(1) untuk mengambil data terbaru di halaman paling atas
      // Ini tidak akan menghapus data lama yang sudah di-scroll ke bawah
      // karena logika di setTodos kita sudah pakai penanganan duplikat (New Set)
      fetchTodos(1);
      fetchNotifications();
    }, 30000);

    // 2. CLEANUP: Sangat penting untuk menghapus interval saat user pindah halaman
    // Agar tidak terjadi memory leak atau aplikasi jadi berat
    return () => clearInterval(interval);
  }, [fetchTodos, fetchNotifications]);

  // Ambil notifikasi pertama kali saat mount
  useEffect(() => {
    fetchNotifications();
  }, []);

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
    fetchNotifications();
  };

  return {
    todos,
    setTodos,
    isFetchingMore,
    hasMore,
    observerTarget,
    refreshFeed,
    notifications,
    totalUnread,
    isLoadingNotif,
    markNotifAsRead,
    markAllNotifAsRead,
  };
};

export default useFeed;
