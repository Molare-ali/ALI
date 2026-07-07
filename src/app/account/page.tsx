import Link from "next/link";
import { redirect } from "next/navigation";
import { OrderSummary } from "@/components/OrderSummary";
import { getSessionUser } from "@/lib/auth";
import { readData } from "@/lib/db";
import { filterOrdersForCustomer } from "@/lib/order-security";
import { formatCurrency } from "@/lib/whatsapp";

export default async function AccountPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login?redirect=/account");

  const data = await readData();
  const orders = filterOrdersForCustomer(data.orders, user.id);

  return (
    <section className="luxury-container grid gap-8 py-12">
      <div>
        <p className="fine-label text-plum">Account</p>
        <h1 className="serif-title mt-2 text-5xl text-aubergine">Your Details</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
        <aside className="h-fit border border-aubergine/30 bg-ivory p-6 shadow-luxury">
          <p className="fine-label text-plum">Profile</p>
          <dl className="mt-5 grid gap-4 text-sm">
            <div>
              <dt className="fine-label text-aubergine">Name</dt>
              <dd className="mt-1 text-onyx/75">{user.fullName}</dd>
            </div>
            <div>
              <dt className="fine-label text-aubergine">Email</dt>
              <dd className="mt-1 break-words text-onyx/75">{user.email}</dd>
            </div>
            {user.phone && (
              <div>
                <dt className="fine-label text-aubergine">Phone</dt>
                <dd className="mt-1 text-onyx/75">{user.phone}</dd>
              </div>
            )}
            <div>
              <dt className="fine-label text-aubergine">Role</dt>
              <dd className="mt-1 capitalize text-onyx/75">{user.role}</dd>
            </div>
          </dl>
          {user.role === "admin" && (
            <Link href="/admin" className="mt-6 inline-flex min-h-11 items-center border border-aubergine bg-aubergine px-5 py-3 text-sm font-semibold text-ivory transition hover:bg-plum">
              Open Admin Dashboard
            </Link>
          )}
        </aside>

        <div className="grid gap-5">
          <div className="flex flex-wrap items-end justify-between gap-4 border-b border-aubergine/25 pb-4">
            <div>
              <p className="fine-label text-plum">Orders</p>
              <h2 className="serif-title text-4xl text-aubergine">Order History</h2>
            </div>
            {orders.length > 0 && <p className="text-sm font-semibold text-aubergine">{orders.length} total / {formatCurrency(orders.reduce((sum, order) => sum + order.total, 0))}</p>}
          </div>

          {orders.length === 0 ? (
            <div className="border border-aubergine/30 bg-ivory p-8">
              <p className="serif-title text-3xl text-aubergine">No orders yet</p>
              <p className="mt-2 max-w-xl text-sm leading-6 text-onyx/64">Your confirmed checkout submissions will appear here after you place an order.</p>
              <Link href="/shop" className="mt-5 inline-flex min-h-11 items-center border border-aubergine bg-aubergine px-5 py-3 text-sm font-semibold text-ivory transition hover:bg-plum">
                Shop Collection
              </Link>
            </div>
          ) : (
            <div className="grid gap-6">
              {orders.map((order) => (
                <OrderSummary key={order.id} order={order} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
