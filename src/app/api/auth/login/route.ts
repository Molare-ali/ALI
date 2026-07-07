import { NextResponse } from "next/server";
import { createSessionToken, getSessionCookieOptions, sessionCookieName } from "@/lib/auth";
import { findUserAuthByEmail } from "@/lib/db";
import { toSafeUser, verifyPassword } from "@/lib/user-auth";

export async function POST(request: Request) {
  const body = await request.json();
  const email = String(body.email || "").toLowerCase().trim();
  const password = String(body.password || "");
  const user = await findUserAuthByEmail(email);
  const validPassword = user?.passwordHash ? await verifyPassword(password, user.passwordHash) : false;

  if (!user || !validPassword) {
    return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  }

  const safeUser = toSafeUser(user);
  const response = NextResponse.json({ user: safeUser });
  response.cookies.set(sessionCookieName, await createSessionToken(safeUser), getSessionCookieOptions());
  return response;
}
