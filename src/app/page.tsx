import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { readData } from "@/lib/db";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/Button";
import { Reveal } from "@/components/Reveal";

export default async function HomePage() {
  const { products, categories } = await readData();
  const featured = products.filter((product) => product.featured && product.active).slice(0, 3);

  return (
    <>
      <section className="relative overflow-hidden bg-aubergine text-ivory">
        <div className="absolute inset-0 opacity-42">
          <img src="https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=1800&q=85" alt="Molarè tailoring mood" className="h-full w-full object-cover" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-aubergine via-aubergine/88 to-plum/42" />
        <div className="luxury-container relative grid min-h-[calc(100vh-80px)] content-center gap-8 py-20">
          <Reveal className="max-w-3xl">
            <p className="fine-label mb-5 text-softPurple">Luxury Italian Sartorial Fashion</p>
            <h1 className="serif-title text-5xl leading-tight text-ivory sm:text-7xl">Refined Clothing for a Modern Wardrobe</h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-ivory/78">Sartorial elegance, polished into character.</p>
            <div className="mt-9 flex flex-wrap gap-4">
              <Button href="/shop">Shop Collection <ArrowRight size={18} /></Button>
              <Button href="/contact" variant="secondary" className="border-ivory/70 text-ivory hover:bg-ivory/10">Contact Us</Button>
            </div>
          </Reveal>
          <Reveal delay={0.12} className="mt-10 grid max-w-4xl grid-cols-1 border-y border-ivory/25 py-5 sm:grid-cols-3">
            {["Aubergine tailoring", "Purple accents", "Clean ivory restraint"].map((item) => (
              <div key={item} className="flex items-center gap-3 py-2 text-sm text-ivory/84">
                <Sparkles size={16} className="text-softPurple" />
                <span>{item}</span>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      <Reveal className="luxury-container py-20">
        <div className="mb-9 flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="fine-label text-plum">Featured Products</p>
            <h2 className="serif-title text-4xl text-aubergine">The Current Edit</h2>
          </div>
          <Link href="/shop" className="fine-label text-aubergine">View All</Link>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {featured.map((product) => <ProductCard key={product.id} product={product} />)}
        </div>
      </Reveal>

      <section className="bg-plum py-18 text-ivory">
        <Reveal className="luxury-container grid gap-6 py-16 md:grid-cols-4">
          {categories.map((category) => (
            <Link key={category.id} href={`/shop?category=${category.slug}`} className="group border border-ivory/25 p-6 transition hover:bg-ivory hover:text-aubergine">
              <p className="fine-label text-softPurple group-hover:text-plum">Category</p>
              <h3 className="serif-title mt-8 text-3xl">{category.name}</h3>
              <p className="mt-3 text-sm leading-6 opacity-75">{category.description}</p>
            </Link>
          ))}
        </Reveal>
      </section>

      <Reveal className="luxury-container grid gap-10 py-20 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
        <div className="aspect-[4/5] overflow-hidden border border-aubergine/30 bg-linen">
          <img src="https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1400&q=85" alt="Molarè sartorial detail" className="h-full w-full object-cover" />
        </div>
        <div className="grid gap-6">
          <p className="fine-label text-plum">Brand Story</p>
          <h2 className="serif-title text-5xl leading-tight text-aubergine">We do not make clothing. We refine cloth into character.</h2>
          <p className="max-w-2xl text-lg leading-8 text-onyx/70">Molarè is built around precise silhouettes, warm restraint, and details that do not ask for attention before they earn it. Each piece is designed to feel composed, personal, and quietly memorable.</p>
        </div>
      </Reveal>
    </>
  );
}
