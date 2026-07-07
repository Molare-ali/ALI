import { notFound, redirect } from "next/navigation";
import { Button } from "@/components/Button";
import { OrderSummary } from "@/components/OrderSummary";
import { getSessionUser } from "@/lib/auth";
import { readData } from "@/lib/db";
import { buildWhatsAppLink } from "@/lib/whatsapp";

export default async function OrderSuccessPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getSessionUser();
  if (!user) redirect(`/login?redirect=${encodeURIComponent(`/order-success/${id}`)}`);

  const { orders, settings } = await readData();
  const order = orders.find((item) => item.id === id);
  if (!order) notFound();
  if (user.role !== "admin" && order.customerId !== user.id) notFound();

  const whatsappLink = buildWhatsAppLink(settings, order);

  return (
    <section className="luxury-container grid gap-8 py-12 lg:grid-cols-[1fr_0.8fr] lg:items-start">
      <div className="grid gap-5">
        <p className="fine-label text-plum">Order Saved as Pending</p>
        <h1 className="serif-title text-5xl text-aubergine">Thank you, {order.customerName}</h1>
        <p className="max-w-2xl text-lg leading-8 text-onyx/70">Your invoice is ready and the order has been saved in the system. Continue the conversation through WhatsApp with the store owner.</p>
        <div>
          <Button href={whatsappLink}>Open WhatsApp Invoice</Button>
        </div>
      </div>
      <OrderSummary order={order} />
    </section>
  );
}
