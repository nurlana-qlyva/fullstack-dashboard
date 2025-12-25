import React, { createContext, useContext, useEffect, useState } from "react";
import { api, setAccessToken } from "../lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  // ✅ Login fonksiyonu
  async function login(email, password) {
    const { data } = await api.post("/auth/login", { email, password });

    // Token'ı kaydet
    setAccessToken(data.accessToken);

    // User'ı state'e kaydet
    setUser(data.user);

    console.log("✅ Login successful:", data.user.email);
    return data.user;
  }

  // ✅ Logout fonksiyonu
  async function logout() {
    try {
      await api.post("/auth/logout");
    } catch (err) {
      console.error("Logout error:", err);
    }

    setAccessToken(null);
    setUser(null);
    console.log("👋 Logged out");
  }

  // ✅ Sayfa yüklenince token'ı yenile
  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        // LocalStorage'da token varsa refresh dene
        const existingToken = localStorage.getItem("accessToken");

        if (existingToken) {
          console.log("🔄 Refreshing token...");

          // ✅ withCredentials zaten api instance'da tanımlı
          const { data } = await api.post("/auth/refresh");

          if (mounted) {
            setAccessToken(data.accessToken);

            // ✅ User bilgisini al (yeni token ile)
            const userRes = await api.get("/users/me");
            setUser(userRes.data);

            console.log("✅ Token refreshed, user loaded");
          }
        }
      } catch (err) {
        console.error("❌ Refresh failed:", err.message);
        // Token geçersizse temizle
        if (mounted) {
          setAccessToken(null);
          setUser(null);
        }
      } finally {
        if (mounted) {
          setReady(true);
        }
      }
    })();

    return () => {
      mounted = false;
    };
  }, []); // ✅ Sadece mount'ta çalışır

  return (
    <AuthContext.Provider value={{ user, setUser, ready, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);