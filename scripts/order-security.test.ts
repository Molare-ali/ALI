import assert from "node:assert/strict";
import { buildOwnedOrderItems, filterOrdersForCustomer } from "../src/lib/order-security";
import type { Order, Product } from "../src/lib/types";

const products: Product[] = [
  {
    id: "prod-1",
    name: "Silk Jacket",
    slug: "silk-jacket",
    description: "A jacket.",
    price: 120,
    discountPrice: 100,
    categoryId: "cat-1",
    images: ["/product.jpg"],
    sizes: ["S", "M"],
    colors: ["Onyx"],
    stockQuantity: 5,
    variants: [
      {
        id: "var-1",
        colorName: "Onyx",
        colorHex: "#111111",
        images: ["/variant.jpg"],
        sizes: ["S", "M"],
        stock: 3,
        sku: "JACKET-ONYX",
        priceOverride: 90,
        active: true
      }
    ],
    featured: false,
    active: true
  }
];

const orders: Order[] = [
  {
    id: "order-1",
    orderNumber: "MOL-2026-0001",
    customerId: "user-1",
    customerName: "Customer One",
    customerPhone: "+1",
    city: "A",
    address: "A",
    items: [],
    total: 0,
    status: "Pending",
    createdAt: "2026-07-07T00:00:00.000Z"
  },
  {
    id: "order-2",
    orderNumber: "MOL-2026-0002",
    customerId: "user-2",
    customerName: "Customer Two",
    customerPhone: "+2",
    city: "B",
    address: "B",
    items: [],
    total: 0,
    status: "Confirmed",
    createdAt: "2026-07-07T00:00:00.000Z"
  }
];

{
  const result = buildOwnedOrderItems(products, [
    {
      productId: "prod-1",
      variantId: "var-1",
      name: "Tampered",
      slug: "tampered",
      image: "/tampered.jpg",
      size: "M",
      color: "Fake",
      quantity: 2,
      price: 1
    }
  ]);

  assert.equal(result.ok, true);
  assert.deepEqual(result.items, [
    {
      productId: "prod-1",
      variantId: "var-1",
      name: "Silk Jacket",
      slug: "silk-jacket",
      image: "/variant.jpg",
      size: "M",
      color: "Onyx",
      colorHex: "#111111",
      quantity: 2,
      price: 90,
      sku: "JACKET-ONYX"
    }
  ]);
  assert.equal(result.total, 180);
}

{
  const result = buildOwnedOrderItems(products, [{ productId: "prod-1", variantId: "var-1", size: "L", quantity: 1 }]);
  assert.deepEqual(result, { ok: false, error: "Selected size is not available." });
}

{
  const result = buildOwnedOrderItems(products, [{ productId: "prod-1", variantId: "var-1", size: "M", quantity: 4 }]);
  assert.deepEqual(result, { ok: false, error: "Requested quantity is not available." });
}

{
  assert.deepEqual(filterOrdersForCustomer(orders, "user-1"), [orders[0]]);
}

console.log("order security tests passed");
