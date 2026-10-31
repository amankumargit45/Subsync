import { cn } from '@/lib/utils';

export function LoadingSkeleton({ className, ...props }) {
  return <div className={cn('skeleton rounded', className)} {...props} />;
}

export function TableSkeleton({ rows = 5, cols = 5 }) {
  return (
    <div className="space-y-3">
      <div className="flex gap-4">
        {Array.from({ length: cols }).map((_, i) => (
          <LoadingSkeleton key={i} className="h-4 flex-1" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, row) => (
        <div key={row} className="flex gap-4 py-3 border-t border-surface-100 dark:border-surface-800">
          {Array.from({ length: cols }).map((_, col) => (
            <LoadingSkeleton key={col} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="card p-5 space-y-3">
      <LoadingSkeleton className="h-3 w-24" />
      <LoadingSkeleton className="h-8 w-32" />
      <LoadingSkeleton className="h-3 w-20" />
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <LoadingSkeleton className="h-8 w-48" />
        <LoadingSkeleton className="h-9 w-32" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
      <div className="card p-5">
        <TableSkeleton />
      </div>
    </div>
  );
}
