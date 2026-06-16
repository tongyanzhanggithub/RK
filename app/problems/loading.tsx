import { CardGridSkeleton, PageHeaderSkeleton, Skeleton } from "@/components/skeletons";

export default function Loading() {
  return (
    <main className="px-4 py-10">
      <div className="mx-auto max-w-7xl">
        <PageHeaderSkeleton />
        <Skeleton className="mt-8 h-20 w-full" />
        <Skeleton className="mt-5 h-4 w-32" />
        <div className="mt-4">
          <CardGridSkeleton count={6} />
        </div>
      </div>
    </main>
  );
}
