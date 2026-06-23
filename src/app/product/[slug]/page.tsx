import { notFound } from "next/navigation";
import { readData } from "@/lib/db";
import { ProductDetailClient } from "@/components/ProductDetailClient";

export default async function ProductPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ variant?: string }> }) {
  const { slug } = await params;
  const { variant } = await searchParams;
  const { products, categories } = await readData();
  const product = products.find((item) => item.slug === slug && item.active);
  if (!product) notFound();
  const category = categories.find((item) => item.id === product.categoryId);

  return <ProductDetailClient product={product} categoryName={category?.name || "Molarè"} initialVariantId={variant} />;
}
