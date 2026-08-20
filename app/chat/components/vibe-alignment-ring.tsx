'use client'

import { cn } from '@/lib/utils'
import { vibeAlignmentRingColor, vibeAlignmentTextClass } from '@/lib/chat/vibe-alignment'

interface VibeAlignmentRingProps {
  percent: number
  className?: string
  size?: number
}

export function VibeAlignmentRing({ percent, className, size = 112 }: VibeAlignmentRingProps) {
  const clamped = Math.min(100, Math.max(0, Math.round(percent)))
  const stroke = 8
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (clamped / 100) * circumference
  const color = vibeAlignmentRingColor(clamped)

  return (
    <div
      className={cn('relative inline-flex items-center justify-center', className)}
      style={{ width: size, height: size }}
      role="img"
      aria-label={`${clamped}% compatibility`}
    >
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          className="text-slate-200 dark:text-slate-700"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-[stroke-dashoffset] duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn('text-2xl font-bold tabular-nums tracking-tight', vibeAlignmentTextClass(clamped))}>
          {clamped}%
        </span>
      </div>
    </div>
  )
}
