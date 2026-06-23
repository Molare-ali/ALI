import Link from "next/link";
import { LayoutDashboard, Package, ReceiptText, Settings, Tags } from "lucide-react";

const links = [
  { href: "/admin", label: "Dashboard", Icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", Icon: Package },
  { href: "/admin/categories", label: "Categories", Icon: Tags },
  { href: "/admin/orders", label: "Orders", Icon: ReceiptText },
  { href: "/admin/settings", label: "Settings", Icon: Settings }
];

export function AdminLayout({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="luxury-container py-10">
      <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
        <aside className="border border-champagne/30 bg-aubergine p-4 text-ivory">
          <p className="fine-label mb-5 text-champagne">Molarè Admin</p>
          <nav className="grid gap-2">
            {links.map(({ href, label, Icon }) => (
              <Link key={href} href={href} className="flex min-h-11 items-center gap-3 border border-transparent px-3 text-sm text-ivory/84 transition hover:border-champagne/40 hover:text-ivory">
                <Icon size={18} /> {label}
              </Link>
            ))}
          </nav>
        </aside>
        <div className="min-w-0">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-champagne/30 pb-5">
            <div>
              <p className="fine-label text-champagne">Control Room</p>
              <h1 className="serif-title text-4xl text-aubergine">{title}</h1>
            </div>
            <Link href="/shop" className="fine-label text-aubergine">View Store</Link>
          </div>
          {children}
        </div>
      </div>
    </section>
  );
}
