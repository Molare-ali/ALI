"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import type { Product } from "@/lib/types";
import { getDefaultVariant, getProductImage, getProductVariants, getVariantPrice } from "@/lib/product-utils";
import { formatCurrency } from "@/lib/whatsapp";

export function ProductCard({ product }: { product: Product }) {
  const variants = useMemo(() => getProductVariants(product), [product]);
  const [selectedVariantId, setSelectedVariantId] = useState(variants[0]?.id);
  const selectedVariant = getDefaultVariant(product, selectedVariantId);
  const price = getVariantPrice(product, selectedVariant);
  const image = getProductImage(product, selectedVariant);

  return (
    <motion.article whileHover={{ y: -6 }} className="group grid overflow-hidden border border-champagne/25 bg-ivory shadow-sm transition-shadow duration-300 hover:shadow-luxury">
      <Link href={`/product/${product.slug}?variant=${selectedVariant?.id || ""}`} className="relative aspect-[4/5] overflow-hidden bg-linen">
        <motion.img key={image} initial={{ opacity: 0.78, scale: 1.02 }} animate={{ opacity: 1, scale: 1 }} src={image} alt={product.name} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
        {product.discountPrice && <span className="absolute left-4 top-4 bg-aubergine px-3 py-2 text-xs font-semibold text-ivory">Private Offer</span>}
      </Link>
      <div className="grid gap-3 p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="serif-title text-2xl text-aubergine">{product.name}</h3>
            <p className="mt-1 text-sm text-onyx/62">{selectedVariant?.colorName || "Molarè"}</p>
          </div>
          <ArrowUpRight className="mt-1 text-champagne transition group-hover:translate-x-1 group-hover:-translate-y-1" size={20} />
        </div>
        {variants.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {variants.map((variant) => (
              <button
                key={variant.id}
                aria-label={`Preview ${variant.colorName}`}
                onMouseEnter={() => setSelectedVariantId(variant.id)}
                onClick={() => setSelectedVariantId(variant.id)}
                className={`h-5 w-5 border transition ${selectedVariant?.id === variant.id ? "border-aubergine ring-2 ring-champagne/45" : "border-champagne/40"}`}
                style={{ backgroundColor: variant.colorHex }}
              />
            ))}
          </div>
        )}
        <div className="flex items-center gap-3">
          <span className="font-semibold text-onyx">{formatCurrency(price)}</span>
          {product.discountPrice && <span className="text-sm text-onyx/45 line-through">{formatCurrency(product.price)}</span>}
        </div>
      </div>
    </motion.article>
  );
}
