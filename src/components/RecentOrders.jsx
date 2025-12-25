import React, { useEffect, useState } from "react";
import { Eye } from "lucide-react";
import { Backend } from "../services/api";

const StatusBadge = ({ status }) => {
    const map = {
        pending: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
        processing: "bg-blue-500/20 text-blue-300 border-blue-500/30",
        completed: "bg-green-500/20 text-green-400 border-green-500/30",
        cancelled: "bg-red-500/20 text-red-300 border-red-500/30",
        refunded: "bg-purple-500/20 text-purple-300 border-purple-500/30",
    };
    return <span className={`px-2 py-1 border rounded-full text-xs ${map[status] || map.pending}`}>{status}</span>;
};

export default function RecentOrders({ onView }) {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        (async () => {
            setLoading(true);
            try {
                const res = await Backend.recentOrders(5);
                setItems(res);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    return (
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
            <h3 className="text-lg font-bold mb-4">Recent Orders</h3>

            {loading && <div className="text-gray-400 text-sm">Loading...</div>}

            {!loading && items.length === 0 && (
                <div className="text-gray-400 text-sm">No recent orders</div>
            )}

            <div className="space-y-3">
                {items.map((o) => (
                    <div key={o._id} className="flex items-center justify-between border border-slate-700/50 rounded-lg p-3">
                        <div>
                            <div className="font-medium">#{o._id.slice(-6)}</div>
                            <div className="text-sm text-gray-400">
                                {o.customer?.name || "—"} · {new Date(o.createdAt).toLocaleString()}
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="text-sm">
                                {Number(o.total).toLocaleString()} {o.currency}
                            </div>
                            <StatusBadge status={o.status} />
                            <button
                                className="p-2 hover:bg-slate-700 rounded-lg"
                                title="View"
                                onClick={() => onView(o._id)}
                            >
                                <Eye size={16} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
