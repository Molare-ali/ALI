import { NextResponse } from "next/server";
import { readData, writeData } from "@/lib/db";
import type { StoreSettings } from "@/lib/types";

export async function GET() {
  const data = await readData();
  return NextResponse.json(data.settings);
}

export async function PUT(request: Request) {
  const body = await request.json();
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
}
