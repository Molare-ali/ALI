import { getProductImage, getProductVariants } from "./product-utils";
import type { CartItem, Order, Product } from "./types";

type OrderItemResult =
  | {
      ok: true;
      items: CartItem[];
      total: number;
    }
  | {
      ok: false;
      error: string;
    };

type OrderItemInput = {
  productId?: unknown;
  variantId?: unknown;
  size?: unknown;
  quantity?: unknown;
};

function currentVariantPrice(product: Product, variant: ReturnType<typeof getProductVariants>[number]) {
  return variant.priceOverride ?? product.discountPrice ?? product.price;
}

function parseQuantity(value: unknown) {
  const quantity = Number(value);
  if (!Number.isInteger(quantity) || quantity < 1) return null;
  return quantity;
}

export function buildOwnedOrderItems(products: Product[], rawItems: unknown): OrderItemResult {
  if (!Array.isArray(rawItems) || rawItems.length === 0) {
    return { ok: false, error: "At least one cart item is required." };
  }

  const productsById = new Map(products.map((product) => [product.id, product]));
  const requestedQuantityByVariant = new Map<string, number>();
  const items: CartItem[] = [];

  for (const rawItem of rawItems) {
    const item = rawItem as OrderItemInput;
    const productId = typeof item.productId === "string" ? item.productId : "";
    const variantId = typeof item.variantId === "string" ? item.variantId : "";
    const size = typeof item.size === "string" ? item.size : "";
    const quantity = parseQuantity(item.quantity);

    if (!productId || !variantId || !size || !quantity) {
      return { ok: false, error: "Each cart item must include product, variant, size, and quantity." };
    }

    const product = productsById.get(productId);
    if (!product || product.active === false) {
      return { ok: false, error: "One or more products are no longer available." };
    }

    const variant = getProductVariants(product).find((candidate) => candidate.id === variantId);
    if (!variant || variant.active === false) {
      return { ok: false, error: "Selected product variant is not available." };
    }

    if (!variant.sizes.includes(size)) {
      return { ok: false, error: "Selected size is not available." };
    }

    const nextRequestedQuantity = (requestedQuantityByVariant.get(variant.id) || 0) + quantity;
    requestedQuantityByVariant.set(variant.id, nextRequestedQuantity);
    if (nextRequestedQuantity > variant.stock) {
      return { ok: false, error: "Requested quantity is not available." };
    }

    const price = currentVariantPrice(product, variant);
    items.push({
      productId: product.id,
      variantId: variant.id,
      name: product.name,
      slug: product.slug,
      image: getProductImage(product, variant),
      size,
      color: variant.colorName,
      colorHex: variant.colorHex,
      quantity,
      price,
      sku: variant.sku
    });
  }

  return {
    ok: true,
    items,
    total: items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  };
}

export function filterOrdersForCustomer(orders: Order[], customerId: string) {
  return orders.filter((order) => order.customerId === customerId);
}
