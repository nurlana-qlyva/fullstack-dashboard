import React, { createContext, useContext, useMemo, useState } from "react";

const ToastCtx = createContext(null);

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const api = useMemo(() => ({
        push: (type, message) => {
            const id = Math.random().toString(16).slice(2);
            setToasts((t) => [...t, { id, type, message }]);
            setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3000);
        },
        success: (m) => api.push("success", m),
        error: (m) => api.push("error", m),
        info: (m) => api.push("info", m),
    }), []);

    return (
        <ToastCtx.Provider value={api}>
            {children}
            <div className="fixed right-4 top-4 z-[9999] space-y-2">
                {toasts.map((t) => (
                    <div
                        key={t.id}
                        className={`min-w-[260px] max-w-[360px] px-4 py-3 rounded-xl border shadow-lg ${t.type === "success"
                                ? "bg-green-500/10 border-green-500/30 text-green-200"
                                : t.type === "error"
                                    ? "bg-red-500/10 border-red-500/30 text-red-200"
                                    : "bg-slate-800 border-slate-700 text-gray-200"
                            }`}
                    >
                        {t.message}
                    </div>
                ))}
            </div>
        </ToastCtx.Provider>
    );
}

export function useToast() {
    return useContext(ToastCtx);
}
