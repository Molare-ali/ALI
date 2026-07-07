"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/Button";
import { Input, TextArea } from "@/components/Input";
import { OrderSummary } from "@/components/OrderSummary";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";

export default function CheckoutPage() {
  const { user } = useAuth();
  const { items, total, clearCart } = useCart();
  const router = useRouter();
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) router.replace("/login?redirect=/checkout");
  }, [router, user]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (!user) {
      setError("Please log in or create an account to complete your order.");
      return;
    }
    if (!items.length) {
      setError("Your cart is empty.");
      return;
    }

    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerId: user.id,
        customerName: String(form.get("fullName")),
        customerPhone: String(form.get("phone")),
        city: String(form.get("city")),
        address: String(form.get("address")),
        notes: String(form.get("notes") || ""),
        items,
        total
      })
    });
    const data = await response.json();
    if (!response.ok) {
      setError(data.error || "Unable to place order.");
      return;
    }
    clearCart();
    window.open(data.whatsappLink, "_blank", "noopener,noreferrer");
    router.push(`/order-success/${data.order.id}`);
  }

  return (
    <section className="luxury-container py-12">
      <p className="fine-label text-plum">Checkout</p>
      <h1 className="serif-title mb-8 text-5xl text-aubergine">Complete Your Order</h1>
      <div className="grid gap-8 lg:grid-cols-[1fr_420px]">
        <motion.form
          onSubmit={submit}
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.42 }}
          className="grid gap-5 border border-aubergine/30 bg-ivory p-6 shadow-luxury"
        >
          <div className="flex items-center gap-2 text-sm text-aubergine">
            {["Details", "Invoice", "WhatsApp"].map((step, index) => (
              <div key={step} className="flex items-center gap-2">
                <motion.span initial={{ scale: 0.82 }} animate={{ scale: 1 }} transition={{ delay: index * 0.08 }} className="grid h-7 w-7 place-items-center border border-aubergine/50 text-xs">
                  {index + 1}
                </motion.span>
                <span className="fine-label hidden sm:inline">{step}</span>
                {index < 2 && <span className="h-px w-8 bg-deepPurple/35" />}
              </div>
            ))}
          </div>
          {error && <p className="border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
          <Input label="Full name" name="fullName" required defaultValue={user?.fullName || ""} />
          <Input label="Phone number" name="phone" required defaultValue={user?.phone || ""} />
          <Input label="City" name="city" required />
          <Input label="Full address" name="address" required />
          <TextArea label="Optional notes" name="notes" />
          <Button type="submit">Confirm Order on WhatsApp</Button>
        </motion.form>
        <OrderSummary items={items} />
      </div>
    </section>
  );
}
