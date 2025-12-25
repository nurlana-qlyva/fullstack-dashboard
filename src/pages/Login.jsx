import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
    const { login, user } = useAuth();
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [err, setErr] = useState("");

    const onSubmit = async (e) => {
        e.preventDefault();
        setErr("");
        try {
            await login(email, password);
            navigate("/", { replace: true });
        } catch (e2) {
            setErr(e2?.response?.data?.message || "Login failed");
        }
    };

    useEffect(() => {
        if (user) navigate("/", { replace: true });
    }, [user]);

    return (
        <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-6">
            <form onSubmit={onSubmit} className="w-full max-w-md bg-slate-800/60 border border-slate-700 rounded-2xl p-6">
                <h1 className="text-2xl font-bold">Admin Login</h1>
                <p className="text-sm text-gray-400 mt-1">Backend’e bağlanıp giriş yap</p>

                <div className="mt-6 space-y-3">
                    <input
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 outline-none focus:border-purple-500"
                        placeholder="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <input
                        type="password"
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 outline-none focus:border-purple-500"
                        placeholder="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    {err && <div className="text-red-400 text-sm">{err}</div>}
                    <button className="w-full bg-purple-600 hover:bg-purple-700 rounded-lg py-3 font-semibold">
                        Login
                    </button>
                </div>
            </form>
        </div>
    );
}
