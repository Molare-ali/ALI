import { NextResponse } from "next/server";
import { createSessionToken, getSessionCookieOptions, sessionCookieName } from "@/lib/auth";
import { createUserWithPasswordHash, findUserAuthByEmail, id } from "@/lib/db";
import { hashPassword, toSafeUser } from "@/lib/user-auth";

export async function POST(request: Request) {
  const body = await request.json();
  const fullName = String(body.fullName || "").trim();
  const email = String(body.email || "").toLowerCase().trim();
  const password = String(body.password || "");
  const phone = String(body.phone || "").trim();

  if (!fullName || !email || password.length < 6) {
    return NextResponse.json({ error: "Name, valid email, and a 6 character password are required." }, { status: 400 });
  }

  const existingUser = await findUserAuthByEmail(email);
  if (existingUser) {
    return NextResponse.json({ error: "This email is already registered." }, { status: 409 });
  }

  const user = { id: id("user"), fullName, email, phone, role: "customer" as const, passwordHash: await hashPassword(password) };
  await createUserWithPasswordHash(user);

  const safeUser = toSafeUser(user);
  const response = NextResponse.json({ user: safeUser }, { status: 201 });
  response.cookies.set(sessionCookieName, await createSessionToken(safeUser), getSessionCookieOptions());
  return response;
}
