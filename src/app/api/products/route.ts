import { NextResponse } from "next/server";
import { id, readData, slugify, writeData } from "@/lib/db";
import { normalizeVariants } from "@/lib/product-utils";
import type { Product, ProductVariant } from "@/lib/types";

export async function GET() {
  const data = await readData();
  return NextResponse.json(data.products);
}

export async function POST(request: Request) {
  const body = await request.json();
  if (!body.name || !body.description || !body.categoryId || !body.price) {
    return NextResponse.json({ error: "Product name, description, category, and price are required." }, { status: 400 });
  }

  const data = await readData();
  const product: Product = {
    id: id("prod"),
    name: String(body.name),
    slug: slugify(String(body.name)),
    description: String(body.description),
    price: Number(body.price),
    discountPrice: body.discountPrice ? Number(body.discountPrice) : undefined,
    categoryId: String(body.categoryId),
    images: Array.isArray(body.images) ? body.images : [],
    sizes: Array.isArray(body.sizes) ? body.sizes : [],
    colors: Array.isArray(body.colors) ? body.colors : [],
    stockQuantity: Number(body.stockQuantity || 0),
    variants: Array.isArray(body.variants) ? body.variants.map((variant: ProductVariant) => ({ ...variant, id: variant.id || id("var") })) : [],
    featured: Boolean(body.featured),
    active: Boolean(body.active)
  };
  product.variants = normalizeVariants(product);
  data.products.unshift(product);
  await writeData(data);

  return NextResponse.json(product, { status: 201 });
}
