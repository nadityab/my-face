// src/constants/news-updates.js (Pastikan case-sensitive folder/file sesuai import di TodoPage)

export const NEWS_UPDATES = [
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
