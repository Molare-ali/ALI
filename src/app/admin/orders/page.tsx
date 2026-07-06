"use client";

import { useEffect, useState } from "react";
import { AdminFeedback } from "@/components/admin/AdminFeedback";
import { AdminLayout } from "@/components/AdminLayout";
import { safeFetchJson } from "@/lib/api-client";
import type { Order, OrderStatus } from "@/lib/types";
import { formatCurrency } from "@/lib/whatsapp";

const statuses: OrderStatus[] = ["Pending", "Confirmed", "Preparing", "Delivered", "Cancelled"];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function load() {
    try {
      setOrders(await safeFetchJson<Order[]>("/api/orders"));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load orders.");
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function updateStatus(id: string, status: OrderStatus) {
    try {
      setUpdatingId(id);
      setError("");
      setSuccess("");
      const updated = await safeFetchJson<Order>(`/api/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      setOrders((current) => current.map((order) => (order.id === id ? updated : order)));
      setSuccess(`Order ${updated.orderNumber} status updated.`);
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "Unable to update order status.");
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <AdminLayout title="Orders">
      {(error || success) && (
        <div className="mb-5 grid gap-3">
          {error && <AdminFeedback type="error" message={error} onDismiss={() => setError("")} />}
          {success && <AdminFeedback type="success" message={success} onDismiss={() => setSuccess("")} />}
        </div>
      )}
      <div className="grid gap-4">
        {orders.length === 0 && <p className="border border-champagne/30 bg-ivory p-6 text-onyx/64">No orders yet.</p>}
        {orders.map((order) => (
          <article key={order.id} className="border border-champagne/30 bg-ivory p-5 shadow-sm">
            <div className="grid gap-4 md:grid-cols-[1fr_auto]">
              <div>
                <p className="fine-label text-champagne">{order.orderNumber}</p>
                <h2 className="serif-title text-3xl text-aubergine">{order.customerName}</h2>
                <p className="mt-2 text-sm text-onyx/62">{order.customerPhone} / {order.city}, {order.address}</p>
                <p className="mt-2 font-semibold text-aubergine">{formatCurrency(order.total)}</p>
              </div>
              <select disabled={updatingId === order.id} value={order.status} onChange={(event) => updateStatus(order.id, event.target.value as OrderStatus)} className="h-12 border border-smoke bg-ivory px-4 text-aubergine disabled:cursor-not-allowed disabled:opacity-60">
                {statuses.map((status) => <option key={status}>{status}</option>)}
              </select>
            </div>
            {updatingId === order.id && <p className="mt-3 text-sm text-onyx/60">Updating status...</p>}
            <div className="mt-5 grid gap-2 border-t border-champagne/25 pt-4 text-sm text-onyx/70">
              {order.items.map((item, index) => (
                <p key={`${item.productId}-${index}`}>{item.name} / {item.size} / {item.color} / Qty {item.quantity}</p>
              ))}
              {order.notes && <p>Notes: {order.notes}</p>}
            </div>
          </article>
        ))}
      </div>
    </AdminLayout>
  );
}
