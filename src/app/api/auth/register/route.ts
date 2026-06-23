import { NextResponse } from "next/server";
import { id, readData, writeData } from "@/lib/db";

export async function POST(request: Request) {
  const body = await request.json();
  const fullName = String(body.fullName || "").trim();
  const email = String(body.email || "").toLowerCase().trim();
  const password = String(body.password || "");
  const phone = String(body.phone || "").trim();

  if (!fullName || !email || password.length < 6) {
    return NextResponse.json({ error: "Name, valid email, and a 6 character password are required." }, { status: 400 });
  }

  const data = await readData();
  if (data.users.some((user) => user.email.toLowerCase() === email)) {
    return NextResponse.json({ error: "This email is already registered." }, { status: 409 });
  }

  const user = { id: id("user"), fullName, email, phone, role: "customer" as const, password };
  data.users.push(user);
  await writeData(data);
  const safeUser = {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    phone: user.phone,
    role: user.role
  };

  return NextResponse.json({ user: safeUser }, { status: 201 });
}
