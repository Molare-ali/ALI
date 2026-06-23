"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { CartItem } from "@/lib/types";

type CartContextValue = {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (index: number) => void;
  updateQuantity: (index: number, quantity: number) => void;
  clearCart: () => void;
  total: number;
  count: number;
};

const CartContext = createContext<CartContextValue | null>(null);
const key = "molare-cart";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    const stored = window.localStorage.getItem(key);
    if (stored) setItems(JSON.parse(stored));
  }, []);

  useEffect(() => {
    window.localStorage.setItem(key, JSON.stringify(items));
  }, [items]);

  const value = useMemo<CartContextValue>(() => {
    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const count = items.reduce((sum, item) => sum + item.quantity, 0);

    return {
      items,
      total,
      count,
      addItem: (item) =>
        setItems((current) => {
          const index = current.findIndex((existing) => existing.productId === item.productId && existing.size === item.size && existing.color === item.color);
          if (index === -1) return [...current, item];
          return current.map((existing, currentIndex) => (currentIndex === index ? { ...existing, quantity: existing.quantity + item.quantity } : existing));
        }),
      removeItem: (index) => setItems((current) => current.filter((_, currentIndex) => currentIndex !== index)),
      updateQuantity: (index, quantity) => setItems((current) => current.map((item, currentIndex) => (currentIndex === index ? { ...item, quantity: Math.max(1, quantity) } : item))),
      clearCart: () => setItems([])
    };
  }, [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside CartProvider");
  return context;
}
