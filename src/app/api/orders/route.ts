import { NextResponse } from "next/server";
import { errorResponse } from "@/lib/api-response";
import { getAuthErrorResponse, requireAdmin, requireUser } from "@/lib/auth";
import { id, readData, writeData } from "@/lib/db";
import { buildOwnedOrderItems } from "@/lib/order-security";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import type { Order } from "@/lib/types";

export async function GET() {
  try {
    await requireAdmin();
    const data = await readData();
    return NextResponse.json(data.orders);
  } catch (error) {
    const authResponse = getAuthErrorResponse(error);
    if (authResponse) return authResponse;
    return errorResponse(error, 500, "Unable to load orders.");
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const body = await request.json();
    if (!body.customerPhone || !body.city || !body.address) {
      return NextResponse.json({ error: "Customer phone, city, and address are required." }, { status: 400 });
    }

    const data = await readData();
    const orderItems = buildOwnedOrderItems(data.products, body.items);
    if (!orderItems.ok) {
      return NextResponse.json({ error: orderItems.error }, { status: 400 });
    }

    const customerPhone = String(body.customerPhone || user.phone || "");
    const order: Order = {
      id: id("order"),
      orderNumber: `MOL-${new Date().getFullYear()}-${String(data.orders.length + 1).padStart(4, "0")}`,
      customerId: user.id,
      customerName: user.fullName,
      customerPhone,
      city: String(body.city),
      address: String(body.address),
      notes: String(body.notes || ""),
      items: orderItems.items,
      total: orderItems.total,
      status: "Pending",
      createdAt: new Date().toISOString()
    };
    data.orders.unshift(order);
    await writeData(data);

    return NextResponse.json({ order, whatsappLink: buildWhatsAppLink(data.settings, order) }, { status: 201 });
  } catch (error) {
    const authResponse = getAuthErrorResponse(error);
    if (authResponse) return authResponse;
    return errorResponse(error, 500, "Unable to create order.");
  }
}
