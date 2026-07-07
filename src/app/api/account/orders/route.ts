import { NextResponse } from "next/server";
import { errorResponse } from "@/lib/api-response";
import { getAuthErrorResponse, requireUser } from "@/lib/auth";
import { readData } from "@/lib/db";
import { filterOrdersForCustomer } from "@/lib/order-security";

export async function GET() {
  try {
    const user = await requireUser();
    const data = await readData();
    return NextResponse.json(filterOrdersForCustomer(data.orders, user.id));
  } catch (error) {
    const authResponse = getAuthErrorResponse(error);
    if (authResponse) return authResponse;
    return errorResponse(error, 500, "Unable to load account orders.");
  }
}
