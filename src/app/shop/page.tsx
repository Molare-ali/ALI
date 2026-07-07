import { readData } from "@/lib/db";
import { ProductCard } from "@/components/ProductCard";

export default async function ShopPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const { products, categories } = await readData();
  const { category } = await searchParams;
  const selected = categories.find((item) => item.slug === category);
  const visible = products.filter((product) => product.active && (!selected || product.categoryId === selected.id));

  return (
    <section className="luxury-container py-12">
      <div className="mb-10 grid gap-5 md:grid-cols-[1fr_auto] md:items-end">
        <div>
          <p className="fine-label text-plum">Shop Collection</p>
          <h1 className="serif-title text-5xl text-aubergine">{selected ? selected.name : "All Clothing"}</h1>
          <p className="mt-3 max-w-2xl text-onyx/68">Browse premium pieces as a guest. Login is only required when you are ready to place your order.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <a href="/shop" className="border border-aubergine/40 px-4 py-3 text-sm text-aubergine transition hover:bg-softPurple/15">All</a>
          {categories.map((item) => (
            <a key={item.id} href={`/shop?category=${item.slug}`} className="border border-aubergine/40 px-4 py-3 text-sm text-aubergine transition hover:bg-softPurple/15">{item.name}</a>
          ))}
        </div>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((product) => <ProductCard key={product.id} product={product} />)}
      </div>
    </section>
  );
}
