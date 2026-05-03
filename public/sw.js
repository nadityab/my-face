// public/sw.js

// Event ini akan "menangkap" tembakan notifications dari backend
self.addEventListener("push", function (event) {
  const data = event.data ? event.data.json() : {};

  const title = data.title || "MyFace Notif!";
  const options = {
    body: data.body || "Ada pemberitahuan baru nih buat kamu.",
    icon: "/vite.svg", // Ini pakai logo Vite bawaan, nanti bisa diganti logo aplikasimu
    badge: "/vite.svg",
    data: {
      url: data.url || "/", // URL tujuan saat notifications diklik
    },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Event saat user mengklik pop-up notifikasi
self.addEventListener("notificationclick", function (event) {
  event.notification.close(); // Tutup pop-up
  event.waitUntil(clients.openWindow(event.notification.data.url)); // Buka tab baru sesuai URL
});
