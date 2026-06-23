"use client";

import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import type { Order, OrderStatus } from "@/lib/types";
import { formatCurrency } from "@/lib/whatsapp";

const statuses: OrderStatus[] = ["Pending", "Confirmed", "Preparing", "Delivered", "Cancelled"];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);

  async function load() {
    const response = await fetch("/api/orders");
    setOrders(await response.json());
  }

  useEffect(() => {
    load();
  }, []);

  async function updateStatus(id: string, status: OrderStatus) {
    await fetch(`/api/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status })
    });
    await load();
  }

  return (
    <AdminLayout title="Orders">
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
              <select value={order.status} onChange={(event) => updateStatus(order.id, event.target.value as OrderStatus)} className="h-12 border border-smoke bg-ivory px-4 text-aubergine">
                {statuses.map((status) => <option key={status}>{status}</option>)}
              </select>
            </div>
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
