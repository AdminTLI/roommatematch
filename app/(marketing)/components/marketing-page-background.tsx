'use client'

import { useReducedMotion } from 'framer-motion'
import { cn } from '@/lib/utils'

/**
 * Full-page background: dark base + vertical gradient overlay + blur orbs.
 */
export function MarketingPageBackground() {
  const reducedMotion = useReducedMotion()

  return (
    <div
      className="fixed inset-0 z-0 bg-slate-950"
      aria-hidden
    >
      <div
        className="absolute inset-0 bg-gradient-to-b from-indigo-950/30 via-transparent to-purple-950/20 pointer-events-none"
        aria-hidden
      />
      {/* Blur orbs – decorative gradient accents */}
      <div className="pointer-events-none absolute inset-0">
        <div
          className={cn(
            'absolute top-[15%] left-[10%] w-[600px] h-[600px] rounded-full bg-indigo-500/20 blur-[120px]',
            !reducedMotion && 'animate-pulse'
          )}
        />
        <div
          className={cn(
            'absolute bottom-[20%] right-[15%] w-[500px] h-[500px] rounded-full bg-purple-500/15 blur-[100px]',
            !reducedMotion && 'animate-pulse'
          )}
          style={!reducedMotion ? { animationDelay: '1s' } : undefined}
        />
        <div className="absolute top-[50%] right-[25%] w-[350px] h-[350px] rounded-full bg-purple-500/10 blur-[80px]" />
      </div>
    </div>
  )
}
