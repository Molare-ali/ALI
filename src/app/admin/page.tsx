import { AdminLayout } from "@/components/AdminLayout";
import { readData } from "@/lib/db";
import { formatCurrency } from "@/lib/whatsapp";

export default async function AdminDashboardPage() {
  const { products, orders, categories } = await readData();
  const revenue = orders.reduce((sum, order) => sum + order.total, 0);
  const cards = [
    { label: "Products", value: products.length },
    { label: "Categories", value: categories.length },
    { label: "Orders", value: orders.length },
    { label: "Revenue", value: formatCurrency(revenue) }
  ];

  return (
    <AdminLayout title="Dashboard">
      <div className="grid gap-4 md:grid-cols-4">
        {cards.map((card) => (
          <div key={card.label} className="border border-champagne/30 bg-ivory p-6 shadow-sm">
            <p className="fine-label text-champagne">{card.label}</p>
            <p className="serif-title mt-4 text-4xl text-aubergine">{card.value}</p>
          </div>
        ))}
      </div>
    </AdminLayout>
  );
}
