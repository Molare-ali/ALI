"use client";

import Link from "next/link";
import { Trash2 } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/Button";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { formatCurrency } from "@/lib/whatsapp";

export default function CartPage() {
  const { items, total, updateQuantity, removeItem } = useCart();
  const { user } = useAuth();

  return (
    <section className="luxury-container py-12">
      <p className="fine-label text-plum">Shopping Cart</p>
      <h1 className="serif-title mb-8 text-5xl text-aubergine">Your Selection</h1>
      {!items.length ? (
        <div className="border border-aubergine/30 bg-ivory p-10">
          <p className="mb-6 text-onyx/70">Your cart is empty.</p>
          <Button href="/shop">Shop Collection</Button>
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
          <motion.div layout className="grid gap-4">
            <AnimatePresence initial={false}>
            {items.map((item, index) => (
              <motion.div
                layout
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -24 }}
                key={`${item.productId}-${item.variantId || item.color}-${item.size}-${index}`}
                className="grid gap-4 border border-aubergine/30 bg-ivory p-4 md:grid-cols-[110px_1fr_auto]"
              >
                <img src={item.image} alt={item.name} className="aspect-square w-full object-cover md:w-28" />
                <div>
                  <Link href={`/product/${item.slug}`} className="serif-title text-2xl text-aubergine">{item.name}</Link>
                  <p className="mt-2 flex flex-wrap items-center gap-2 text-sm text-onyx/62">
                    Size: {item.size} / Color:
                    {item.colorHex && <span className="inline-block h-4 w-4 border border-aubergine/50" style={{ backgroundColor: item.colorHex }} />}
                    {item.color}
                  </p>
                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <motion.input layout aria-label="Quantity" type="number" min={1} value={item.quantity} onChange={(event) => updateQuantity(index, Number(event.target.value))} className="h-11 w-20 border border-smoke bg-ivory px-3" />
                    <button onClick={() => removeItem(index)} className="inline-flex h-11 items-center gap-2 border border-aubergine/40 px-3 text-sm text-aubergine">
                      <Trash2 size={16} /> Remove
                    </button>
                  </div>
                </div>
                <div className="text-left md:text-right">
                  <p className="text-sm text-onyx/58">{formatCurrency(item.price)} each</p>
                  <p className="mt-2 font-semibold text-aubergine">Subtotal {formatCurrency(item.price * item.quantity)}</p>
                </div>
              </motion.div>
            ))}
            </AnimatePresence>
          </motion.div>
          <aside className="h-fit border border-white/15 bg-aubergine p-6 text-ivory">
            <p className="fine-label text-softPurple">Total Price</p>
            <p className="serif-title mt-3 text-4xl">{formatCurrency(total)}</p>
            {!user && <p className="mt-5 border border-white/15 p-4 text-sm leading-6 text-ivory/82">Please log in or create an account to complete your order.</p>}
            <Button href={user ? "/checkout" : "/login?redirect=/checkout"} className="mt-6 w-full bg-softPurple text-aubergine hover:bg-ivory">
              {user ? "Checkout" : "Login to Checkout"}
            </Button>
          </aside>
        </div>
      )}
    </section>
  );
}
