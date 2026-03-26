'use client'

import { useReducedMotion } from 'framer-motion'
import { cn } from '@/lib/utils'

type PastelMeshBackgroundProps = {
  className?: string
}

export function PastelMeshBackground({ className }: PastelMeshBackgroundProps) {
  const reducedMotion = useReducedMotion()

  return (
    <div
      aria-hidden
      className={cn('fixed inset-0 z-0 overflow-hidden', className)}
    >
      {/* Base wash */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_120%_80%_at_30%_10%,rgba(147,197,253,0.75),transparent_55%),radial-gradient(ellipse_120%_80%_at_70%_20%,rgba(196,181,253,0.70),transparent_55%),radial-gradient(ellipse_120%_90%_at_50%_100%,rgba(253,186,116,0.55),transparent_55%),linear-gradient(180deg,rgba(255,255,255,1),rgba(248,250,252,1))]" />

      {/* Slow drifting mesh blobs (disabled for reduced motion) */}
      <div className="absolute inset-0">
        <div
          className={cn(
            'absolute -top-40 -left-48 h-[520px] w-[520px] rounded-full blur-3xl opacity-60',
            'bg-[radial-gradient(circle_at_30%_30%,rgba(59,130,246,0.45),transparent_60%)]',
            !reducedMotion && 'dm-mesh-drift-1'
          )}
        />
        <div
          className={cn(
            'absolute top-24 -right-40 h-[560px] w-[560px] rounded-full blur-3xl opacity-55',
            'bg-[radial-gradient(circle_at_40%_40%,rgba(168,85,247,0.40),transparent_62%)]',
            !reducedMotion && 'dm-mesh-drift-2'
          )}
        />
        <div
          className={cn(
            'absolute -bottom-48 left-1/3 h-[640px] w-[640px] -translate-x-1/2 rounded-full blur-3xl opacity-55',
            'bg-[radial-gradient(circle_at_45%_55%,rgba(251,146,60,0.35),transparent_62%)]',
            !reducedMotion && 'dm-mesh-drift-3'
          )}
        />
        <div
          className={cn(
            'absolute top-1/2 left-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl opacity-35',
            'bg-[radial-gradient(circle_at_55%_45%,rgba(244,114,182,0.25),transparent_65%)]',
            !reducedMotion && 'dm-mesh-drift-4'
          )}
        />
      </div>

      {/* Subtle grain (kept very light) */}
      <div className="absolute inset-0 dm-noise-soft" />

      {/* Edge vignette removed: navbar must remain fully transparent */}
    </div>
  )
}

