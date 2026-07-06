import { NextResponse } from "next/server";
import { errorResponse } from "@/lib/api-response";
import { readData, writeData } from "@/lib/db";
import type { StoreSettings } from "@/lib/types";

export async function GET() {
  try {
    const data = await readData();
    return NextResponse.json(data.settings);
  } catch (error) {
    return errorResponse(error, 500, "Unable to load settings.");
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    if (!body.whatsappNumber || !body.contactPhone || !body.contactEmail || !body.storeAddress) {
      return NextResponse.json({ error: "WhatsApp number, contact phone, contact email, and store address are required." }, { status: 400 });
    }
    const data = await readData();
    data.settings = {
      whatsappNumber: String(body.whatsappNumber || "").replace(/[^\d]/g, ""),
      contactPhone: String(body.contactPhone || ""),
      contactEmail: String(body.contactEmail || ""),
      storeAddress: String(body.storeAddress || ""),
      instagramLink: String(body.instagramLink || ""),
      facebookLink: String(body.facebookLink || ""),
      tiktokLink: String(body.tiktokLink || ""),
      snapchatLink: String(body.snapchatLink || "")
    } satisfies StoreSettings;
    await writeData(data);
    return NextResponse.json(data.settings);
  } catch (error) {
    return errorResponse(error, 500, "Unable to save settings.");
  }
}
