import { NextResponse } from "next/server";
import { errorResponse } from "@/lib/api-response";
import { readData, slugify, writeData } from "@/lib/db";

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    if (!body.name || !body.description) {
      return NextResponse.json({ error: "Category name and description are required." }, { status: 400 });
    }
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
  } catch (error) {
    return errorResponse(error, 500, "Unable to update category.");
  }
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const data = await readData();
    const exists = data.categories.some((item) => item.id === id);
    if (!exists) return NextResponse.json({ error: "Category not found." }, { status: 404 });
    const hasProducts = data.products.some((product) => product.categoryId === id);
    if (hasProducts) {
      return NextResponse.json({ error: "Move or delete products in this category first." }, { status: 409 });
    }
    data.categories = data.categories.filter((item) => item.id !== id);
    await writeData(data);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return errorResponse(error, 500, "Unable to delete category.");
  }
}
