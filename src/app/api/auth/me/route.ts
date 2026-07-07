import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { sessionCookieName, verifySessionToken } from "@/lib/auth";

export async function GET() {
  const cookieStore = await cookies();
  const user = await verifySessionToken(cookieStore.get(sessionCookieName)?.value);

  if (!user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  return NextResponse.json({ user });
}
