import { NextResponse } from "next/server";
import { errorResponse } from "@/lib/api-response";
import { getAuthErrorResponse, requireAdmin } from "@/lib/auth";
import { id, readData, slugify, writeData } from "@/lib/db";
import { normalizeProductPayload } from "@/lib/product-validation";
import type { Product } from "@/lib/types";

export async function GET() {
  try {
    const data = await readData();
    return NextResponse.json(data.products);
  } catch (error) {
    return errorResponse(error, 500, "Unable to load products.");
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const body = await request.json();
    const validation = normalizeProductPayload(body);
    if (!validation.ok) return NextResponse.json({ error: validation.error }, { status: 400 });
    const payload = validation.product;

    const data = await readData();
    const product: Product = {
      id: id("prod"),
      name: payload.name,
      slug: slugify(payload.name),
      description: payload.description,
      price: payload.price,
      discountPrice: payload.discountPrice,
      categoryId: payload.categoryId,
      images: payload.images,
      sizes: payload.sizes,
      colors: payload.colors,
      stockQuantity: payload.stockQuantity,
      variants: payload.variants.map((variant) => ({ ...variant, id: variant.id || id("var") })),
      featured: payload.featured,
      active: payload.active
    };
    data.products.unshift(product);
    await writeData(data);

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    const authResponse = getAuthErrorResponse(error);
    if (authResponse) return authResponse;
    return errorResponse(error, 500, "Unable to create product.");
  }
}
