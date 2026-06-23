import type { Order, StoreSettings } from "./types";

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(value);
}

export function buildOrderMessage(order: Order) {
  const items = order.items
    .map((item, index) => {
      const lineTotal = item.price * item.quantity;
      return `${index + 1}. ${item.name} - Size: ${item.size}, Color: ${item.color}${item.colorHex ? ` (${item.colorHex})` : ""}${item.sku ? `, SKU: ${item.sku}` : ""}, Qty: ${item.quantity}, Total: ${formatCurrency(lineTotal)}`;
    })
    .join("\n");

  return [
    `Molarè Order Invoice`,
    `Order number: ${order.orderNumber}`,
    `Customer name: ${order.customerName}`,
    `Customer phone: ${order.customerPhone}`,
    `Address: ${order.city}, ${order.address}`,
    `Items ordered:`,
    items,
    `Total price: ${formatCurrency(order.total)}`,
    `Notes: ${order.notes || "None"}`
  ].join("\n");
}

export function buildWhatsAppLink(settings: StoreSettings, order: Order) {
  const number = settings.whatsappNumber.replace(/[^\d]/g, "");
  return `https://wa.me/${number}?text=${encodeURIComponent(buildOrderMessage(order))}`;
}
