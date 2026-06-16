export function Skeleton({ className = "" }: { className?: string }) {
  return <span className={`skeleton block ${className}`} aria-hidden="true" />;
}

export function ProductCardSkeleton() {
  return (
    <div className="grid min-h-[360px] border border-line bg-white p-5">
      <Skeleton className="mb-4 aspect-[4/3] w-full" />
      <Skeleton className="mb-3 h-4 w-24" />
      <Skeleton className="mb-2 h-5 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <div className="mt-auto flex items-center justify-between gap-3 pt-5">
        <Skeleton className="h-6 w-20" />
        <Skeleton className="h-9 w-24" />
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 6, cols = "lg:grid-cols-3" }: { count?: number; cols?: string }) {
  return (
    <div className={`grid gap-4 md:grid-cols-2 ${cols}`}>
      {Array.from({ length: count }).map((_, index) => (
        <ProductCardSkeleton key={index} />
      ))}
    </div>
  );
}

export function CardGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="border border-line bg-white p-6">
          <Skeleton className="mb-4 h-7 w-7" />
          <Skeleton className="mb-2 h-5 w-2/3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="mt-3 h-4 w-1/2" />
        </div>
      ))}
    </div>
  );
}

/** Page-level header skeleton (title + intro). */
export function PageHeaderSkeleton() {
  return (
    <div>
      <Skeleton className="h-10 w-72" />
      <Skeleton className="mt-3 h-4 w-full max-w-2xl" />
    </div>
  );
}
