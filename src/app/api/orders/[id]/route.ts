import { NextResponse } from "next/server";
import { readData, writeData } from "@/lib/db";
import type { OrderStatus } from "@/lib/types";

const statuses: OrderStatus[] = ["Pending", "Confirmed", "Preparing", "Delivered", "Cancelled"];

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const body = await request.json();
  const status = body.status as OrderStatus;
  if (!statuses.includes(status)) {
    return NextResponse.json({ error: "Invalid order status." }, { status: 400 });
  }
  const data = await readData();
  const order = data.orders.find((item) => item.id === id);
  if (!order) return NextResponse.json({ error: "Order not found." }, { status: 404 });
  order.status = status;
  await writeData(data);
  return NextResponse.json(order);
}
