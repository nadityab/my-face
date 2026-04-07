import axios from "axios";

export const API_URL = "http://localhost:3000";

const api = axios.create({
  baseURL: API_URL,
});

// 1. INTERCEPTOR REQUEST: Pasang token di setiap kali kita kirim data ke server
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 2. INTERCEPTOR RESPONSE: Menangani jawaban dari server
api.interceptors.response.use(
  (response) => {
    // --- FITUR RENEWAL OTOMATIS ---
    // Jika server mengirimkan field 'token' baru (hasil renewal dari /me),
    // kita timpa token lama di localStorage agar masa aktifnya segar lagi.
    if (response.data && response.data.token) {
      localStorage.setItem("token", response.data.token);
      console.log("Sesi diperbarui secara otomatis ⚡");
    }
    return response;
  },
  (error) => {
    // --- HANDLING EXPIRED / UNAUTHORIZED ---
    // Jika server balas 401, berarti token sudah beneran mati atau tidak valid
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      // Gunakan window.location.href untuk memastikan user benar-benar 'ditendang' keluar
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
