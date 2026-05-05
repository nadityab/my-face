// ==========================================
// FILE: public/sw.js (FULL VERSION)
// ==========================================

// 1. EVENT: INSTALL & ACTIVATE
// Berfungsi agar Service Worker (SW) terpasang dan langsung aktif tanpa nunggu tab ditutup
self.addEventListener("install", (event) => {
  console.log("SW: Installed");
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  console.log("SW: Activated");
});

// 2. EVENT: FETCH (SYARAT PWA)
// Wajib ada agar browser menganggap MyFace adalah aplikasi PWA yang valid
self.addEventListener("fetch", (event) => {
  event.respondWith(fetch(event.request));
});

// 3. EVENT: PUSH (ANTI-DOUBLE)
// Menangkap tembakan notifikasi dari backend kamu
self.addEventListener("push", function (event) {
  // Ambil data JSON yang dikirim backend (notificationController.js)
  const data = event.data ? event.data.json() : {};

  // LOGIKA PENCEGAH DOUBLE: Cek apakah aplikasi sedang dibuka oleh user
  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        // Cek apakah ada tab MyFace yang sedang fokus (sedang dibuka user)
        const isAppFocused = clientList.some((client) => client.focused);

        // JIKA APLIKASI LAGI DIBUKA, kita batalkan pemunculan pop-up sistem
        // Inilah kunci agar notifikasi tidak double saat kamu sedang asik main MyFace
        if (isAppFocused) {
          console.log("SW: Aplikasi sedang fokus, abaikan pop-up sistem.");
          return;
        }

        // JIKA APLIKASI TERTUTUP/DI BACKGROUND, munculkan pop-up ini:
        const title = data.title || "MyFace Notif!";
        const options = {
          body: data.body || "Ada pemberitahuan baru nih buat kamu.",
          icon: "/logo192.png", // Pastikan file ini ada di folder public
          badge: "/logo192.png",
          data: {
            url: data.url || "/",
          },
          // Tag unik agar browser tahu notifikasi ini tidak boleh diduplikasi
          tag: data.tag || "myface-notification-tag",
          // Renotify: Tetap getar meski tag sama (untuk update notif baru)
          renotify: true,
        };

        return self.registration.showNotification(title, options);
      })
  );
});

// 4. EVENT: CLICK (SMART NAVIGATION)
// Mengatur apa yang terjadi saat pop-up notifikasi diklik user
self.addEventListener("notificationclick", function (event) {
  event.notification.close(); // Tutup dulu pop-up nya

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        const urlToOpen = event.notification.data.url;

        // CEK: Apakah tab MyFace sudah terbuka di browser?
        for (const client of clientList) {
          if (client.url === urlToOpen && "focus" in client) {
            // Jika sudah terbuka, pindah ke tab tersebut saja (jangan buka tab baru terus)
            return client.focus();
          }
        }

        // Jika belum ada tab yang terbuka sama sekali, buka tab baru
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});
