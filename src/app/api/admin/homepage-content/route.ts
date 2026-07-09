import { NextResponse } from "next/server";
import { errorResponse } from "@/lib/api-response";
import { getAuthErrorResponse, requireAdmin } from "@/lib/auth";
import { normalizeHomepageContentInput } from "@/lib/homepage-content";
import { updateHomepageContent } from "@/lib/db";

export async function PUT(request: Request) {
  try {
    await requireAdmin();
    const body = await request.json();
    const validation = normalizeHomepageContentInput(body);

    if (!validation.ok) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    return NextResponse.json(await updateHomepageContent(validation.content));
  } catch (error) {
    const authResponse = getAuthErrorResponse(error);
    if (authResponse) return authResponse;
    return errorResponse(error, 500, "Unable to save homepage content.");
  }
}
