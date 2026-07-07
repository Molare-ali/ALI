"use client";

import { useEffect, useState } from "react";
import { AdminFeedback } from "@/components/admin/AdminFeedback";
import { AdminCard, AdminEmptyState, AdminLayout, AdminStatusBadge } from "@/components/AdminLayout";
import { safeFetchJson } from "@/lib/api-client";
import type { Order, OrderStatus } from "@/lib/types";
import { formatCurrency } from "@/lib/whatsapp";

const statuses: OrderStatus[] = ["Pending", "Confirmed", "Preparing", "Delivered", "Cancelled"];

function statusTone(status: OrderStatus) {
  if (status === "Delivered") return "green";
  if (status === "Cancelled") return "red";
  if (status === "Confirmed" || status === "Preparing") return "purple";
  return "neutral";
}

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
        {orders.length === 0 && <AdminEmptyState title="No orders yet" message="New customer orders will appear here when checkout submissions are created." />}
        {orders.map((order) => (
          <AdminCard key={order.id} className="p-5 sm:p-6">
            <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_260px]">
              <div className="min-w-0">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="fine-label text-plum">{order.orderNumber}</p>
                    <h2 className="serif-title mt-1 text-3xl leading-tight text-aubergine">{order.customerName}</h2>
                  </div>
                  <AdminStatusBadge tone={statusTone(order.status)}>{order.status}</AdminStatusBadge>
                </div>

                <div className="mt-5 grid gap-3 md:grid-cols-3">
                  <div className="border border-aubergine/20 bg-linen/20 p-3">
                    <p className="fine-label text-plum">Contact</p>
                    <p className="mt-1 text-sm font-semibold text-aubergine">{order.customerPhone}</p>
                  </div>
                  <div className="border border-aubergine/20 bg-linen/20 p-3 md:col-span-2">
                    <p className="fine-label text-plum">Location</p>
                    <p className="mt-1 text-sm text-onyx/70">{order.city}, {order.address}</p>
                  </div>
                </div>

                <div className="mt-5 border-t border-aubergine/25 pt-4">
                  <p className="fine-label text-plum">Items</p>
                  <div className="mt-3 grid gap-2">
                    {order.items.map((item, index) => (
                      <div key={`${item.productId}-${index}`} className="grid gap-2 border border-aubergine/20 bg-ivory px-3 py-2 text-sm text-onyx/70 sm:grid-cols-[minmax(0,1fr)_auto]">
                        <span>{item.name} / {item.size} / {item.color}</span>
                        <span className="font-semibold text-aubergine">Qty {item.quantity}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {order.notes && (
                  <div className="mt-4 border border-aubergine/25 bg-linen/25 p-3">
                    <p className="fine-label text-plum">Notes</p>
                    <p className="mt-1 text-sm leading-6 text-onyx/70">{order.notes}</p>
                  </div>
                )}
              </div>

              <div className="grid content-start gap-4 border border-aubergine/25 bg-linen/20 p-4">
                <div>
                  <p className="fine-label text-plum">Total</p>
                  <p className="serif-title mt-2 text-4xl leading-none text-aubergine">{formatCurrency(order.total)}</p>
                </div>
                <label className="grid gap-2 text-sm text-onyx/80">
                  <span className="fine-label text-aubergine">Status</span>
                  <select disabled={updatingId === order.id} value={order.status} onChange={(event) => updateStatus(order.id, event.target.value as OrderStatus)} className="h-12 border border-smoke bg-ivory px-4 text-aubergine outline-none transition focus:border-aubergine focus:ring-2 focus:ring-deepPurple/20 disabled:cursor-not-allowed disabled:opacity-60">
                    {statuses.map((status) => <option key={status}>{status}</option>)}
                  </select>
                </label>
                {updatingId === order.id && <p className="text-sm text-onyx/60">Updating status...</p>}
              </div>
            </div>
          </AdminCard>
        ))}
      </div>
    </AdminLayout>
  );
}
