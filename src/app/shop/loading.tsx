import { ProductGridSkeleton, Skeleton } from "@/components/Skeleton";

export default function ShopLoading() {
  return (
    <section className="luxury-container py-12">
      <Skeleton className="h-4 w-40" />
      <Skeleton className="mt-4 h-14 w-80 max-w-full" />
      <div className="mt-10">
        <ProductGridSkeleton count={6} />
      </div>
    </section>
  );
}
