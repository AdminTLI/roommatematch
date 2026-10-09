import { cn } from '@/lib/utils'

/** Shared App Router loading UI — reserves header space to limit CLS. */
export function RouteLoadingSkeleton({
  variant = 'app',
}: {
  variant?: 'marketing' | 'app'
}) {
  const isMarketing = variant === 'marketing'

  return (
    <div
      className={cn(
        'min-h-[50vh] w-full animate-pulse',
        isMarketing ? 'bg-slate-50' : 'bg-transparent'
      )}
      aria-busy="true"
      aria-live="polite"
    >
      <div
        className={cn(
          'mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8',
          isMarketing ? 'pt-16 md:pt-20' : 'pt-4 sm:pt-6'
        )}
      >
        <div
          className={cn(
            'mb-6 h-8 rounded-xl',
            isMarketing ? 'w-2/3 max-w-md bg-slate-200/80' : 'w-1/2 max-w-sm bg-white/10'
          )}
        />
        <div
          className={cn(
            'mb-10 h-4 rounded-lg',
            isMarketing ? 'w-full max-w-xl bg-slate-200/60' : 'w-full max-w-lg bg-white/8'
          )}
        />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className={cn(
                'h-40 rounded-2xl sm:h-48',
                isMarketing ? 'bg-slate-200/70' : 'bg-white/10'
              )}
            />
          ))}
        </div>
      </div>
      <span className="sr-only">Loading…</span>
    </div>
  )
}
