// src/constants/newsUpdates.js

export const NEWS_UPDATES = [
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
