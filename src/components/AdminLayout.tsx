"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ExternalLink, LayoutDashboard, LogOut, Package, ReceiptText, Settings, Tags } from "lucide-react";
import type { ReactNode } from "react";
import { Logo } from "@/components/Logo";
import { useAuth } from "@/contexts/AuthContext";

const links = [
  { href: "/admin", label: "Dashboard", Icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", Icon: Package },
  { href: "/admin/categories", label: "Categories", Icon: Tags },
  { href: "/admin/orders", label: "Orders", Icon: ReceiptText },
  { href: "/admin/settings", label: "Settings", Icon: Settings }
];

const subtitles: Record<string, string> = {
  Dashboard: "A focused overview of catalog, order, and revenue activity.",
  Products: "Manage catalog entries, variants, imagery, pricing, and product status.",
  Categories: "Organize storefront collections and merchandising groups.",
  Orders: "Review customer orders and keep fulfillment status current.",
  Settings: "Maintain storefront contact channels and social links."
};

function isActive(pathname: string, href: string) {
  return href === "/admin" ? pathname === href : pathname.startsWith(href);
}

function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="border-b border-champagne/25 bg-aubergine text-ivory lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col lg:border-b-0 lg:border-r">
      <div className="flex min-h-20 items-center justify-between gap-4 px-4 sm:px-6 lg:min-h-0 lg:grid lg:gap-8 lg:px-5 lg:py-6">
        <Link href="/admin" className="inline-flex" aria-label="Molare admin dashboard">
          <Logo compact inverted />
        </Link>
        <p className="hidden fine-label text-champagne/85 lg:block">Atelier Control</p>
      </div>

      <nav className="flex gap-2 overflow-x-auto px-4 pb-4 sm:px-6 lg:grid lg:overflow-visible lg:px-5 lg:pb-0" aria-label="Admin navigation">
        {links.map(({ href, label, Icon }) => {
          const active = isActive(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`group flex min-h-12 shrink-0 items-center gap-3 border px-4 text-sm font-semibold transition lg:w-full ${
                active
                  ? "border-champagne/60 bg-ivory text-aubergine shadow-gold"
                  : "border-transparent text-ivory/75 hover:border-champagne/35 hover:bg-ivory/10 hover:text-ivory"
              }`}
            >
              <Icon size={18} className={active ? "text-champagne" : "text-champagne/80 transition group-hover:text-champagne"} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto hidden px-5 pb-6 lg:block">
        <div className="border border-champagne/25 bg-ivory/10 p-4">
          <p className="fine-label text-champagne">Molare Admin</p>
          <p className="mt-3 text-sm leading-6 text-ivory/70">A wider workspace for catalog operations, fulfillment, and store settings.</p>
        </div>
      </div>
    </aside>
  );
}

function AdminTopbar({ title }: { title: string }) {
  const { user, logout } = useAuth();

  return (
    <header className="border-b border-champagne/25 bg-ivory/90 px-4 py-4 backdrop-blur sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="fine-label text-champagne">Admin Dashboard</p>
          <h1 className="serif-title mt-1 text-4xl leading-tight text-aubergine sm:text-5xl">{title}</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-onyx/62">{subtitles[title] || "Manage the Molare storefront workspace."}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/shop"
            className="inline-flex min-h-11 items-center gap-2 border border-champagne/40 bg-ivory px-4 text-sm font-semibold text-aubergine transition hover:bg-champagne/15"
          >
            View Store <ExternalLink size={16} />
          </Link>
          {user && (
            <button
              type="button"
              onClick={logout}
              className="inline-flex min-h-11 items-center gap-2 border border-aubergine/20 bg-aubergine px-4 text-sm font-semibold text-ivory transition hover:bg-plum"
            >
              <LogOut size={16} /> Sign Out
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

export function AdminCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`border border-champagne/30 bg-ivory shadow-sm ${className}`}>{children}</section>;
}

export function AdminSectionCard({
  title,
  eyebrow,
  description,
  action,
  children,
  className = ""
}: {
  title: string;
  eyebrow?: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <AdminCard className={`min-w-0 ${className}`}>
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-champagne/25 px-5 py-4 sm:px-6">
        <div className="min-w-0">
          {eyebrow && <p className="fine-label text-champagne">{eyebrow}</p>}
          <h2 className="serif-title text-3xl leading-tight text-aubergine">{title}</h2>
          {description && <p className="mt-2 max-w-2xl text-sm leading-6 text-onyx/62">{description}</p>}
        </div>
        {action}
      </div>
      <div className="p-5 sm:p-6">{children}</div>
    </AdminCard>
  );
}

export function AdminStatCard({
  label,
  value,
  detail,
  children
}: {
  label: string;
  value: ReactNode;
  detail?: string;
  children?: ReactNode;
}) {
  return (
    <AdminCard className="grid min-h-36 content-between gap-5 p-5">
      <div className="flex items-start justify-between gap-4">
        <p className="fine-label text-champagne">{label}</p>
        {children && <div className="grid h-10 w-10 place-items-center border border-champagne/35 bg-linen/45 text-aubergine">{children}</div>}
      </div>
      <div>
        <p className="serif-title text-4xl leading-none text-aubergine">{value}</p>
        {detail && <p className="mt-2 text-sm text-onyx/58">{detail}</p>}
      </div>
    </AdminCard>
  );
}

export function AdminStatusBadge({ children, tone = "gold" }: { children: ReactNode; tone?: "gold" | "purple" | "muted" | "green" | "red" }) {
  const styles = {
    gold: "border-champagne/50 bg-champagne/15 text-aubergine",
    purple: "border-aubergine/20 bg-aubergine text-ivory",
    muted: "border-smoke bg-linen/70 text-onyx/65",
    green: "border-emerald-300 bg-emerald-50 text-emerald-800",
    red: "border-red-300 bg-red-50 text-red-700"
  };

  return <span className={`inline-flex min-h-7 items-center border px-2.5 text-xs font-semibold ${styles[tone]}`}>{children}</span>;
}

export function AdminEmptyState({ title, message }: { title: string; message: string }) {
  return (
    <AdminCard className="grid place-items-center p-8 text-center">
      <div className="max-w-md">
        <p className="serif-title text-3xl text-aubergine">{title}</p>
        <p className="mt-2 text-sm leading-6 text-onyx/62">{message}</p>
      </div>
    </AdminCard>
  );
}

export function AdminLayout({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="admin-shell min-h-screen bg-linen/45 text-onyx">
      <div className="grid min-h-screen lg:grid-cols-[280px_minmax(0,1fr)]">
        <AdminSidebar />
        <div className="min-w-0">
          <AdminTopbar title={title} />
          <main className="mx-auto grid w-full max-w-[1680px] gap-6 px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
