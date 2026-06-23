import { NextResponse } from "next/server";
import { readData } from "@/lib/db";

export async function POST(request: Request) {
  const body = await request.json();
  const email = String(body.email || "").toLowerCase().trim();
  const password = String(body.password || "");
  const data = await readData();
  const user = data.users.find((item) => item.email.toLowerCase() === email && item.password === password);

  if (!user) {
    return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  }

  const safeUser = {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    phone: user.phone,
    role: user.role
  };
  return NextResponse.json({ user: safeUser });
}
