import type { CartItem, Order } from "@/lib/types";
import { formatCurrency } from "@/lib/whatsapp";

export function OrderSummary({ items, order }: { items?: CartItem[]; order?: Order }) {
  const orderItems = order?.items || items || [];
  const total = order?.total || orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <section className="border border-aubergine/30 bg-ivory p-6 shadow-luxury">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="fine-label text-plum">Invoice</p>
          <h2 className="serif-title text-3xl text-aubergine">{order?.orderNumber || "Order Summary"}</h2>
        </div>
        {order && <span className="border border-aubergine/45 px-3 py-2 text-sm text-aubergine">{order.status}</span>}
      </div>
      <div className="grid gap-4">
        {orderItems.map((item, index) => (
          <div key={`${item.productId}-${item.size}-${item.color}-${index}`} className="grid grid-cols-[64px_1fr_auto] gap-4 border-b border-aubergine/20 pb-4">
            <img src={item.image} alt={item.name} className="h-16 w-16 object-cover" />
            <div>
              <h3 className="font-semibold text-onyx">{item.name}</h3>
              <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-onyx/60">
                Size {item.size} / {item.colorHex && <span className="inline-block h-4 w-4 border border-aubergine/50" style={{ backgroundColor: item.colorHex }} />} {item.color} / Qty {item.quantity}
              </p>
            </div>
            <p className="font-semibold text-aubergine">{formatCurrency(item.price * item.quantity)}</p>
          </div>
        ))}
      </div>
      <div className="mt-5 flex items-center justify-between border-t border-aubergine/40 pt-5">
        <span className="fine-label text-aubergine">Total Price</span>
        <strong className="serif-title text-3xl text-aubergine">{formatCurrency(total)}</strong>
      </div>
    </section>
  );
}
