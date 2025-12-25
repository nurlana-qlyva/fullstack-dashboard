import React, { useEffect, useState } from "react";
import { Backend } from "../services/api";
import { useToast } from "../components/Toast";
import { ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, BarChart, Bar } from "recharts";

export default function AnalyticsPage() {
  const toast = useToast();
  const [range, setRange] = useState("7d");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await Backend.advancedAnalytics(range);
      setData(res);
    } catch (e) {
      toast.error(e?.response?.data?.message || "Analytics load failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [range]); // eslint-disable-line

  const k = data?.kpi || { revenue: 0, orders: 0, avgOrder: 0 };
  const currency = "TRY"; // istersen backend’den dön

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Analytics</h2>
          <p className="text-sm text-gray-400">Revenue, avg order, top customers</p>
        </div>

        <select
          value={range}
          onChange={(e) => setRange(e.target.value)}
          className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 outline-none focus:border-purple-500"
        >
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
          <option value="1y">Last year</option>
        </select>
      </div>

      {/* KPI Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
          <div className="text-sm text-gray-400">Revenue</div>
          <div className="text-2xl font-bold mt-1">
            {Number(k.revenue || 0).toLocaleString()} {currency}
          </div>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
          <div className="text-sm text-gray-400">Orders</div>
          <div className="text-2xl font-bold mt-1">
            {Number(k.orders || 0).toLocaleString()}
          </div>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
          <div className="text-sm text-gray-400">Avg Order</div>
          <div className="text-2xl font-bold mt-1">
            {Number(k.avgOrder || 0).toFixed(0)} {currency}
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <div className="font-semibold mb-3">Revenue by Day</div>
          <div className="text-sm text-gray-400 mb-4">{loading ? "Loading..." : " "}</div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={data?.revenueByDay || []}>
              <defs>
                <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopOpacity={0.3} />
                  <stop offset="95%" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="day" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569", borderRadius: "8px" }} />
              <Area type="monotone" dataKey="revenue" stroke="#8b5cf6" fillOpacity={1} fill="url(#rev)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <div className="font-semibold mb-3">Top Products</div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={data?.topProducts || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="title" stroke="#9ca3af" hide />
              <YAxis stroke="#9ca3af" />
              <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569", borderRadius: "8px" }} />
              <Bar dataKey="revenue" />
            </BarChart>
          </ResponsiveContainer>

          <div className="mt-4 space-y-2 text-sm">
            {(data?.topProducts || []).map((p) => (
              <div key={p.productId} className="flex justify-between text-gray-300">
                <span className="truncate max-w-[60%]">{p.title || "—"}</span>
                <span>{Number(p.revenue).toLocaleString()} {currency}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Customers */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <div className="font-semibold mb-4">Top Customers</div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-gray-400 bg-slate-900/40">
              <tr>
                <th className="text-left px-4 py-3">Name</th>
                <th className="text-left px-4 py-3">Email</th>
                <th className="text-right px-4 py-3">Orders</th>
                <th className="text-right px-4 py-3">Spent</th>
              </tr>
            </thead>
            <tbody>
              {(data?.topCustomers || []).map((c) => (
                <tr key={c.customerId} className="border-t border-slate-700/40">
                  <td className="px-4 py-3 font-medium">{c.name || "—"}</td>
                  <td className="px-4 py-3 text-gray-300">{c.email || "—"}</td>
                  <td className="px-4 py-3 text-right">{c.orders}</td>
                  <td className="px-4 py-3 text-right">
                    {Number(c.spent).toLocaleString()} {currency}
                  </td>
                </tr>
              ))}

              {!loading && (data?.topCustomers?.length || 0) === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-gray-400">
                    No data
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
