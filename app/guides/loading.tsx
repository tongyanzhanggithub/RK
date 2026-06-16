import { CardGridSkeleton, PageHeaderSkeleton } from "@/components/skeletons";

export default function Loading() {
  return (
    <main className="px-4 py-10">
      <div className="mx-auto max-w-7xl">
        <PageHeaderSkeleton />
        <div className="mt-8">
          <CardGridSkeleton count={4} />
        </div>
      </div>
    </main>
  );
}
