import type { Product, ProductVariant } from "./types";

const fallbackImage =
  "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=1200&q=85";

export function getProductVariants(product: Product): ProductVariant[] {
  if (product.variants?.length) {
    return product.variants.filter((variant) => variant.active !== false);
  }

  const colors = product.colors?.length ? product.colors : ["Onyx"];
  const sizes = product.sizes?.length ? product.sizes : ["S", "M", "L", "XL"];
  const images = product.images?.length ? product.images : [fallbackImage];

  return colors.map((colorName, index) => ({
    id: `${product.id}-${colorName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
    colorName,
    colorHex: colorName.toLowerCase().includes("aubergine")
      ? "#2D1B3D"
      : colorName.toLowerCase().includes("purple") || colorName.toLowerCase().includes("plum")
        ? "#5A2D82"
        : colorName.toLowerCase().includes("ivory") || colorName.toLowerCase().includes("avorio")
          ? "#F5F1EA"
          : "#1A1A1A",
    images: [images[index] || images[0]],
    sizes,
    stock: product.stockQuantity || 0,
    active: true
  }));
}

export function getDefaultVariant(product: Product, variantId?: string | null) {
  const variants = getProductVariants(product);
  return variants.find((variant) => variant.id === variantId) || variants[0];
}

export function getVariantPrice(product: Product, variant?: ProductVariant) {
  return variant?.priceOverride || product.discountPrice || product.price;
}

export function getProductImage(product: Product, variant?: ProductVariant) {
  return variant?.images?.[0] || product.images?.[0] || fallbackImage;
}

export function getProductStock(product: Product) {
  const variants = getProductVariants(product);
  if (variants.length) return variants.reduce((sum, variant) => sum + variant.stock, 0);
  return product.stockQuantity || 0;
}

export function normalizeVariants(product: Product): ProductVariant[] {
  return getProductVariants(product).map((variant) => ({
    ...variant,
    images: variant.images?.length ? variant.images : [getProductImage(product, variant)],
    sizes: variant.sizes?.length ? variant.sizes : product.sizes || ["S", "M", "L", "XL"],
    stock: Number(variant.stock || 0),
    active: variant.active !== false
  }));
}
