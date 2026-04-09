// src/constants/news-updates.js (Pastikan case-sensitive folder/file sesuai import di TodoPage)

export const NEWS_UPDATES = [
  {
    version: "v1.7.0",
    date: "Coming Soon",
    title: "🔔 Engagement Hub",
    color: "amber",
    points: [
      "Real-time Notifications: Dapatkan pemberitahuan instan saat ada yang mengomentari postinganmu.",
      "Smart Mentions: Sebut temanmu dengan '@username' dan mereka akan mendapatkan notifikasi khusus.",
      "Global Notification Center: Satu tempat untuk melihat semua interaksi yang masuk tanpa memenuhi feed.",
      "Unread Badges: Penanda angka merah pada ikon lonceng agar tidak ada interaksi yang terlewat.",
    ],
  },
  {
    version: "v1.6.5",
    date: "9 April 2026",
    title: "🚀 Deep Connection & Navigation",
    color: "blue",
    points: [
      "Smart Deep Linking: Klik link share dan aplikasi akan otomatis meluncur (scroll) ke postingan yang dimaksud.",
      "Visual Post Highlighting: Efek 'Glow' biru pada postingan target agar user langsung tahu apa yang dibagikan.",
      "Sticky Header Awareness: Sistem scroll yang cerdas, memastikan postingan tidak tertutup oleh bar navigasi atas.",
      "One-Time Scroll Logic: Menggunakan Smart Memory (useRef) agar layar tidak 'narik' balik saat user sedang berinteraksi.",
      "Responsive Sharing: Integrasi dengan Web Share API bawaan smartphone untuk kemudahan berbagi ke aplikasi lain.",
    ],
  },
  {
    version: "v1.6.0",
    date: "8 April 2026",
    title: "🆔 Identity & Instant Response",
    color: "indigo",
    points: [
      "Case-Sensitive Identity: Mendukung penggunaan huruf kapital pada username (Contoh: 'Polee' tidak lagi dipaksa menjadi 'polee').",
      "Optimistic Like System: Reaksi Like terasa instan! Warna berubah dalam sekejap tanpa menunggu respon server.",
      "State Persistence: Mekanisme 'Rollback' otomatis jika koneksi gagal saat memberikan Like.",
      "Interactive Loaders: Penambahan loading spinner pada tombol Post dan Edit untuk mencegah double-post.",
      "UX Refinement: Tombol hapus komentar kini tetap terlihat di perangkat mobile untuk aksesibilitas yang lebih baik.",
    ],
  },
  {
    version: "v1.5.0",
    date: "7 April 2026",
    title: "💬 Social Interaction Engine",
    color: "pink",
    points: [
      "Facebook-Style Comments: Sistem komentar dengan tampilan bubble modern yang interaktif.",
      "Smart Comment Slicing: Secara otomatis menampilkan 3 komentar terbaru untuk menjaga kebersihan feed.",
      "Instant Engagement: Kolom input komentar yang selalu terbuka untuk interaksi lebih cepat.",
      "Comment Management: Fitur hapus komentar pribadi dengan verifikasi kepemilikan.",
      "Full API Integration: Sinkronisasi real-time antara database komentar dan tampilan UI.",
    ],
  },
  {
    version: "v1.4.0",
    date: "6 April 2026",
    title: "⚡ Performance & Stability",
    color: "indigo",
    points: [
      "Double-Post Prevention: Sistem proteksi tombol 'Post' untuk mencegah postingan ganda saat upload.",
      "Silent Refresh Token: Sesi login kini lebih cerdas dengan pembaruan token otomatis di latar belakang.",
      "Upload Loading State: Feedback visual (spinner) saat media sedang dalam proses pengiriman.",
      "General Bug Fixes: Optimalisasi koneksi API dan perbaikan minor pada UI Drawer.",
    ],
  },
  {
    version: "v1.3.0",
    date: "4 April 2026",
    title: "💎 Premium UI & Navigation",
    color: "blue",
    points: [
      "Sticky Glassmorphism Header: Efek blur transparan pada header utama.",
      "Hamburger Navigation: Menu drawer samping untuk navigasi yang lebih bersih.",
      "Sub-menu Logic: Sistem menu bertingkat (Menu Utama -> What's New).",
      "Enhanced Drawer: Tampilan drawer yang tetap memperlihatkan konten Home.",
    ],
  },
  {
    version: "v1.2.0",
    date: "4 April 2026",
    title: "🔐 Security & Auth",
    color: "gray",
    points: [
      "Persistent Login: Sesi tetap aktif meskipun tab browser ditutup.",
      "Route Protection: Otomatis mengarahkan user ke login jika token tidak ada.",
      "Clean Logout: Penghapusan token dan data user secara menyeluruh.",
    ],
  },
  {
    version: "v1.1.0",
    date: "3 April 2026",
    title: "🖼️ Media Engine",
    color: "green",
    points: [
      "WebP Conversion: Otomatis mengubah format gambar untuk kecepatan load.",
      "Smart Compression: Mengurangi ukuran file tanpa merusak kualitas visual.",
    ],
  },
];
