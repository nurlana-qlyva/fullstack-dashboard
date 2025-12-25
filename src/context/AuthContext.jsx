import React, { createContext, useContext, useEffect, useState } from "react";
import { api, setAccessToken } from "../lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const t = localStorage.getItem("accessToken");
    if (t) setAccessToken(t);
  }, []);

  async function login(email, password) {
    const { data } = await api.post("/login", { email, password });
    setAccessToken(data.accessToken);
    setUser(data.user);
    return data.user;
  }

  async function logout() {
    try { await api.post("/logout"); } catch { }
    setAccessToken(null);
    setUser(null);
  }

  // sayfa yenilenince cookie varsa token yenile
  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.post("/refresh");
        setAccessToken(data.accessToken);
      } catch { }
      setReady(true);
    })();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, ready, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
