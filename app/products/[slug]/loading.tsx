import { Skeleton } from "@/components/skeletons";

export default function Loading() {
  return (
    <main className="px-4 py-10">
      <div className="mx-auto max-w-7xl">
        <Skeleton className="h-4 w-28" />
        <div className="mt-5 grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <Skeleton className="aspect-square w-full" />
          <div>
            <Skeleton className="h-4 w-28" />
            <Skeleton className="mt-2 h-10 w-3/4" />
            <Skeleton className="mt-4 h-4 w-full" />
            <Skeleton className="mt-2 h-4 w-5/6" />
            <Skeleton className="mt-6 h-24 w-full" />
            <Skeleton className="mt-6 h-10 w-40" />
            <Skeleton className="mt-5 h-12 w-full" />
            <Skeleton className="mt-3 h-11 w-full" />
          </div>
        </div>
      </div>
    </main>
  );
}
