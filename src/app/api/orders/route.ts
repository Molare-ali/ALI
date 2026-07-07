import { NextResponse } from "next/server";
import { errorResponse } from "@/lib/api-response";
import { getAuthErrorResponse, requireAdmin } from "@/lib/auth";
import { id, readData, writeData } from "@/lib/db";
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
    const body = await request.json();
    if (!body.customerName || !body.customerPhone || !body.city || !body.address || !Array.isArray(body.items) || !body.items.length) {
      return NextResponse.json({ error: "Customer details and at least one cart item are required." }, { status: 400 });
    }

    const total = Number(body.total || 0);
    if (!Number.isFinite(total) || total < 0) {
      return NextResponse.json({ error: "Order total must be a valid non-negative number." }, { status: 400 });
    }

    const data = await readData();
    const order: Order = {
      id: id("order"),
      orderNumber: `MOL-${new Date().getFullYear()}-${String(data.orders.length + 1).padStart(4, "0")}`,
      customerId: String(body.customerId || ""),
      customerName: String(body.customerName),
      customerPhone: String(body.customerPhone),
      city: String(body.city),
      address: String(body.address),
      notes: String(body.notes || ""),
      items: body.items,
      total,
      status: "Pending",
      createdAt: new Date().toISOString()
    };
    data.orders.unshift(order);
    await writeData(data);

    return NextResponse.json({ order, whatsappLink: buildWhatsAppLink(data.settings, order) }, { status: 201 });
  } catch (error) {
    return errorResponse(error, 500, "Unable to create order.");
  }
}
