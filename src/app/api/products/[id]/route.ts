import { NextResponse } from "next/server";
import { errorResponse } from "@/lib/api-response";
import { id as nextId, readData, slugify, writeData } from "@/lib/db";
import { normalizeProductPayload } from "@/lib/product-validation";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id: productId } = await context.params;
    const data = await readData();
    const product = data.products.find((item) => item.id === productId);
    if (!product) return NextResponse.json({ error: "Product not found." }, { status: 404 });
    return NextResponse.json(product);
  } catch (error) {
    return errorResponse(error, 500, "Unable to load product.");
  }
}

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id: productId } = await context.params;
    const body = await request.json();
    const validation = normalizeProductPayload(body);
    if (!validation.ok) return NextResponse.json({ error: validation.error }, { status: 400 });
    const payload = validation.product;

    const data = await readData();
    const index = data.products.findIndex((item) => item.id === productId);
    if (index === -1) return NextResponse.json({ error: "Product not found." }, { status: 404 });

    const product = {
      ...data.products[index],
      name: payload.name,
      slug: slugify(payload.name),
      description: payload.description,
      price: payload.price,
      discountPrice: payload.discountPrice,
      categoryId: payload.categoryId,
      images: payload.images.length ? payload.images : data.products[index].images,
      sizes: payload.sizes.length ? payload.sizes : data.products[index].sizes,
      colors: payload.colors.length ? payload.colors : data.products[index].colors,
      stockQuantity: payload.stockQuantity,
      variants: payload.variants.map((variant) => ({ ...variant, id: variant.id || nextId("var") })),
      featured: payload.featured,
      active: payload.active
    };
    data.products[index] = product;
    await writeData(data);
    return NextResponse.json(data.products[index]);
  } catch (error) {
    return errorResponse(error, 500, "Unable to update product.");
  }
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id: productId } = await context.params;
    const data = await readData();
    const exists = data.products.some((item) => item.id === productId);
    if (!exists) return NextResponse.json({ error: "Product not found." }, { status: 404 });
    data.products = data.products.filter((item) => item.id !== productId);
    await writeData(data);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return errorResponse(error, 500, "Unable to delete product.");
  }
}
