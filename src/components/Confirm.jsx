import React from "react";

export default function Confirm({ open, title = "Are you sure?", desc = "", onCancel, onOk, okText = "Confirm" }) {
    if (!open) return null;
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 border border-slate-700 rounded-2xl max-w-md w-full">
                <div className="p-5 border-b border-slate-700">
                    <div className="text-lg font-bold">{title}</div>
                    {desc && <div className="text-sm text-gray-400 mt-1">{desc}</div>}
                </div>
                <div className="p-5 flex gap-2 justify-end">
                    <button onClick={onCancel} className="px-4 py-2 rounded-lg border border-slate-700 hover:bg-slate-700">
                        Cancel
                    </button>
                    <button onClick={onOk} className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700">
                        {okText}
                    </button>
                </div>
            </div>
        </div>
    );
}
