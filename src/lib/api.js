import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const api = axios.create({
  baseURL: `${API_BASE}/api`,
  withCredentials: true, // ✅ refreshToken cookie için şart
});

// ✅ Token'ı hem header'a hem localStorage'a kaydet
export function setAccessToken(token) {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
    localStorage.setItem("accessToken", token);
  } else {
    delete api.defaults.headers.common.Authorization;
    localStorage.removeItem("accessToken");
  }
}

// ✅ Sayfa yüklenince localStorage'dan token'ı yükle
const savedToken = localStorage.getItem("accessToken");
if (savedToken) {
  setAccessToken(savedToken);
}

// ✅ Refresh token queue management
let isRefreshing = false;
let refreshQueue = [];

function processQueue(error, token = null) {
  refreshQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve(token);
    }
  });
  refreshQueue = [];
}

// ✅ Response interceptor - 401 hatalarını yakala
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;

    // ✅ 401 hatası ve henüz retry yapılmamış
    if (err?.response?.status === 401 && !original._retry) {
      original._retry = true;

      // ✅ /auth/refresh veya /auth/login endpoint'lerinde retry yapma
      if (original.url?.includes("/auth/refresh") || original.url?.includes("/auth/login")) {
        console.log("❌ Auth endpoint failed, not retrying");
        return Promise.reject(err);
      }

      // ✅ Zaten refresh yapılıyorsa kuyruğa ekle
      if (isRefreshing) {
        try {
          const token = await new Promise((resolve, reject) => {
            refreshQueue.push({ resolve, reject });
          });
          original.headers.Authorization = `Bearer ${token}`;
          return api(original);
        } catch (queueError) {
          return Promise.reject(queueError);
        }
      }

      // ✅ Refresh işlemini başlat
      isRefreshing = true;

      try {
        console.log("🔄 Refreshing access token...");
        const { data } = await api.post("/auth/refresh");
        const newToken = data.accessToken;

        setAccessToken(newToken);
        processQueue(null, newToken);

        original.headers.Authorization = `Bearer ${newToken}`;
        console.log("✅ Token refreshed successfully");
        return api(original);
      } catch (refreshError) {
        console.error("❌ Token refresh failed:", refreshError.message);
        processQueue(refreshError, null);
        setAccessToken(null);

        // ✅ Refresh başarısızsa login sayfasına yönlendir
        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(err);
  }
);