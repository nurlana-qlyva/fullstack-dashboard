import React, { useEffect, useMemo, useState } from "react";
import {
    Users, ShoppingCart, DollarSign, Package, Bell, Settings, LogOut, Menu, ChevronDown, RefreshCw,
    TrendingUp, BarChart, ArrowUpRight, ArrowDownRight
} from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, LineChart, Line, BarChart as RBarChart, Bar } from "recharts";
import { Backend } from "../services/api";
import { useAuth } from "../context/AuthContext";
import UsersPage from "../components/UserPage";
import ProductsPage from "../components/ProductsPage";
import AnalyticsPage from "../components/AnalyticsPage";
import OrdersPage from "../components/OrdersPage";
import RecentOrders from "../components/RecentOrders";
import OrderDetailModal from "../components/OrderDetailModal";

export default function Dashboard() {
    const { user, logout } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [activeTab, setActiveTab] = useState("overview");
    const [timeRange, setTimeRange] = useState("7d");
    const [overviewSeries, setOverviewSeries] = useState([]);
    const [kpis, setKpis] = useState(null);

    const [overview, setOverview] = useState(null);
    const [analytics, setAnalytics] = useState(null);
    const [recentKey, setRecentKey] = useState(0);

    const [orderModalOpen, setOrderModalOpen] = useState(false);
    const [selectedOrderId, setSelectedOrderId] = useState(null);

    const openOrderModal = (id) => {
        setSelectedOrderId(id);
        setOrderModalOpen(true);
    };

    const closeOrderModal = () => {
        setOrderModalOpen(false);
        setSelectedOrderId(null);
    };

    // Demo chart (istersen bunu Orders model ile gerçek yaparız)
    const salesData = [
        { month: "Jan", revenue: 45000, orders: 320, customers: 180 },
        { month: "Feb", revenue: 52000, orders: 380, customers: 220 },
        { month: "Mar", revenue: 48000, orders: 340, customers: 190 },
        { month: "Apr", revenue: 61000, orders: 450, customers: 280 },
        { month: "May", revenue: 55000, orders: 410, customers: 250 },
        { month: "Jun", revenue: 67000, orders: 490, customers: 310 },
        { month: "Jul", revenue: 72000, orders: 520, customers: 340 },
    ];

    const load = async () => {
        const [o, a, ov] = await Promise.all([
            Backend.overview(5),
            Backend.analyticsProducts(),
            Backend.overviewAnalytics(timeRange),
        ]);
        setOverview(o);
        setAnalytics(a);
        setKpis(ov.kpis);
        setOverviewSeries(ov.series.map(x => ({ ...x, month: x.date })));
    };


    useEffect(() => { load().catch(console.error); }, [timeRange]);


    const stats = useMemo(() => {
        const t = overview?.totals || {};
        return [
            { title: "Total Products", value: String(t.totalProducts ?? 0), change: "", trend: "up", icon: Package, color: "from-orange-500 to-red-600" },
            { title: "Active Products", value: String(t.activeProducts ?? 0), change: "", trend: "up", icon: TrendingUp, color: "from-green-500 to-emerald-600" },
            { title: "Total Stock", value: String(t.totalStock ?? 0), change: "", trend: "up", icon: Package, color: "from-blue-500 to-cyan-600" },
            { title: "Low Stock Items", value: String(overview?.lowStock?.length ?? 0), change: "", trend: "down", icon: Bell, color: "from-purple-500 to-pink-600" },
        ];
    }, [overview]);

    const StatCard = ({ stat }) => {
        const Icon = stat.icon;
        return (
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 hover:border-purple-500/50 transition-all group">
                <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform`}>
                        <Icon className="text-white" size={24} />
                    </div>
                    <span className={`flex items-center gap-1 text-sm font-semibold ${stat.trend === "up" ? "text-green-400" : "text-red-400"}`}>
                        {stat.trend === "up" ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                        {stat.change || "—"}
                    </span>
                </div>
                <h3 className="text-gray-400 text-sm mb-1">{stat.title}</h3>
                <p className="text-3xl font-bold text-white">{stat.value}</p>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-slate-900 text-white">
            {/* Sidebar */}
            <aside className={`fixed left-0 top-0 h-full bg-slate-800 border-r border-slate-700 transition-all duration-300 z-40 ${sidebarOpen ? "w-64" : "w-20"}`}>
                <div className="p-4 border-b border-slate-700">
                    <div className="flex items-center justify-between">
                        {sidebarOpen && (
                            <div className="flex items-center gap-2">
                                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center font-bold">
                                    A
                                </div>
                                <div>
                                    <h2 className="font-bold">Admin Panel</h2>
                                    <p className="text-xs text-gray-400">MERN Dashboard</p>
                                </div>
                            </div>
                        )}
                        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-slate-700 rounded-lg">
                            <Menu size={20} />
                        </button>
                    </div>
                </div>

                <nav className="p-4 space-y-2">
                    {[
                        { id: "overview", label: "Overview", icon: TrendingUp },
                        { id: "users", label: "Users", icon: Users },
                        { id: "products", label: "Products", icon: Package },
                        { id: "analytics", label: "Analytics", icon: BarChart },
                        { id: "orders", label: "Orders", icon: ShoppingCart },
                    ].map((item) => {
                        const Icon = item.icon;
                        return (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === item.id
                                    ? "bg-purple-500/20 text-purple-400 border border-purple-500/50"
                                    : "hover:bg-slate-700 text-gray-400 hover:text-white"
                                    }`}
                            >
                                <Icon size={20} />
                                {sidebarOpen && <span>{item.label}</span>}
                            </button>
                        );
                    })}
                </nav>

                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-700">
                    <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-700 text-gray-400 hover:text-white transition-all">
                        <Settings size={20} />
                        {sidebarOpen && <span>Settings</span>}
                    </button>
                    <button
                        onClick={logout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-all mt-2"
                    >
                        <LogOut size={20} />
                        {sidebarOpen && <span>Logout</span>}
                    </button>
                </div>
            </aside>

            {/* Main */}
            <main className={`transition-all duration-300 ${sidebarOpen ? "ml-64" : "ml-20"}`}>
                <header className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700 sticky top-0 z-30">
                    <div className="px-6 py-4 flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold">Dashboard</h1>
                            <p className="text-gray-400 text-sm">Welcome back{user?.name ? `, ${user.name}` : ""}</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <select
                                    value={timeRange}
                                    onChange={(e) => setTimeRange(e.target.value)}
                                    className="bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 pr-10 appearance-none cursor-pointer hover:border-purple-500 transition-colors"
                                >
                                    <option value="7d">Last 7 days</option>
                                    <option value="30d">Last 30 days</option>
                                    <option value="90d">Last 90 days</option>
                                    <option value="1y">Last year</option>
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" size={16} />
                            </div>

                            <button onClick={() => load().catch(console.error)} className="p-2 hover:bg-slate-700 rounded-lg">
                                <RefreshCw size={18} />
                            </button>
                            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center font-bold">
                                A
                            </div>
                        </div>
                    </div>
                </header>

                <div className="p-6">
                    {activeTab === "overview" && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {stats.map((s, i) => <StatCard key={i} stat={s} />)}
                            </div>

                            <div className="grid lg:grid-cols-3 gap-6">
                                <div className="lg:col-span-2 bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
                                    <div className="flex items-center justify-between mb-6">
                                        <div>
                                            <h3 className="text-lg font-bold">Revenue Overview</h3>
                                            <p className="text-sm text-gray-400">Demo chart (orders ekleyince gerçek olur)</p>
                                        </div>
                                    </div>

                                    <ResponsiveContainer width="100%" height={300}>
                                        <AreaChart data={overviewSeries}>
                                            <defs>
                                                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                            <XAxis dataKey="month" stroke="#9ca3af" />
                                            <YAxis stroke="#9ca3af" />
                                            <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569", borderRadius: "8px" }} />
                                            <Area type="monotone" dataKey="revenue" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorRevenue)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>

                                <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
                                    <h3 className="text-lg font-bold mb-6">Orders Trend</h3>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <LineChart data={overviewSeries}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                            <XAxis dataKey="month" stroke="#9ca3af" />
                                            <YAxis stroke="#9ca3af" />
                                            <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569", borderRadius: "8px" }} />
                                            <Line type="monotone" dataKey="orders" stroke="#8b5cf6" strokeWidth={2} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>

                                <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
                                    <h3 className="text-lg font-bold mb-6">Customer Growth</h3>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <RBarChart data={overviewSeries}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                            <XAxis dataKey="month" stroke="#9ca3af" />
                                            <YAxis stroke="#9ca3af" />
                                            <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569", borderRadius: "8px" }} />
                                            <Bar dataKey="customers" fill="#ec4899" radius={[8, 8, 0, 0]} />
                                        </RBarChart>
                                    </ResponsiveContainer>
                                </div>
                                <RecentOrders key={recentKey} onView={(id) => openOrderModal(id)} />


                            </div>
                        </div>
                    )}
                    {activeTab === "users" && <UsersPage />}
                    {activeTab === "products" && <ProductsPage />}
                    {activeTab === "analytics" && <AnalyticsPage />}
                    {activeTab === "orders" && (
                        <OrdersPage onView={(id) => openOrderModal(id)} />
                    )}


                    {!["overview", "users", "products", "analytics"].includes(activeTab) && (
                        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 text-gray-300">
                            Unknown tab: {activeTab}
                        </div>
                    )}

                </div>
            </main>
            <OrderDetailModal
                open={orderModalOpen}
                orderId={selectedOrderId}
                onClose={closeOrderModal}
                onUpdated={async () => {
                    // overview verilerini yeniden çek
                    await load();
                    setRecentKey((k) => k + 1);
                    closeOrderModal()
                }}
            />


        </div>
    );
}
