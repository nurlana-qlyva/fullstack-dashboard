import React, { useEffect, useState, useRef } from "react";
import { X } from "lucide-react";
import { Backend } from "../services/api";
import { useToast } from "./Toast";
import InvoiceTemplate from "./InvoiceTemplate";
import { exportInvoicePdf } from "../utils/exportInvoicePdf";

export default function OrderDetailModal({ open, orderId, onClose, onUpdated }) {
    const invoiceRef = useRef(null);
    const [pdfing, setPdfing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [order, setOrder] = useState(null);
    const [statusDraft, setStatusDraft] = useState("pending");
    const [err, setErr] = useState("");
    const [saving, setSaving] = useState(false);

    const toast = useToast();

    useEffect(() => {
        if (!open || !orderId) return;

        (async () => {
            setLoading(true);
            setErr("");
            try {
                const full = await Backend.orderById(orderId);
                setOrder(full);
                setStatusDraft(full.status);
            } catch (e) {
                setErr(e?.response?.data?.message || "Order detail load failed");
            } finally {
                setLoading(false);
            }
        })();
    }, [open, orderId]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 border border-slate-700 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-5 border-b border-slate-700 flex items-center justify-between">
                    <div>
                        <h3 className="text-xl font-bold">Order Detail</h3>
                        <p className="text-sm text-gray-400">{orderId}</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            disabled={pdfing || !order}
                            onClick={async () => {
                                try {
                                    setPdfing(true);
                                    const filename = `invoice-${order._id.slice(-6)}.pdf`;
                                    await exportInvoicePdf(invoiceRef.current, filename);
                                } finally {
                                    setPdfing(false);
                                }
                            }}
                            className="px-3 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-sm"
                        >
                            {pdfing ? "Preparing..." : "Download PDF"}
                        </button>
                        <button onClick={onClose} className="p-2 hover:bg-slate-700 rounded-lg">
                            <X size={18} />
                        </button>
                    </div>
                </div>

                <div className="p-5 space-y-4">
                    {loading && <div className="text-gray-300">Loading...</div>}
                    {err && <div className="text-red-400 text-sm">{err}</div>}

                    {!loading && !err && order && (
                        <>
                            <div className="grid md:grid-cols-2 gap-3 text-sm">
                                <div className="bg-slate-900/40 border border-slate-700/50 rounded-xl p-4">
                                    <div className="text-gray-400 text-xs">Customer</div>
                                    <div className="font-semibold">{order.customer?.name || "—"}</div>
                                    <div className="text-gray-300">{order.customer?.email || ""}</div>
                                </div>

                                <div className="bg-slate-900/40 border border-slate-700/50 rounded-xl p-4">
                                    <div className="text-gray-400 text-xs">Totals</div>
                                    <div className="text-gray-200">
                                        Subtotal: {Number(order.subtotal).toLocaleString()} {order.currency}
                                    </div>
                                    <div className="text-gray-200">
                                        Shipping: {Number(order.shipping).toLocaleString()} {order.currency}
                                    </div>
                                    <div className="text-gray-200">
                                        Discount: {Number(order.discount).toLocaleString()} {order.currency}
                                    </div>
                                    <div className="font-bold mt-1">
                                        Total: {Number(order.total).toLocaleString()} {order.currency}
                                    </div>
                                </div>
                            </div>

                            <div className="bg-slate-900/40 border border-slate-700/50 rounded-xl p-4">
                                <div className="font-semibold mb-3">Items</div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead className="text-gray-400">
                                            <tr>
                                                <th className="text-left py-2">Product</th>
                                                <th className="text-right py-2">Qty</th>
                                                <th className="text-right py-2">Price</th>
                                                <th className="text-right py-2">Line</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {order.items.map((it, idx) => (
                                                <tr key={idx} className="border-t border-slate-700/40">
                                                    <td className="py-2">{it.titleSnapshot || it.product?.title || "—"}</td>
                                                    <td className="py-2 text-right">{it.qty}</td>
                                                    <td className="py-2 text-right">
                                                        {Number(it.price).toLocaleString()} {order.currency}
                                                    </td>
                                                    <td className="py-2 text-right">
                                                        {Number(it.price * it.qty).toLocaleString()} {order.currency}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div className="bg-slate-900/40 border border-slate-700/50 rounded-xl p-4">
                                <div className="text-xs text-gray-400 mb-1">Status</div>
                                <div className="flex flex-col md:flex-row gap-3 md:items-center">
                                    <select
                                        value={statusDraft}
                                        onChange={(e) => setStatusDraft(e.target.value)}
                                        className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 outline-none focus:border-purple-500"
                                    >
                                        <option value="pending">pending</option>
                                        <option value="processing">processing</option>
                                        <option value="completed">completed</option>
                                        <option value="cancelled">cancelled</option>
                                        <option value="refunded">refunded</option>
                                    </select>
                                    <button
                                        disabled={saving}
                                        className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg disabled:opacity-50"
                                        onClick={async () => {
                                            setSaving(true);
                                            try {
                                                const updated = await Backend.updateOrderStatus(order._id, statusDraft);

                                                // ✅ 1) Modal içini güncelle
                                                setOrder(updated);
                                                setStatusDraft(updated.status);

                                                // ✅ 2) Listeyi güncelle (OrdersPage refresh)
                                                await onUpdated?.();
                                                toast.success("Order status updated");

                                            } catch (e) {
                                                toast.error(e?.response?.data?.message || "Status update failed");
                                            } finally {
                                                setSaving(false);
                                            }
                                        }}
                                    >
                                        {saving ? "Updating..." : "Update Status"}
                                    </button>
                                </div>
                                <div className="text-xs text-gray-400 mt-3">
                                    completed → stock düşer, cancelled/refunded → geri koyar
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
            <div className="fixed left-[-99999px] top-0">
                <div ref={invoiceRef}>
                    <InvoiceTemplate order={order} />
                </div>
            </div>
        </div>
    );
}
