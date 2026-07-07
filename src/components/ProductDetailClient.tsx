"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, ShoppingBag } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "./Button";
import type { Product } from "@/lib/types";
import { getDefaultVariant, getProductVariants, getVariantPrice } from "@/lib/product-utils";
import { formatCurrency } from "@/lib/whatsapp";
import { useCart } from "@/contexts/CartContext";

export function ProductDetailClient({
  product,
  categoryName,
  initialVariantId
}: {
  product: Product;
  categoryName: string;
  initialVariantId?: string;
}) {
  const { addItem } = useCart();
  const variants = useMemo(() => getProductVariants(product), [product]);
  const [variantId, setVariantId] = useState(initialVariantId || variants[0]?.id);
  const variant = getDefaultVariant(product, variantId);
  const [image, setImage] = useState(variant?.images[0] || "");
  const [size, setSize] = useState(variant?.sizes[0] || "One Size");
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const price = getVariantPrice(product, variant);

  function selectVariant(nextId: string) {
    const next = variants.find((item) => item.id === nextId);
    if (!next) return;
    setVariantId(next.id);
    setImage(next.images[0]);
    setSize(next.sizes[0] || "One Size");
    setQuantity(1);
  }

  function addSelectedItem() {
    if (!variant) return;
    addItem({
      productId: product.id,
      variantId: variant.id,
      name: product.name,
      slug: product.slug,
      image: image || variant.images[0],
      size,
      color: variant.colorName,
      colorHex: variant.colorHex,
      quantity,
      price,
      sku: variant.sku
    });
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1800);
  }

  return (
    <section className="luxury-container grid gap-12 py-12 lg:grid-cols-[1fr_0.85fr]">
      <div className="grid gap-4">
        <div className="aspect-[4/5] overflow-hidden border border-aubergine/30 bg-linen">
          <AnimatePresence mode="wait">
            <motion.img
              key={image}
              src={image}
              alt={`${product.name} in ${variant?.colorName || "selected color"}`}
              initial={{ opacity: 0, scale: 1.015 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.99 }}
              transition={{ duration: 0.35 }}
              className="h-full w-full object-cover"
            />
          </AnimatePresence>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {variant?.images.map((item) => (
            <button key={item} onClick={() => setImage(item)} className={`aspect-[4/3] overflow-hidden border transition ${image === item ? "border-aubergine" : "border-aubergine/30"}`}>
              <img src={item} alt={product.name} className="h-full w-full object-cover transition duration-500 hover:scale-105" />
            </button>
          ))}
        </div>
      </div>
      <div className="lg:sticky lg:top-28 lg:self-start">
        <p className="fine-label text-plum">{categoryName}</p>
        <h1 className="serif-title mt-3 text-5xl leading-tight text-aubergine">{product.name}</h1>
        <p className="mt-5 text-lg leading-8 text-onyx/70">{product.description}</p>
        <div className="my-8 brand-line" />

        <div className="grid gap-7">
          <div className="flex items-baseline gap-3">
            <span className="serif-title text-4xl text-aubergine">{formatCurrency(price)}</span>
            {(product.discountPrice || variant?.priceOverride) && product.price !== price && <span className="text-onyx/45 line-through">{formatCurrency(product.price)}</span>}
          </div>

          <div className="grid gap-3">
            <span className="fine-label text-aubergine">Color</span>
            <div className="flex flex-wrap gap-3">
              {variants.map((item) => (
                <button key={item.id} onClick={() => selectVariant(item.id)} className={`flex min-h-12 items-center gap-3 border px-4 text-sm transition ${variant?.id === item.id ? "border-aubergine bg-aubergine text-ivory" : "border-aubergine/45 text-aubergine hover:bg-softPurple/15"}`}>
                  <span className="h-5 w-5 border border-aubergine/60" style={{ backgroundColor: item.colorHex }} />
                  {item.colorName}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-3">
            <span className="fine-label text-aubergine">Size</span>
            <div className="flex flex-wrap gap-2">
              {variant?.sizes.map((item) => (
                <button key={item} onClick={() => setSize(item)} className={`min-h-11 min-w-12 border px-4 text-sm transition ${size === item ? "border-aubergine bg-aubergine text-ivory" : "border-aubergine/45 text-aubergine hover:bg-softPurple/15"}`}>
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-2">
            <span className="fine-label text-aubergine">Stock</span>
            <p className="text-sm text-onyx/68">{variant && variant.stock > 0 ? `${variant.stock} pieces available in ${variant.colorName}` : "Out of stock"}</p>
          </div>

          <label className="grid max-w-36 gap-2">
            <span className="fine-label text-aubergine">Quantity</span>
            <input type="number" min={1} max={variant?.stock || 1} value={quantity} onChange={(event) => setQuantity(Number(event.target.value))} className="min-h-12 border border-smoke bg-ivory px-4 outline-none focus:border-aubergine focus:ring-2 focus:ring-deepPurple/20" />
          </label>

          <div className="flex flex-wrap items-center gap-4">
            <Button onClick={addSelectedItem} disabled={!variant || variant.stock <= 0} className="w-full sm:w-auto">
              <ShoppingBag size={18} /> Add to Cart
            </Button>
            <AnimatePresence>
              {added && (
                <motion.span initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="inline-flex items-center gap-2 text-sm font-semibold text-aubergine">
                  <Check size={17} className="text-plum" /> Added to cart
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
