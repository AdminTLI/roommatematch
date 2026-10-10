'use client'

import { BadgeCheck } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

type VerifiedBadgeProps = {
  /** When false/undefined, render nothing (unverified = no chrome). */
  verified?: boolean | null
  className?: string
  /**
   * Icon scale. Use `lg` beside display headings, `md` beside card titles,
   * `sm` in dense chrome (sidebar, chat headers).
   */
  size?: 'sm' | 'md' | 'lg'
  /** Hover/focus explanation. Keep secondary — the icon carries the signal. */
  tooltip?: string
}

const ICON_CLASS = {
  sm: 'h-3.5 w-3.5',
  md: 'h-4 w-4',
  lg: 'h-5 w-5 md:h-6 md:w-6',
} as const

/**
 * Positive-only verification mark, following the X / Instagram / LinkedIn pattern:
 * icon immediately after the name, no "Verified" label, details on hover/focus.
 * Unverified users get no markup.
 */
export function VerifiedBadge({
  verified,
  className,
  size = 'sm',
  tooltip = 'Identity verified',
}: VerifiedBadgeProps) {
  if (!verified) return null

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          {/* span (not button) so this stays valid inside Links / other interactive parents */}
          <span
            tabIndex={0}
            role="img"
            aria-label={tooltip}
            className={cn(
              'inline-flex shrink-0 cursor-default items-center justify-center rounded-full',
              'text-emerald-600 transition-colors hover:text-emerald-700',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40 focus-visible:ring-offset-2',
              'dark:text-emerald-400 dark:hover:text-emerald-300 dark:focus-visible:ring-offset-zinc-950',
              className
            )}
          >
            <BadgeCheck
              className={cn(ICON_CLASS[size], 'fill-emerald-500/15')}
              aria-hidden
              strokeWidth={2.25}
            />
          </span>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-[220px] text-center">
          {tooltip}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
