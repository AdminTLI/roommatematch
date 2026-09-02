'use client'

import { Shield } from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'

interface DealbreakerBadgeProps {
  index: number
  total: number
  /** Full explanation — only on the first dealbreaker in the module. */
  showExplanation?: boolean
  className?: string
}

export function DealbreakerBadge({
  index,
  total,
  showExplanation = false,
  className,
}: DealbreakerBadgeProps) {
  return (
    <div className={cn('mb-5 space-y-3', className)}>
      <span
        className={cn(
          'inline-flex items-center gap-1.5 rounded-full bg-[#FEF3C7] px-3 py-1.5 text-xs font-semibold text-[#92400E]',
          'dark:bg-amber-950 dark:text-amber-200 dark:ring-1 dark:ring-amber-800/80'
        )}
      >
        <Shield className="h-4 w-4 shrink-0" strokeWidth={2.25} aria-hidden />
        Dealbreaker · {index} of {total}
      </span>

      {showExplanation ? (
        <p className="text-sm font-medium leading-relaxed text-slate-600 dark:text-slate-300">
          We&apos;ll only show roommates who gave the same answer.
        </p>
      ) : null}
    </div>
  )
}

interface DealbreakerMatchToggleProps {
  itemId: string
  enabled: boolean
  onEnabledChange: (enabled: boolean) => void
  className?: string
}

export function DealbreakerMatchToggle({
  itemId,
  enabled,
  onEnabledChange,
  className,
}: DealbreakerMatchToggleProps) {
  const switchId = `dealbreaker-match-${itemId}`

  return (
    <div
      className={cn(
        'mt-6 space-y-2 border-t border-slate-100 pt-5 dark:border-slate-700',
        className
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <label
          htmlFor={switchId}
          className="min-w-0 cursor-pointer text-sm font-semibold leading-snug text-[#0F172A] dark:text-slate-50"
        >
          Only match people who answered the same
        </label>
        <Switch
          id={switchId}
          checked={enabled}
          onCheckedChange={onEnabledChange}
          className="data-[state=checked]:bg-amber-600 dark:data-[state=checked]:bg-amber-500"
        />
      </div>

      {enabled ? null : (
        <p className="text-xs font-medium leading-relaxed text-slate-500 dark:text-slate-400">
          Your answer will still be considered in matching, just not as a strict filter.
        </p>
      )}
    </div>
  )
}
