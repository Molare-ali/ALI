"use client";

import Link from "next/link";
import { Menu, ShoppingBag, UserRound, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { Logo } from "./Logo";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";

const nav = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/contact", label: "Contact" }
];

const adminNavItem = { href: "/admin", label: "Admin" };

export function Header() {
  const [open, setOpen] = useState(false);
  const { count } = useCart();
  const { user, logout } = useAuth();
  const navItems = user?.role === "admin" ? [...nav, adminNavItem] : nav;

  return (
    <header className="sticky top-0 z-40 border-b border-aubergine/25 bg-ivory/90 backdrop-blur-xl">
      <div className="luxury-container flex min-h-20 items-center justify-between gap-6">
        <Link href="/" aria-label="Molarè home">
          <Logo compact />
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="fine-label relative text-onyx/75 transition hover:text-aubergine after:absolute after:-bottom-2 after:left-0 after:h-px after:w-0 after:bg-deepPurple after:transition-all hover:after:w-full">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.96 }}>
          <Link href="/cart" aria-label="Cart" className="relative grid h-11 w-11 place-items-center border border-aubergine/30 text-aubergine transition hover:bg-softPurple/15">
            <ShoppingBag size={19} />
            <AnimatePresence>
              {count > 0 && (
                <motion.span key={count} initial={{ scale: 0.65, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.65, opacity: 0 }} className="absolute -right-2 -top-2 grid h-5 min-w-5 place-items-center bg-aubergine px-1 text-xs text-ivory">
                  {count}
                </motion.span>
              )}
            </AnimatePresence>
          </Link>
          </motion.div>
          {user ? (
            <button onClick={logout} className="hidden min-h-11 border border-aubergine/30 px-4 text-sm text-aubergine transition hover:bg-softPurple/15 sm:inline-flex">
              Sign out
            </button>
          ) : (
            <Link href="/login" aria-label="Login" className="hidden h-11 w-11 place-items-center border border-aubergine/30 text-aubergine transition hover:bg-softPurple/15 sm:grid">
              <UserRound size={18} />
            </Link>
          )}
          <button onClick={() => setOpen((value) => !value)} className="grid h-11 w-11 place-items-center border border-aubergine/30 text-aubergine md:hidden" aria-label="Menu">
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
      {open && (
        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden border-t border-aubergine/25 bg-ivory md:hidden">
          <motion.div initial="closed" animate="open" exit="closed" variants={{ open: { transition: { staggerChildren: 0.045 } }, closed: {} }} className="luxury-container grid gap-1 py-4">
            {navItems.map((item) => (
              <motion.div key={item.href} variants={{ open: { opacity: 1, y: 0 }, closed: { opacity: 0, y: 8 } }}>
              <Link href={item.href} onClick={() => setOpen(false)} className="block py-3 fine-label text-aubergine">
                {item.label}
              </Link>
              </motion.div>
            ))}
            <motion.div variants={{ open: { opacity: 1, y: 0 }, closed: { opacity: 0, y: 8 } }}>
            <Link href={user ? "/checkout" : "/login?redirect=/checkout"} onClick={() => setOpen(false)} className="block py-3 fine-label text-aubergine">
              {user ? "Checkout" : "Login"}
            </Link>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>
    </header>
  );
}
