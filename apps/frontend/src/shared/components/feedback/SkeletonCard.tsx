import { cn } from '../../lib/utils';
const Shimmer = ({ className }: { className?: string }) => (
  <div className={cn('animate-pulse rounded-md', className)} style={{ backgroundColor:'var(--color-surface-2)' }} />
);
export const SkeletonCard = () => (
  <div className="rounded-xl border p-5 space-y-4" style={{ backgroundColor:'var(--color-surface)', borderColor:'var(--color-border)' }}>
    <div className="flex items-center gap-3"><Shimmer className="h-10 w-10 rounded-xl" /><div className="space-y-2 flex-1"><Shimmer className="h-4 w-32" /><Shimmer className="h-3 w-20" /></div></div>
    <Shimmer className="h-2 w-full rounded-full" />
  </div>
);
export const SkeletonList = ({ count = 3 }: { count?: number }) => (
  <div className="space-y-3">{Array.from({ length: count }).map((_, i) => <SkeletonCard key={i} />)}</div>
);
export const PageLoader = () => (
  <div className="flex h-full min-h-[400px] items-center justify-center">
    <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--color-border)] border-t-[var(--color-accent)]" />
  </div>
);
