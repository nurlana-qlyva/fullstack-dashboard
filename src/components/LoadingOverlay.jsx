import React from "react";

export default function LoadingOverlay({ open, text = "Loading..." }) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9998] flex items-center justify-center">
            <div className="bg-slate-800 border border-slate-700 rounded-2xl px-6 py-4 text-gray-200">
                <div className="font-semibold">{text}</div>
                <div className="text-sm text-gray-400 mt-1">Please wait</div>
            </div>
        </div>
    );
}
