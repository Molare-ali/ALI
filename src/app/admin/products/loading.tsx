import { Skeleton } from "@/components/Skeleton";

export default function AdminProductsLoading() {
  return (
    <section className="luxury-container py-10">
      <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
        <Skeleton className="h-96 w-full" />
        <div>
          <Skeleton className="h-14 w-72" />
          <div className="mt-8 grid gap-6 xl:grid-cols-2">
            <Skeleton className="h-[680px] w-full" />
            <div className="grid gap-4">
              {Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-32 w-full" />)}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
