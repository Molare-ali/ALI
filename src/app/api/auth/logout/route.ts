import { NextResponse } from "next/server";
import { getSessionCookieOptions, sessionCookieName } from "@/lib/auth";

export async function POST() {
  const response = NextResponse.json({ success: true });
  response.cookies.set(sessionCookieName, "", {
    ...getSessionCookieOptions(),
    maxAge: 0,
    expires: new Date(0)
  });
  return response;
}
