import { CircleDollarSign, Package, ReceiptText, Tags } from "lucide-react";
import { AdminLayout, AdminSectionCard, AdminStatCard, AdminStatusBadge } from "@/components/AdminLayout";
import { readData } from "@/lib/db";
import { formatCurrency } from "@/lib/whatsapp";

export default async function AdminDashboardPage() {
  const { products, orders, categories } = await readData();
  const revenue = orders.reduce((sum, order) => sum + order.total, 0);
  const activeProducts = products.filter((product) => product.active).length;
  const featuredProducts = products.filter((product) => product.featured).length;
  const openOrders = orders.filter((order) => !["Delivered", "Cancelled"].includes(order.status)).length;
  const latestOrders = orders.slice(0, 4);
  const cards = [
    { label: "Products", value: products.length, detail: `${activeProducts} active in catalog`, icon: <Package size={19} /> },
    { label: "Categories", value: categories.length, detail: "Collection groups", icon: <Tags size={19} /> },
    { label: "Orders", value: orders.length, detail: `${openOrders} need attention`, icon: <ReceiptText size={19} /> },
    { label: "Revenue", value: formatCurrency(revenue), detail: "All recorded orders", icon: <CircleDollarSign size={19} /> }
  ];

  return (
    <AdminLayout title="Dashboard">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <AdminStatCard key={card.label} label={card.label} value={card.value} detail={card.detail}>
            {card.icon}
          </AdminStatCard>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
        <AdminSectionCard title="Control Room" eyebrow="Today" description="A quick read on the parts of the store that usually need operational attention.">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="border border-champagne/25 bg-linen/25 p-4">
              <p className="fine-label text-champagne">Featured</p>
              <p className="serif-title mt-3 text-3xl text-aubergine">{featuredProducts}</p>
              <p className="mt-1 text-sm text-onyx/58">Products promoted on the storefront.</p>
            </div>
            <div className="border border-champagne/25 bg-linen/25 p-4">
              <p className="fine-label text-champagne">Inactive</p>
              <p className="serif-title mt-3 text-3xl text-aubergine">{products.length - activeProducts}</p>
              <p className="mt-1 text-sm text-onyx/58">Products hidden from shoppers.</p>
            </div>
            <div className="border border-champagne/25 bg-linen/25 p-4">
              <p className="fine-label text-champagne">Open Orders</p>
              <p className="serif-title mt-3 text-3xl text-aubergine">{openOrders}</p>
              <p className="mt-1 text-sm text-onyx/58">Not delivered or cancelled.</p>
            </div>
          </div>
        </AdminSectionCard>

        <AdminSectionCard title="Recent Orders" eyebrow="Queue" description="Latest orders at a glance.">
          <div className="grid gap-3">
            {latestOrders.length === 0 && <p className="text-sm text-onyx/62">No orders yet.</p>}
            {latestOrders.map((order) => (
              <div key={order.id} className="grid gap-3 border border-champagne/25 bg-linen/20 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="fine-label text-champagne">{order.orderNumber}</p>
                    <p className="font-semibold text-aubergine">{order.customerName}</p>
                  </div>
                  <AdminStatusBadge tone={order.status === "Cancelled" ? "red" : order.status === "Delivered" ? "green" : "gold"}>{order.status}</AdminStatusBadge>
                </div>
                <p className="text-sm text-onyx/62">{formatCurrency(order.total)}</p>
              </div>
            ))}
          </div>
        </AdminSectionCard>
      </div>
    </AdminLayout>
  );
}
