import React, { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Eye } from "lucide-react";
import { Backend } from "../services/api";

const StatusBadge = ({ status }) => {
  const map = {
    pending: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
    processing: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    completed: "bg-green-500/20 text-green-400 border-green-500/30",
    cancelled: "bg-red-500/20 text-red-300 border-red-500/30",
    refunded: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  };
  return <span className={`px-3 py-1 border rounded-full text-xs ${map[status] || map.pending}`}>{status}</span>;
};

export default function OrdersPage({ onView }) {
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const [data, setData] = useState({ items: [], total: 0, totalPages: 1, page: 1, limit: 10 });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const params = useMemo(() => ({
    page,
    limit,
    status: status || undefined,
  }), [page, limit, status]);

  const load = async () => {
    setLoading(true);
    setErr("");
    try {
      const res = await Backend.orders(params);
      setData(res);
    } catch (e) {
      setErr(e?.response?.data?.message || "Orders load failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [params]); // eslint-disable-line

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center gap-3 justify-between">
        <div>
          <h2 className="text-xl font-bold">Orders</h2>
          <p className="text-sm text-gray-400">List & filter orders</p>
        </div>

        <select
          value={status}
          onChange={(e) => { setPage(1); setStatus(e.target.value); }}
          className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 outline-none focus:border-purple-500"
        >
          <option value="">All status</option>
          <option value="pending">pending</option>
          <option value="processing">processing</option>
          <option value="completed">completed</option>
          <option value="cancelled">cancelled</option>
          <option value="refunded">refunded</option>
        </select>
      </div>

      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-700/50 flex items-center justify-between">
          <div className="text-sm text-gray-400">{loading ? "Loading..." : `Total: ${data.total}`}</div>
          {err && <div className="text-sm text-red-400">{err}</div>}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-900/40 text-gray-400">
              <tr>
                <th className="text-left px-4 py-3">Order</th>
                <th className="text-left px-4 py-3">Customer</th>
                <th className="text-left px-4 py-3">Total</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-left px-4 py-3">Date</th>
                <th className="text-left px-4 py-3">Detail</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((o) => (
                <tr key={o._id} className="border-t border-slate-700/40 hover:bg-slate-900/30">
                  <td className="px-4 py-3 font-medium">{o._id.slice(-6)}</td>
                  <td className="px-4 py-3 text-gray-300">
                    {o.customer?.name || "—"} <span className="text-gray-500">({o.customer?.email || ""})</span>
                  </td>
                  <td className="px-4 py-3 text-gray-300">{Number(o.total).toLocaleString?.()} {o.currency}</td>
                  <td className="px-4 py-3"><StatusBadge status={o.status} /></td>
                  <td className="px-4 py-3 text-gray-300">{new Date(o.createdAt).toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => onView?.(o._id)} className="p-2 hover:bg-slate-700 rounded-lg">
                      <Eye size={16} />
                    </button>
                  </td>
                </tr>
              ))}

              {!loading && data.items.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                    No orders found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="px-4 py-3 border-t border-slate-700/50 flex items-center justify-between">
          <div className="text-gray-400 text-sm">
            Page {data.page} / {data.totalPages}
          </div>
          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-3 py-2 rounded-lg border border-slate-700 disabled:opacity-40 hover:bg-slate-700 flex items-center gap-1"
            >
              <ChevronLeft size={16} /> Prev
            </button>
            <button
              disabled={page >= data.totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-2 rounded-lg border border-slate-700 disabled:opacity-40 hover:bg-slate-700 flex items-center gap-1"
            >
              Next <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
