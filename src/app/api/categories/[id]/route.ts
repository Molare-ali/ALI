import { NextResponse } from "next/server";
import { readData, slugify, writeData } from "@/lib/db";

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const body = await request.json();
  const data = await readData();
  const index = data.categories.findIndex((item) => item.id === id);
  if (index === -1) return NextResponse.json({ error: "Category not found." }, { status: 404 });
  data.categories[index] = {
    ...data.categories[index],
    name: String(body.name),
    slug: slugify(String(body.name)),
    description: String(body.description)
  };
  await writeData(data);
  return NextResponse.json(data.categories[index]);
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const data = await readData();
  const hasProducts = data.products.some((product) => product.categoryId === id);
  if (hasProducts) {
    return NextResponse.json({ error: "Move or delete products in this category first." }, { status: 409 });
  }
  data.categories = data.categories.filter((item) => item.id !== id);
  await writeData(data);
  return NextResponse.json({ ok: true });
}
