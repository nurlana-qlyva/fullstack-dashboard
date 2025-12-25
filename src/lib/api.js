import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const api = axios.create({
  baseURL: `${API_BASE}/api`,
  withCredentials: true, // refreshToken cookie için şart
});

export function setAccessToken(token) {
  if (token) api.defaults.headers.common.Authorization = `Bearer ${token}`;
  else delete api.defaults.headers.common.Authorization;
}

let isRefreshing = false;
let queue = [];

function processQueue(error, token = null) {
  queue.forEach((p) => (error ? p.reject(error) : p.resolve(token)));
  queue = [];
}

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;

    if (err?.response?.status === 401 && !original._retry) {
      original._retry = true;

      if (isRefreshing) {
        const token = await new Promise((resolve, reject) => queue.push({ resolve, reject }));
        original.headers.Authorization = `Bearer ${token}`;
        return api(original);
      }

      isRefreshing = true;
      try {
        const { data } = await api.post("/auth/refresh");
        const newToken = data.accessToken;
        setAccessToken(newToken);
        processQueue(null, newToken);

        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      } catch (e) {
        processQueue(e, null);
        setAccessToken(null);
        return Promise.reject(e);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(err);
  }
);
