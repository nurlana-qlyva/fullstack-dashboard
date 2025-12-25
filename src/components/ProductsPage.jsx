import React, { useEffect, useMemo, useState } from "react";
import {
    Search,
    Trash2,
    Edit2,
    Plus,
    X,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import { Backend } from "../services/api";
import Confirm from "../components/Confirm";
import LoadingOverlay from "../components/LoadingOverlay";
import { useToast } from "../components/Toast";

const StatusBadge = ({ status }) => {
    const map = {
        active: "bg-green-500/20 text-green-400 border-green-500/30",
        inactive: "bg-slate-500/20 text-slate-300 border-slate-500/30",
        archived: "bg-red-500/20 text-red-300 border-red-500/30",
    };
    return (
        <span className={`px-3 py-1 border rounded-full text-xs ${map[status] || map.active}`}>
            {status}
        </span>
    );
};

export default function ProductsPage() {
    const toast = useToast();

    const [q, setQ] = useState("");
    const [status, setStatus] = useState("");
    const [category, setCategory] = useState("");
    const [page, setPage] = useState(1);
    const [limit] = useState(10);

    const [data, setData] = useState({
        items: [],
        total: 0,
        totalPages: 1,
        page: 1,
        limit: 10,
    });

    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState("");

    // Create/Edit Modal
    const [openForm, setOpenForm] = useState(false);
    const [editing, setEditing] = useState(null);
    const [saving, setSaving] = useState(false);

    const [form, setForm] = useState({
        title: "",
        sku: "",
        category: "",
        price: 0,
        currency: "TRY",
        stock: 0,
        status: "active",
    });

    // Delete confirm
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [deleteItem, setDeleteItem] = useState(null);
    const [deleting, setDeleting] = useState(false);

    const params = useMemo(
        () => ({
            page,
            limit,
            q: q || undefined,
            status: status || undefined,
            category: category || undefined,
            sortBy: "createdAt",
            sortOrder: "desc",
        }),
        [page, limit, q, status, category]
    );

    const load = async () => {
        setLoading(true);
        setErr("");
        try {
            // ✅ Backend.products params: {page, limit, q, status, category}
            const res = await Backend.products(params);
            setData(res);
        } catch (e) {
            setErr(e?.response?.data?.message || "Products load failed");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, [params]); // eslint-disable-line

    const openCreate = () => {
        setEditing(null);
        setForm({
            title: "",
            sku: "",
            category: "",
            price: 0,
            currency: "TRY",
            stock: 0,
            status: "active",
        });
        setOpenForm(true);
    };

    const openEdit = (p) => {
        setEditing(p);
        setForm({
            title: p.title || "",
            sku: p.sku || "",
            category: p.category || "",
            price: Number(p.price || 0),
            currency: p.currency || "TRY",
            stock: Number(p.stock || 0),
            status: p.status || "active",
        });
        setOpenForm(true);
    };

    const save = async () => {
        // Basic validation
        if (!form.title.trim()) return toast.error("Title is required");
        if (!form.sku.trim()) return toast.error("SKU is required");

        setSaving(true);
        try {
            if (editing) {
                await Backend.updateProduct(editing._id, form);
                toast.success("Product updated");
            } else {
                await Backend.createProduct(form);
                toast.success("Product created");
            }
            setOpenForm(false);
            setEditing(null);
            await load();
        } catch (e) {
            toast.error(e?.response?.data?.message || "Save failed");
        } finally {
            setSaving(false);
        }
    };

    const askDelete = (p) => {
        setDeleteItem(p);
        setConfirmOpen(true);
    };

    const doDelete = async () => {
        if (!deleteItem) return;
        setDeleting(true);
        try {
            await Backend.deleteProduct(deleteItem._id);
            toast.success("Product deleted");
            setConfirmOpen(false);
            setDeleteItem(null);
            await load();
        } catch (e) {
            toast.error(e?.response?.data?.message || "Delete failed");
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center gap-3 justify-between">
                <div>
                    <h2 className="text-xl font-bold">Products</h2>
                    <p className="text-sm text-gray-400">Search, filter, create, edit</p>
                </div>

                <div className="flex gap-3 items-center flex-wrap">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input
                            value={q}
                            onChange={(e) => {
                                setPage(1);
                                setQ(e.target.value);
                            }}
                            placeholder="Search title/sku..."
                            className="bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-2 outline-none focus:border-purple-500"
                        />
                    </div>

                    <input
                        value={category}
                        onChange={(e) => {
                            setPage(1);
                            setCategory(e.target.value);
                        }}
                        placeholder="Category..."
                        className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 outline-none focus:border-purple-500"
                    />

                    <select
                        value={status}
                        onChange={(e) => {
                            setPage(1);
                            setStatus(e.target.value);
                        }}
                        className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 outline-none focus:border-purple-500"
                    >
                        <option value="">All status</option>
                        <option value="active">active</option>
                        <option value="inactive">inactive</option>
                        <option value="archived">archived</option>
                    </select>

                    <button
                        onClick={openCreate}
                        className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg flex items-center gap-2"
                    >
                        <Plus size={16} /> New
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-700/50 flex items-center justify-between">
                    <div className="text-sm text-gray-400">
                        {loading ? "Loading..." : `Total: ${data.total}`}
                    </div>
                    {err && <div className="text-sm text-red-400">{err}</div>}
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-900/40 text-gray-400">
                            <tr>
                                <th className="text-left px-4 py-3">Title</th>
                                <th className="text-left px-4 py-3">SKU</th>
                                <th className="text-left px-4 py-3">Category</th>
                                <th className="text-right px-4 py-3">Price</th>
                                <th className="text-right px-4 py-3">Stock</th>
                                <th className="text-left px-4 py-3">Status</th>
                                <th className="text-right px-4 py-3">Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {data.items.map((p) => (
                                <tr key={p._id} className="border-t border-slate-700/40 hover:bg-slate-900/30">
                                    <td className="px-4 py-3 font-medium">{p.title}</td>
                                    <td className="px-4 py-3 text-gray-300">{p.sku}</td>
                                    <td className="px-4 py-3 text-gray-300">{p.category || "—"}</td>
                                    <td className="px-4 py-3 text-right text-gray-200">
                                        {Number(p.price || 0).toLocaleString()} {p.currency || "TRY"}
                                    </td>
                                    <td className="px-4 py-3 text-right text-gray-200">{p.stock ?? 0}</td>
                                    <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                                    <td className="px-4 py-3">
                                        <div className="flex justify-end gap-2">
                                            <button onClick={() => openEdit(p)} className="p-2 hover:bg-slate-700 rounded-lg">
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => askDelete(p)}
                                                className="p-2 hover:bg-red-500/20 text-red-300 rounded-lg"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}

                            {!loading && data.items.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                                        No products found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
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

            {/* Create/Edit Modal */}
            {openForm && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-800 border border-slate-700 rounded-2xl max-w-lg w-full">
                        <div className="p-5 border-b border-slate-700 flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-bold">{editing ? "Edit Product" : "New Product"}</h3>
                                <p className="text-sm text-gray-400">{editing ? editing.sku : "Create a product"}</p>
                            </div>
                            <button onClick={() => setOpenForm(false)} className="p-2 hover:bg-slate-700 rounded-lg">
                                <X size={18} />
                            </button>
                        </div>

                        <div className="p-5 space-y-3">
                            <input
                                value={form.title}
                                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                                placeholder="Title"
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 outline-none focus:border-purple-500"
                            />
                            <input
                                value={form.sku}
                                onChange={(e) => setForm((f) => ({ ...f, sku: e.target.value }))}
                                placeholder="SKU"
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 outline-none focus:border-purple-500"
                            />
                            <input
                                value={form.category}
                                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                                placeholder="Category"
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 outline-none focus:border-purple-500"
                            />

                            <div className="grid grid-cols-2 gap-3">
                                <input
                                    type="number"
                                    value={form.price}
                                    onChange={(e) => setForm((f) => ({ ...f, price: Number(e.target.value) }))}
                                    placeholder="Price"
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 outline-none focus:border-purple-500"
                                />
                                <select
                                    value={form.currency}
                                    onChange={(e) => setForm((f) => ({ ...f, currency: e.target.value }))}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 outline-none focus:border-purple-500"
                                >
                                    <option value="TRY">TRY</option>
                                    <option value="USD">USD</option>
                                    <option value="EUR">EUR</option>
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <input
                                    type="number"
                                    value={form.stock}
                                    onChange={(e) => setForm((f) => ({ ...f, stock: Number(e.target.value) }))}
                                    placeholder="Stock"
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 outline-none focus:border-purple-500"
                                />
                                <select
                                    value={form.status}
                                    onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 outline-none focus:border-purple-500"
                                >
                                    <option value="active">active</option>
                                    <option value="inactive">inactive</option>
                                    <option value="archived">archived</option>
                                </select>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    disabled={saving}
                                    onClick={save}
                                    className="flex-1 bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg disabled:opacity-50"
                                >
                                    {saving ? "Saving..." : "Save"}
                                </button>
                                <button
                                    onClick={() => setOpenForm(false)}
                                    className="flex-1 bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-lg"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Confirm Delete */}
            <Confirm
                open={confirmOpen}
                title="Delete product?"
                desc={deleteItem ? `Delete: ${deleteItem.title} (${deleteItem.sku})` : ""}
                okText="Delete"
                onCancel={() => {
                    setConfirmOpen(false);
                    setDeleteItem(null);
                }}
                onOk={doDelete}
            />

            {/* Overlay */}
            <LoadingOverlay open={deleting} text="Deleting product..." />
        </div>
    );
}
