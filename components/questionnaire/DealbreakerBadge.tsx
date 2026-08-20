'use client'

import { Zap } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DealbreakerBadgeProps {
  enabled?: boolean
  className?: string
}

/** Static indicator — explanation lives in HardGateModal after the user answers. */
export function DealbreakerBadge({ enabled, className }: DealbreakerBadgeProps) {
  return (
    <span
      className={cn(
        'mb-4 inline-flex items-center gap-1.5 rounded-full bg-[#FEF3C7] px-3 py-1.5 text-xs font-semibold text-[#92400E]',
        className
      )}
    >
      <Zap className="h-3.5 w-3.5 shrink-0" strokeWidth={2.25} aria-hidden />
      Dealbreaker Question
      {enabled ? <span className="font-bold"> · Enabled</span> : null}
    </span>
  )
}
