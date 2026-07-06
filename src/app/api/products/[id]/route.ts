import { NextResponse } from "next/server";
import { errorResponse } from "@/lib/api-response";
import { readData, slugify, writeData } from "@/lib/db";
import { normalizeVariants } from "@/lib/product-utils";
import type { ProductVariant } from "@/lib/types";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const data = await readData();
    const product = data.products.find((item) => item.id === id);
    if (!product) return NextResponse.json({ error: "Product not found." }, { status: 404 });
    return NextResponse.json(product);
  } catch (error) {
    return errorResponse(error, 500, "Unable to load product.");
  }
}

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    if (!body.name || !body.description || !body.categoryId || !body.price) {
      return NextResponse.json({ error: "Product name, description, category, and price are required." }, { status: 400 });
    }
    if (!Number.isFinite(Number(body.price)) || Number(body.price) < 0) {
      return NextResponse.json({ error: "Product price must be a valid non-negative number." }, { status: 400 });
    }
    if (body.discountPrice && (!Number.isFinite(Number(body.discountPrice)) || Number(body.discountPrice) > Number(body.price))) {
      return NextResponse.json({ error: "Discount price must be a valid number less than or equal to base price." }, { status: 400 });
    }

    const data = await readData();
    const index = data.products.findIndex((item) => item.id === id);
    if (index === -1) return NextResponse.json({ error: "Product not found." }, { status: 404 });

    const product = {
      ...data.products[index],
      name: String(body.name),
      slug: slugify(String(body.name)),
      description: String(body.description),
      price: Number(body.price),
      discountPrice: body.discountPrice ? Number(body.discountPrice) : undefined,
      categoryId: String(body.categoryId),
      images: Array.isArray(body.images) && body.images.length ? body.images : data.products[index].images,
      sizes: Array.isArray(body.sizes) && body.sizes.length ? body.sizes : data.products[index].sizes,
      colors: Array.isArray(body.colors) && body.colors.length ? body.colors : data.products[index].colors,
      stockQuantity: Number(body.stockQuantity || 0),
      variants: Array.isArray(body.variants)
        ? body.variants.map((variant: ProductVariant) => ({ ...variant, id: variant.id?.trim() || "" }))
        : data.products[index].variants,
      featured: Boolean(body.featured),
      active: Boolean(body.active)
    };
    data.products[index] = { ...product, variants: normalizeVariants(product) };
    await writeData(data);
    return NextResponse.json(data.products[index]);
  } catch (error) {
    return errorResponse(error, 500, "Unable to update product.");
  }
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const data = await readData();
    const exists = data.products.some((item) => item.id === id);
    if (!exists) return NextResponse.json({ error: "Product not found." }, { status: 404 });
    data.products = data.products.filter((item) => item.id !== id);
    await writeData(data);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return errorResponse(error, 500, "Unable to delete product.");
  }
}
