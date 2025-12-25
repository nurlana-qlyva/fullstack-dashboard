import React from "react";

export default function InvoiceTemplate({ order }) {
    if (!order) return null;

    const invoiceNo = order._id.slice(-6).toUpperCase();
    const dateStr = new Date(order.createdAt).toLocaleString();

    return (
        <div className="bg-white text-slate-900 p-8 w-[800px]">
            {/* Header */}
            <div className="flex items-start justify-between border-b pb-4">
                <div>
                    <div className="text-2xl font-bold">INVOICE</div>
                    <div className="text-sm text-slate-600 mt-1">Invoice No: #{invoiceNo}</div>
                    <div className="text-sm text-slate-600">Date: {dateStr}</div>
                </div>
                <div className="text-right">
                    <div className="font-bold">MERN Dashboard</div>
                    <div className="text-sm text-slate-600">Bursa, TR</div>
                    <div className="text-sm text-slate-600">support@example.com</div>
                </div>
            </div>

            {/* Bill To */}
            <div className="mt-6 grid grid-cols-2 gap-6">
                <div className="border rounded-lg p-4">
                    <div className="text-xs uppercase text-slate-500 font-semibold">Bill To</div>
                    <div className="mt-2 font-semibold">{order.customer?.name || "—"}</div>
                    <div className="text-sm text-slate-700">{order.customer?.email || ""}</div>
                </div>

                <div className="border rounded-lg p-4">
                    <div className="text-xs uppercase text-slate-500 font-semibold">Order</div>
                    <div className="mt-2 text-sm text-slate-700">
                        Status: <span className="font-semibold">{order.status}</span>
                    </div>
                    <div className="text-sm text-slate-700">
                        Currency: <span className="font-semibold">{order.currency}</span>
                    </div>
                </div>
            </div>

            {/* Items */}
            <div className="mt-6 border rounded-lg overflow-hidden">
                <div className="bg-slate-100 px-4 py-2 text-sm font-semibold">Items</div>
                <table className="w-full text-sm">
                    <thead className="bg-slate-50 text-slate-600">
                        <tr>
                            <th className="text-left px-4 py-2">Product</th>
                            <th className="text-right px-4 py-2">Qty</th>
                            <th className="text-right px-4 py-2">Price</th>
                            <th className="text-right px-4 py-2">Line</th>
                        </tr>
                    </thead>
                    <tbody>
                        {order.items?.map((it, idx) => {
                            const title = it.titleSnapshot || it.product?.title || "—";
                            const qty = Number(it.qty || 0);
                            const price = Number(it.price || 0);
                            return (
                                <tr key={idx} className="border-t">
                                    <td className="px-4 py-2">{title}</td>
                                    <td className="px-4 py-2 text-right">{qty}</td>
                                    <td className="px-4 py-2 text-right">
                                        {price.toLocaleString()} {order.currency}
                                    </td>
                                    <td className="px-4 py-2 text-right">
                                        {(price * qty).toLocaleString()} {order.currency}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Totals */}
            <div className="mt-6 flex justify-end">
                <div className="w-[320px] border rounded-lg p-4">
                    <div className="flex justify-between text-sm py-1">
                        <span className="text-slate-600">Subtotal</span>
                        <span className="font-semibold">
                            {Number(order.subtotal || 0).toLocaleString()} {order.currency}
                        </span>
                    </div>
                    <div className="flex justify-between text-sm py-1">
                        <span className="text-slate-600">Shipping</span>
                        <span className="font-semibold">
                            {Number(order.shipping || 0).toLocaleString()} {order.currency}
                        </span>
                    </div>
                    <div className="flex justify-between text-sm py-1">
                        <span className="text-slate-600">Discount</span>
                        <span className="font-semibold">
                            {Number(order.discount || 0).toLocaleString()} {order.currency}
                        </span>
                    </div>
                    <div className="border-t mt-2 pt-2 flex justify-between">
                        <span className="font-bold">Total</span>
                        <span className="font-bold">
                            {Number(order.total || 0).toLocaleString()} {order.currency}
                        </span>
                    </div>
                </div>
            </div>

            <div className="mt-8 text-xs text-slate-500 border-t pt-3">
                Thank you for your business.
            </div>
        </div>
    );
}
