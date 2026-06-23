import { Skeleton } from "@/components/Skeleton";

export default function AdminLoading() {
  return (
    <section className="luxury-container py-10">
      <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
        <Skeleton className="h-80 w-full" />
        <div>
          <Skeleton className="h-14 w-72" />
          <div className="mt-8 grid gap-4 md:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-32 w-full" />)}
          </div>
        </div>
      </div>
    </section>
  );
}
