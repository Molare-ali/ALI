import { NextResponse } from "next/server";
import { errorResponse } from "@/lib/api-response";
import { getHomepageContent } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return NextResponse.json(await getHomepageContent(), {
      headers: {
        "Cache-Control": "no-store"
      }
    });
  } catch (error) {
    return errorResponse(error, 500, "Unable to load homepage content.");
  }
}
