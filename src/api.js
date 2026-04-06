import axios from "axios";

export const API_URL = "https://api.myface.fun";

const api = axios.create({
  baseURL: API_URL,
});

// 1. Interceptor Request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 2. Interceptor Response
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    const isAuthRequest =
      originalRequest.url.includes("/login") ||
      originalRequest.url.includes("/refresh");

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isAuthRequest
    ) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");

        if (!refreshToken) throw new Error("No refresh token");

        // 1. Panggil API Refresh
        const res = await axios.post(`${API_URL}/auth/refresh`, {
          refreshToken: refreshToken,
        });

        if (res.status === 200 || res.status === 201) {
          // --- BAGIAN YANG DIGANTI ---
          // 2. Ambil Access Token BARU dan Refresh Token BARU dari backend
          const { token, refreshToken: newRefreshToken } = res.data;

          // 3. Simpan KEDUANYA agar masa berlaku 7 hari direset dari nol lagi
          localStorage.setItem("token", token);
          localStorage.setItem("refreshToken", newRefreshToken);

          // 4. Update header request lama
          originalRequest.headers.Authorization = `Bearer ${token}`;

          // 5. Ulangi request
          return api(originalRequest);
          // ----------------------------
        }
      } catch (refreshError) {
        localStorage.clear();
        window.location.href = "/";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
